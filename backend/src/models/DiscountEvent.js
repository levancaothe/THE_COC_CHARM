const mongoose = require("mongoose");

const discountEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("DiscountEvent", discountEventSchema);
