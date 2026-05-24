const Charm = require('../models/Charm');
const Category = require('../models/Category');
const Order = require('../models/Order');
const BraceletDesign = require('../models/BraceletDesign');

exports.getStats = async (req, res, next) => {
  try {
    const [charmsCount, categoriesCount, ordersCount, designsCount, revenueAgg] = await Promise.all([
      Charm.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      BraceletDesign.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    const totalRevenue = (revenueAgg[0] && revenueAgg[0].total) || 0;

    res.json({
      charmsCount,
      categoriesCount,
      ordersCount,
      designsCount,
      totalRevenue
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
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      Order.countDocuments(filter)
    ]);

    res.json({ orders, total, page: parseInt(page, 10), limit: perPage });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    next(err);
  }
};
