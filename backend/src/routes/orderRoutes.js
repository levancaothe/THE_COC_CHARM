const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const normalizeOrderItems = (items = []) =>
  items.map((item) => ({
    product: String(item?.product ?? item?._id ?? ''),
    productType: item?.productType === 'BraceletDesign' ? 'BraceletDesign' : 'Charm',
    designCharms: Array.isArray(item?.designCharms) ? item.designCharms.map(String) : [],
    quantity: Number(item?.quantity) || 1,
    price: Number(item?.price) || 0
  }));

router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      items: normalizeOrderItems(req.body.items),
      totalPrice: Number(req.body.totalPrice) || 0,
      createdAt: req.body.createdAt || new Date()
    };

    const result = await Order.collection.insertOne(payload);
    const order = await Order.findById(result.insertedId);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    const phone = req.query.phone?.trim();

    if (phone) {
      filter['customerInfo.phone'] = phone;
    }

    const orders = await Order.find(filter).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
