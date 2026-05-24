const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
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
