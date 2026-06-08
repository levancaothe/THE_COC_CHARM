const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    charms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Charm",
      },
    ],
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["coming soon", "available"],
      default: "available", // Automatically sets this if you don't provide one
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Collection", collectionSchema);
