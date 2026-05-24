const Category = require('../models/Category');
const Charm = require('../models/Charm');

const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().lean();
        
        for (let cat of categories) {
            const charms = await Charm.find({ category: cat._id }).limit(6).select('image').lean();
            cat.thumbnails = charms.map(c => c.image);
        }

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

const getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error(`Category not found with id of ${req.params.id}`);
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            res.status(404);
            throw new Error(`Category not found with id of ${req.params.id}`);
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error(`Category not found with id of ${req.params.id}`);
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
