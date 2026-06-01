const Charm = require("../models/Charm");
const Category = require("../models/Category");
const Order = require("../models/Order");
const BraceletDesign = require("../models/BraceletDesign");
const mongoose = require("mongoose");

exports.getStats = async (req, res, next) => {
  try {
    const [
      charmsCount,
      categoriesCount,
      ordersCount,
      designsCount,
      revenueAgg,
    ] = await Promise.all([
      Charm.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      BraceletDesign.countDocuments(),
      Order.aggregate([
        {
          $match: {
            // 🟢 ONLY count orders where money actually changed hands
            "paymentInfo.status": { $in: ["Paid", "TransferConfirmed"] },
            status: { $ne: "Cancelled" }, // Double safety check
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]),
    ]);

    const totalRevenue = (revenueAgg[0] && revenueAgg[0].total) || 0;

    res.json({
      charmsCount,
      categoriesCount,
      ordersCount,
      designsCount,
      totalRevenue,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDesigns = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const perPage = Math.max(1, parseInt(limit, 10));
    const currentPage = Math.max(1, parseInt(page, 10));
    const skip = (currentPage - 1) * perPage;

    const [designs, total] = await Promise.all([
      BraceletDesign.find({ isSaved: true })
        .populate("charms.charm", "name image price category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      BraceletDesign.countDocuments({ isSaved: true }),
    ]);

    res.json({
      designs,
      total,
      page: currentPage,
      limit: perPage,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status, startDate, endDate, limit = 10, page = 1 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (startDate || endDate) filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);

    const perPage = Math.max(1, parseInt(limit, 10));
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * perPage;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const charmIds = new Set();
    const productIds = new Set();

    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item?.productType === "Charm" && item?.product) {
          charmIds.add(String(item.product));
        }
        if (
          item?.productType === "BraceletDesign" &&
          Array.isArray(item?.designCharms)
        ) {
          if (
            item?.product &&
            mongoose.Types.ObjectId.isValid(String(item.product))
          ) {
            productIds.add(String(item.product));
          }

          item.designCharms.forEach((charmId) => {
            if (charmId) charmIds.add(String(charmId));
          });
        }
      });
    });

    const [charmDocs, productDocs] = await Promise.all([
      charmIds.size > 0
        ? Charm.find({ _id: { $in: [...charmIds] } })
            .populate("category", "name")
            .lean()
        : Promise.resolve([]),
      productIds.size > 0
        ? BraceletDesign.find({ _id: { $in: [...productIds] } })
            .populate("charms.charm", "name image price category")
            .select("_id name totalPrice charms createdAt")
            .lean()
        : Promise.resolve([]),
    ]);

    const charmMap = new Map(
      charmDocs.map((charm) => [String(charm._id), charm]),
    );
    const productMap = new Map(
      productDocs.map((product) => [String(product._id), product]),
    );

    const enrichedOrders = orders.map((order) => ({
      ...order,
      items: (order.items || []).map((item) => {
        const productId = item?.product ? String(item.product) : "";
        const snapshotCharmDetails = Array.isArray(item?.designCharmDetails)
          ? item.designCharmDetails
          : [];
        const charmDetails =
          snapshotCharmDetails.length > 0
            ? snapshotCharmDetails
            : Array.isArray(item?.designCharms)
              ? item.designCharms
                  .map(
                    (charmId) =>
                      charmMap.get(String(charmId)) || {
                        _id: String(charmId),
                        missing: true,
                      },
                  )
                  .filter(Boolean)
              : [];

        return {
          ...item,
          productDetail:
            item?.productType === "Charm"
              ? charmMap.get(productId) || null
              : productMap.get(productId) || null,
          charmDetails,
        };
      }),
    }));

    res.json({
      orders: enrichedOrders,
      total,
      page: parseInt(page, 10),
      limit: perPage,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    next(err);
  }
};
