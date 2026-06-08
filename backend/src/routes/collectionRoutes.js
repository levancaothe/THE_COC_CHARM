const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
// Import your Cloudinary utility! (Adjust the path if necessary based on your folder structure)
const { uploadImageToCloudinary } = require("../utils/cloudinary");

// 1. GET all collections (For your table)
router.get("/", async (req, res) => {
  try {
    // Populate the charms so the frontend gets the full charm data, not just IDs
    const collections = await Collection.find()
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
router.post("/", async (req, res) => {
  try {
    let collectionData = { ...req.body };

    // If the frontend sends an image (like a Base64 screenshot), upload it first
    if (collectionData.image) {
      const uploadedUrl = await uploadImageToCloudinary(collectionData.image, {
        folder: "the_coc_charm/collections", // Keeps your Cloudinary organized
      });
      collectionData.image = uploadedUrl; // Replace the massive Base64 string with the neat URL
    }

    const newCollection = new Collection(collectionData);
    const savedCollection = await newCollection.save();
    res.status(201).json(savedCollection);
  } catch (error) {
    console.error("Create collection error:", error);
    res.status(400).json({ message: "Không thể tạo mẫu mới", error });
  }
});

// 3. UPDATE an existing collection (When clicking ✏️)
router.put("/:id", async (req, res) => {
  try {
    let updateData = { ...req.body };

    // If the admin uploaded a NEW image/screenshot, upload it.
    // (Your isCloudinaryUrl check in cloudinary.js will safely skip this if it's already a Cloudinary link)
    if (updateData.image) {
      const uploadedUrl = await uploadImageToCloudinary(updateData.image, {
        folder: "the_coc_charm/collections",
      });
      updateData.image = uploadedUrl;
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    res.status(200).json(updatedCollection);
  } catch (error) {
    console.error("Update collection error:", error);
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
