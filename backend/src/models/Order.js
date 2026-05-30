const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      product: {
        type: String,
        required: true,
      },
      productType: {
        type: String,
        required: true,
        enum: ['Charm', 'BraceletDesign']
      },
      designCharms: [{
        type: String,
      }],
      designCharmDetails: [{
        type: mongoose.Schema.Types.Mixed,
      }],
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    addressLine: { type: String },
    district: { type: String },
    city: { type: String },
    note: { type: String }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['BankTransfer'],
      default: 'BankTransfer'
    },
    status: {
      type: String,
      enum: ['PendingTransfer', 'TransferConfirmed'],
      default: 'TransferConfirmed'
    },
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolder: { type: String }
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
