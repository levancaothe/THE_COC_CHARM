const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
const { jwtAuth, requireRole } = require("../middleware/authMiddleware");
// Import your Cloudinary utility! (Adjust the path if necessary based on your folder structure)
const { uploadImageToCloudinary } = require("../utils/cloudinary");

// 1. GET all collections (For your table & storefront)
router.get("/", async (req, res) => {
  try {
    // Check if the request asked for a specific status (e.g., /api/collections?status=available)
    // If no status is provided in the query, it fetches everything (perfect for Admin Dashboard)
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Populate the charms so the frontend gets the full charm data, not just IDs
    const collections = await Collection.find(filter)
      .populate("charms")
      .sort({ createdAt: -1 });

    res.status(200).json({
      collections: collections,
      total: collections.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu", error });
  }
});

// 2. CREATE a new collection (From your Modal)
router.post("/", jwtAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    let collectionData = { ...req.body };
    // collectionData.status is automatically included here.
    // If the frontend didn't send a status, Mongoose will auto-apply the "available" default.

    // If the frontend sends an image (like a Base64 screenshot), upload it first
    if (collectionData.image) {
      const uploadedUrl = await uploadImageToCloudinary(collectionData.image, {
        folder: "the_coc_charm/collections",
      });
      collectionData.image = uploadedUrl;
    }

    const newCollection = new Collection(collectionData);
    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    console.error("Create collection error:", error);
    // If the frontend sends a status like "sold out", Mongoose will block it and we catch it here
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ (Kiểm tra lại status)", error });
    }
    res.status(400).json({ message: "Không thể tạo mẫu mới", error });
  }
});

// 3. UPDATE an existing collection (When clicking ✏️)
router.put("/:id", jwtAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If the admin uploaded a NEW image/screenshot, upload it.
    if (updateData.image) {
      const uploadedUrl = await uploadImageToCloudinary(updateData.image, {
        folder: "the_coc_charm/collections",
      });
      updateData.image = uploadedUrl;
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true, // IMPORTANT: This forces Mongoose to check the status enum during updates!
      },
    );
    res.status(200).json(updatedCollection);
  } catch (error) {
    console.error("Update collection error:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Trạng thái (status) không hợp lệ", error });
    }
    res.status(400).json({ message: "Lỗi khi cập nhật", error });
  }
});

// 4. DELETE a collection (When clicking 🗑️)
router.delete("/:id", jwtAuth, requireRole("admin", "manager"), async (req, res) => {
  try {
    await Collection.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa", error });
  }
});

module.exports = router;
