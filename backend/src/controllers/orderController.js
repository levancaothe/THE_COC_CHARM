const Order = require('../models/Order');
const PayOS = require('@payos/node');

// Let's use the correct class constructor from the export
const PayOSConstructor = PayOS.PayOS || PayOS.default || PayOS;

// Initialize PayOS
const payos = new PayOSConstructor(
  process.env.PAYOS_CLIENT_ID || 'client_id',
  process.env.PAYOS_API_KEY || 'api_key',
  process.env.PAYOS_CHECKSUM_KEY || 'checksum_key'
);

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, customerInfo, paymentMethod } = req.body;
    
    // Generate a numeric orderCode (required by PayOS)
    const orderCode = Number(String(Date.now()).slice(-6));

    // Create the order in DB
    const orderData = {
      items,
      totalPrice,
      customerInfo,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: 'Unpaid',
      orderCode
    };

    const order = await Order.create(orderData);

    let checkoutUrl = null;
    let qrCodeUrl = null;

    if (paymentMethod === 'VietQR') {
      try {
        const body = {
          orderCode,
          amount: totalPrice,
          description: `Thanh toan don ${orderCode}`,
          returnUrl: 'http://localhost:5173/orders', // Redirect after payment
          cancelUrl: 'http://localhost:5173/cart'
        };

        const paymentLinkResponse = await payos.createPaymentLink(body);
        checkoutUrl = paymentLinkResponse.checkoutUrl;
        // Optionally if payos returns qrCode image link, we can pass it, but checkoutUrl is usually used
      } catch (payosError) {
        console.error('PayOS Error:', payosError);
        // Fallback to manual QR if PayOS fails (or just return the error)
      }
    }

    res.status(201).json({
      success: true,
      data: order,
      checkoutUrl
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort('-createdAt');
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
};

// Update order status (Admin endpoint)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, transactionId } = req.body;
    
    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (transactionId) updateFields.transactionId = transactionId;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// PayOS Webhook Handler
const handlePayOSWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify the webhook signature
    const verifiedData = payos.verifyPaymentWebhookData(webhookData);

    if (verifiedData.code === '00') {
      const orderCode = verifiedData.orderCode;
      
      // Update order in database
      await Order.findOneAndUpdate(
        { orderCode },
        {
          paymentStatus: 'Paid',
          status: 'Processing',
          transactionId: verifiedData.transactionDateTime
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid webhook data'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  handlePayOSWebhook
};
