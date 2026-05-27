const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, handlePayOSWebhook } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);
router.post('/webhook/payos', handlePayOSWebhook);

module.exports = router;
