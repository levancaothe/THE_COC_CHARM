const express = require("express");
const router = express.Router();
const DiscountEvent = require("../models/DiscountEvent");
const { jwtAuth, requireRole } = require("../middleware/authMiddleware");

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
router.post("/", jwtAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const eventData = { ...req.body };
    if (!eventData.code || (typeof eventData.code === "string" && eventData.code.trim() === "")) {
      delete eventData.code;
    }
    if (eventData.maxUsers === undefined || eventData.maxUsers === null || eventData.maxUsers === "") {
      eventData.maxUsers = 1;
    }
    const newEvent = new DiscountEvent(eventData);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại, vui lòng chọn mã khác!" });
    }
    res.status(400).json({ message: "Lỗi khi tạo sự kiện", error });
  }
});

// Cập nhật sự kiện
router.put("/:id", jwtAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    let unsetData = {};
    if (!updateData.code || (typeof updateData.code === "string" && updateData.code.trim() === "")) {
      delete updateData.code;
      unsetData.code = "";
    }
    if (updateData.maxUsers === undefined || updateData.maxUsers === null || updateData.maxUsers === "") {
      updateData.maxUsers = 1;
    }
    
    const updatedEvent = await DiscountEvent.findByIdAndUpdate(
      req.params.id,
      Object.keys(unsetData).length > 0 ? { $set: updateData, $unset: unsetData } : updateData,
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại, vui lòng chọn mã khác!" });
    }
    res.status(400).json({ message: "Lỗi khi cập nhật sự kiện", error });
  }
});

// Xóa sự kiện
router.delete("/:id", jwtAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    await DiscountEvent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa", error });
  }
});

// Kiểm tra và áp dụng mã giảm giá / khuyến mãi tự động
router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const now = new Date();
    
    // Tìm khuyến mãi tự động (không có code) nếu code rỗng
    if (!code || code.trim() === "") {
      const autoDiscount = await DiscountEvent.findOne({
        $or: [{ code: { $exists: false } }, { code: null }, { code: "" }],
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).sort({ discountPercent: -1 });

      if (autoDiscount && (autoDiscount.maxUsers === undefined || autoDiscount.maxUsers === null || autoDiscount.usedUsers < autoDiscount.maxUsers)) {
        const discountAmount = Math.round((subtotal || 0) * (autoDiscount.discountPercent / 100));
        return res.status(200).json({
          valid: true,
          discount: autoDiscount,
          discountAmount
        });
      }
      return res.status(200).json({ valid: false, message: "Không có khuyến mãi tự động nào đang hoạt động" });
    }

    // Tìm kiếm theo code (không phân biệt hoa thường)
    const discount = await DiscountEvent.findOne({
      code: { $regex: new RegExp(`^${code.trim()}$`, "i") },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!discount) {
      return res.status(400).json({ valid: false, message: "Mã giảm giá không tồn tại hoặc đã hết hạn" });
    }

    if (discount.maxUsers !== undefined && discount.maxUsers !== null && discount.usedUsers >= discount.maxUsers) {
      return res.status(400).json({ valid: false, message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    const discountAmount = Math.round((subtotal || 0) * (discount.discountPercent / 100));
    return res.status(200).json({
      valid: true,
      discount,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
});

module.exports = router;
