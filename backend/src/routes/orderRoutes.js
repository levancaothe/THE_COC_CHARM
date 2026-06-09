const express = require("express");
const router = express.Router();
const Charm = require("../models/Charm");
const Order = require("../models/Order");
const DiscountEvent = require("../models/DiscountEvent");

const { PayOS } = require("@payos/node");
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

const normalizeOrderItems = (items = []) =>
  items.map((item) => ({
    product: String(item?.product ?? item?._id ?? ""),
    productType:
      item?.productType === "BraceletDesign"
        ? "BraceletDesign"
        : item?.productType === "Collection"
          ? "Collection"
          : "Charm",
    designCharms: Array.isArray(item?.designCharms)
      ? item.designCharms.map(String)
      : [],
    designCharmDetails: Array.isArray(item?.designCharmDetails)
      ? item.designCharmDetails
      : [],
    quantity: Number(item?.quantity) || 1,
    price: Number(item?.price) || 0,
  }));

const buildCharmRequirements = (items = []) => {
  const requirements = new Map();

  items.forEach((item) => {
    const quantity = Math.max(1, Number(item?.quantity) || 1);

    if (item?.productType === "Charm") {
      const charmId = String(item?.product || "");
      if (!charmId) return;
      requirements.set(charmId, (requirements.get(charmId) || 0) + quantity);
      return;
    }

    if (
      (item?.productType === "BraceletDesign" ||
        item?.productType === "Collection") &&
      Array.isArray(item?.designCharms)
    ) {
      item.designCharms.forEach((charmId) => {
        const normalizedId = String(charmId || "");
        if (!normalizedId) return;
        requirements.set(
          normalizedId,
          (requirements.get(normalizedId) || 0) + quantity,
        );
      });
    }
  });

  return requirements;
};

const buildRequirementsFromInventoryImpact = (inventoryImpact = []) => {
  const requirements = new Map();

  inventoryImpact.forEach((entry) => {
    const charmId = String(entry?.charmId || "");
    const quantity = Math.max(1, Number(entry?.quantity) || 1);

    if (!charmId) return;
    requirements.set(charmId, (requirements.get(charmId) || 0) + quantity);
  });

  return requirements;
};

// --- CREATE ORDER ROUTE ---
router.post("/", async (req, res) => {
  const items = normalizeOrderItems(req.body.items);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // 🟢 2. GENERATE UNIQUE ORDER CODE FOR PAYOS
  const orderCode = Number(String(Date.now()).slice(-6));

  const payload = {
    ...req.body,
    orderCode, // Add the required orderCode
    items,
    createdAt: req.body.createdAt || new Date(),
  };

  // Securely resolve discount on backend
  let appliedDiscount = null;
  const now = new Date();

  if (req.body.discountCode && req.body.discountCode.trim() !== "") {
    const codeDiscount = await DiscountEvent.findOne({
      code: req.body.discountCode.trim(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (codeDiscount) {
      if (
        codeDiscount.maxUsers !== undefined &&
        codeDiscount.maxUsers !== null &&
        codeDiscount.usedUsers >= codeDiscount.maxUsers
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });
      }
      appliedDiscount = codeDiscount;
    } else {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá không tồn tại hoặc đã hết hạn",
      });
    }
  } else {
    // Check for auto-applied discount
    const autoDiscounts = await DiscountEvent.find({
      $or: [{ code: { $exists: false } }, { code: null }, { code: "" }],
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ discountPercent: -1, createdAt: -1 });

    appliedDiscount =
      autoDiscounts.find(
        (discount) =>
          discount.maxUsers === undefined ||
          discount.maxUsers === null ||
          discount.usedUsers < discount.maxUsers,
      ) || null;
  }

  if (appliedDiscount) {
    const discountAmount = Math.round(
      subtotal * (appliedDiscount.discountPercent / 100),
    );
    payload.discountCode = appliedDiscount.code || appliedDiscount.name;
    payload.discountAmount = discountAmount;
    payload.totalPrice = Math.max(0, subtotal - discountAmount);
  } else {
    payload.discountCode = null;
    payload.discountAmount = 0;
    payload.totalPrice = subtotal;
  }

  // 🟢 If total price after discount is 0 or less, mark status as Paid directly
  if (payload.totalPrice <= 0) {
    if (!payload.paymentInfo) {
      payload.paymentInfo = {};
    }
    payload.paymentInfo.status = "Paid";
  }

  const charmRequirements = req.body.inventoryImpact?.length
    ? buildRequirementsFromInventoryImpact(req.body.inventoryImpact)
    : buildCharmRequirements(items);
  const decrementedCharms = [];
  const stockUpdates = [];

  try {
    if (charmRequirements.size > 0) {
      const charmIds = [...charmRequirements.keys()];
      const charms = await Charm.find({ _id: { $in: charmIds } })
        .select("_id name stock")
        .lean();

      const charmMap = new Map(
        charms.map((charm) => [String(charm._id), charm]),
      );
      const shortages = [];

      for (const [charmId, requiredQuantity] of charmRequirements.entries()) {
        const charm = charmMap.get(charmId);

        if (!charm) {
          const error = new Error(`Charm not found: ${charmId}`);
          error.statusCode = 404;
          throw error;
        }

        const currentStock = Number(charm.stock) || 0;
        if (currentStock < requiredQuantity) {
          shortages.push(
            `${charm.name} (còn ${currentStock}, cần ${requiredQuantity})`,
          );
        }
      }

      if (shortages.length > 0) {
        const error = new Error(
          `Không đủ số lượng cho: ${shortages.join(", ")}`,
        );
        error.statusCode = 400;
        throw error;
      }

      for (const [charmId, requiredQuantity] of charmRequirements.entries()) {
        const previousCharm = charmMap.get(charmId);
        const updatedCharm = await Charm.findOneAndUpdate(
          { _id: charmId, stock: { $gte: requiredQuantity } },
          { $inc: { stock: -requiredQuantity } },
          { new: true, runValidators: true },
        ).select("_id name stock");

        if (!updatedCharm) {
          const error = new Error(
            "Không thể cập nhật tồn kho charm. Vui lòng thử lại.",
          );
          error.statusCode = 409;
          throw error;
        }

        decrementedCharms.push({ charmId, quantity: requiredQuantity });
        stockUpdates.push({
          charmId,
          name: updatedCharm.name,
          quantity: requiredQuantity,
          stockBefore: Number(previousCharm.stock) || 0,
          stockAfter: Number(updatedCharm.stock) || 0,
        });
      }
    }

    // CREATE THE ORDER IN MONGODB
    const order = await Order.create(payload);

    // Increment discount usage count
    if (appliedDiscount) {
      await DiscountEvent.findByIdAndUpdate(appliedDiscount._id, {
        $inc: { usedUsers: 1 },
      });
    }

    // 🟢 3. GENERATE PAYOS PAYMENT LINK IF METHOD IS PAYOS (Bypass if totalPrice is 0)
    let checkoutUrl = null;
    if (order.totalPrice <= 0) {
      order.paymentInfo.status = "Paid";
      await order.save();
    } else if (order.paymentInfo && order.paymentInfo.method === "PayOS") {
      try {
        const clientUrl =
          process.env.CLIENT_URL ||
          req.headers.origin ||
          "http://localhost:5173";
        const body = {
          orderCode: order.orderCode,
          amount: order.totalPrice,
          description: `Thanh toan don ${order.orderCode}`,
          returnUrl: `${clientUrl}/orders`,
          cancelUrl: `${clientUrl}/cart`,
        };

        const paymentLink = await payos.paymentRequests.create(body);
        checkoutUrl = paymentLink.checkoutUrl;
      } catch (payosError) {
        console.error("PayOS Error:", payosError);
        // We don't throw here so the order is still saved, user can just retry payment later
      }
    }

    res.status(201).json({
      success: true,
      data: order,
      checkoutUrl, // 🟢 Send the URL back to the frontend
      inventory: {
        requested: [...charmRequirements.entries()].map(
          ([charmId, quantity]) => ({ charmId, quantity }),
        ),
        updated: stockUpdates,
      },
    });
  } catch (error) {
    if (decrementedCharms.length > 0) {
      await Promise.all(
        decrementedCharms.map(({ charmId, quantity }) =>
          Charm.updateOne({ _id: charmId }, { $inc: { stock: quantity } }),
        ),
      );
    }

    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
});

// --- GET ORDERS ROUTE ---
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const phone = req.query.phone?.trim();

    if (phone) {
      filter["customerInfo.phone"] = phone;
    }

    const orders = await Order.find(filter).sort("-createdAt");
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// 🟢 4. ADD WEBHOOK ROUTE TO AUTOMATICALLY UPDATE ORDER STATUS
// 🟢 FINAL BULLETPROOF WEBHOOK ROUTE
router.post("/webhook", async (req, res) => {
  try {
    const webhookData = req.body;

    // 1. Securely verify the PayOS signature data
    const verifiedData = payos.verifyPaymentWebhookData(webhookData);

    // 2. Safe number conversion (MongoDB stores orderCode as a Number, so we cast it just in case)
    const orderCodeNum =
      verifiedData && verifiedData.orderCode
        ? Number(verifiedData.orderCode)
        : null;

    // 3. Fix the conditional check: PayOS success code "00" is on webhookData, NOT verifiedData
    if ((webhookData.code === "00" || req.body.code === "00") && orderCodeNum) {
      // 4. Update the database using the converted numeric orderCode
      await Order.findOneAndUpdate(
        { orderCode: orderCodeNum },
        {
          "paymentInfo.status": "Paid",
          status: "Processing",
          "paymentInfo.transactionId":
            verifiedData.reference ||
            String(verifiedData.paymentLinkId || "PayOS"),
        },
      );
    }

    // 5. Always answer PayOS with a 200 OK success response
    return res.status(200).json({
      success: true,
      message: "Webhook processed completely",
    });
  } catch (error) {
    // 6. Even if something fails, return a 200 so PayOS doesn't break down or lock your URL
    return res.status(200).json({
      success: true,
      message: "Webhook caught error but returned 200",
    });
  }
});

// 🟢 CHANGED TO router.delete
router.delete("/cancel-payos-order", async (req, res) => {
  try {
    const { orderCode } = req.body; // Received safely via Axios' { data } block

    if (!orderCode) {
      return res.status(400).json({ message: "Thiếu mã đơn hàng (orderCode)" });
    }

    // 1. Find and DELETE the order immediately
    const deletedOrder = await Order.findOneAndDelete({
      orderCode: Number(orderCode),
    });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // 2. RESTORE THE INVENTORY STOCK
    const charmsToRestore = new Map();
    if (deletedOrder.items && Array.isArray(deletedOrder.items)) {
      deletedOrder.items.forEach((item) => {
        const qty = item.quantity || 1;
        if (item.productType === "Charm" && item.product) {
          charmsToRestore.set(
            item.product,
            (charmsToRestore.get(item.product) || 0) + qty,
          );
        } else if (
          (item.productType === "BraceletDesign" ||
            item.productType === "Collection") &&
          Array.isArray(item.designCharms)
        ) {
          item.designCharms.forEach((charmId) => {
            if (charmId)
              charmsToRestore.set(
                charmId,
                (charmsToRestore.get(charmId) || 0) + qty,
              );
          });
        }
      });
    }

    if (charmsToRestore.size > 0) {
      const restorePromises = [];
      for (const [charmId, qty] of charmsToRestore.entries()) {
        restorePromises.push(
          Charm.updateOne({ _id: charmId }, { $inc: { stock: qty } }),
        );
      }
      await Promise.all(restorePromises);
    }

    return res.status(200).json({
      message: "Đơn hàng đã được xóa và hoàn trả tồn kho thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi xóa đơn hàng PayOS:", error);
    return res.status(500).json({ message: "Lỗi hệ thống nội bộ" });
  }
});

module.exports = router;
