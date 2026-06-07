const express = require("express");
const router = express.Router();
const DiscountEvent = require("../models/DiscountEvent");

// Lấy tất cả sự kiện
router.get("/", async (req, res) => {
  try {
    const events = await DiscountEvent.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// Tạo sự kiện mới
router.post("/", async (req, res) => {
  try {
    const newEvent = new DiscountEvent(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi tạo sự kiện", error });
  }
});

// Xóa sự kiện
router.delete("/:id", async (req, res) => {
  try {
    await DiscountEvent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa", error });
  }
});

module.exports = router;
