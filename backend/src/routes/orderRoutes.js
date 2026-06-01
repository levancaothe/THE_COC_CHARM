const express = require("express");
const router = express.Router();
const Charm = require("../models/Charm");
const Order = require("../models/Order");

// 🟢 1. IMPORT AND INITIALIZE PAYOS
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
      item?.productType === "BraceletDesign" ? "BraceletDesign" : "Charm",
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
      item?.productType === "BraceletDesign" &&
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

  // 🟢 2. GENERATE UNIQUE ORDER CODE FOR PAYOS
  const orderCode = Number(String(Date.now()).slice(-6));

  const payload = {
    ...req.body,
    orderCode, // Add the required orderCode
    items,
    totalPrice: Number(req.body.totalPrice) || 0,
    createdAt: req.body.createdAt || new Date(),
  };

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

    // 🟢 3. GENERATE PAYOS PAYMENT LINK IF METHOD IS PAYOS
    let checkoutUrl = null;
    if (order.paymentInfo && order.paymentInfo.method === "PayOS") {
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
router.post("/webhook", async (req, res) => {
  try {
    const webhookData = req.body;
    const verifiedData = payos.verifyPaymentWebhookData(webhookData);

    if (verifiedData.code === "00") {
      const orderCode = verifiedData.orderCode;

      // Update order in database to Paid
      await Order.findOneAndUpdate(
        { orderCode },
        {
          "paymentInfo.status": "Paid",
          status: "Processing",
          "paymentInfo.transactionId": verifiedData.transactionDateTime,
        },
      );
    }

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid webhook data",
    });
  }
});

module.exports = router;
