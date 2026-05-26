const Charm = require('../models/Charm');
const Category = require('../models/Category');
const { uploadImageToCloudinary } = require('../utils/cloudinary');

exports.getCharms = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, search = '' } = req.query;
    const perPage = Math.max(1, parseInt(limit, 10));
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * perPage;

    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [charms, total] = await Promise.all([
      Charm.find(filter).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(perPage).lean(),
      Charm.countDocuments(filter)
    ]);

    res.json({ charms, total, page: parseInt(page, 10), limit: perPage });
  } catch (err) {
    next(err);
  }
};

exports.createCharm = async (req, res, next) => {
  try {
    const { name, image, price, stock, category } = req.body;

    if (!name || !image || price === undefined || !category) {
      return res.status(400).json({ message: 'Missing required fields: name, image, price, category' });
    }

    const uploadedImage = await uploadImageToCloudinary(image);
    const charm = await Charm.create({
      name,
      image: uploadedImage,
      price,
      stock: stock ?? 0,
      category
    });
    await charm.populate('category', 'name');

    res.status(201).json({ message: 'Charm created', charm });
  } catch (err) {
    next(err);
  }
};

exports.updateCharm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, image, price, stock, category } = req.body;

    let nextImage = image;
    if (image) {
      nextImage = await uploadImageToCloudinary(image);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = nextImage;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category !== undefined) updateData.category = category;

    const charm = await Charm.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!charm) return res.status(404).json({ message: 'Charm not found' });

    res.json({ message: 'Charm updated', charm });
  } catch (err) {
    next(err);
  }
};

exports.deleteCharm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const charm = await Charm.findByIdAndDelete(id);

    if (!charm) return res.status(404).json({ message: 'Charm not found' });

    res.json({ message: 'Charm deleted', charmId: id });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    res.json({ categories, total: categories.length });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const category = await Category.create({ name });
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category updated', category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted', categoryId: id });
  } catch (err) {
    next(err);
  }
};
