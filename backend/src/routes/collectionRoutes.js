const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");

// 1. GET all collections (For your table)
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find().sort({ createdAt: -1 });
    res.status(200).json({
      collections: collections,
      total: collections.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu", error });
  }
});

// 2. CREATE a new collection (From your Modal)
router.post("/", async (req, res) => {
  try {
    const newCollection = new Collection(req.body);
    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    res.status(400).json({ message: "Không thể tạo mẫu mới", error });
  }
});

// 3. UPDATE an existing collection (When clicking ✏️)
router.put("/:id", async (req, res) => {
  try {
    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // Returns the updated document
    );
    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(400).json({ message: "Lỗi khi cập nhật", error });
  }
});

// 4. DELETE a collection (When clicking 🗑️)
router.delete("/:id", async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa", error });
  }
});

module.exports = router;
