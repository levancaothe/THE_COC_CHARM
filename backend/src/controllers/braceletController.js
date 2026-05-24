const BraceletDesign = require('../models/BraceletDesign');

const BASIC_KEYWORDS = ['cơ bản', 'co ban', 'basic', 'base', 'mặc định', 'mac dinh', 'default'];

const normalizeText = (value = '') => value.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const isBasicCategory = (categoryName = '') => {
    const normalized = normalizeText(categoryName);
    return BASIC_KEYWORDS.some((keyword) => normalized.includes(normalizeText(keyword)));
};

const getDesigns = async (req, res, next) => {
    try {
        const designs = await BraceletDesign.find({ isSaved: true }).populate('charms.charm').sort('-createdAt');
        res.status(200).json({
            success: true,
            count: designs.length,
            data: designs
        });
    } catch (error) {
        next(error);
    }
};

const getPopularThemes = async (req, res, next) => {
    try {
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 3);
        const designs = await BraceletDesign.find({ isSaved: true })
            .populate({
                path: 'charms.charm',
                populate: { path: 'category', select: 'name' }
            })
            .sort('-createdAt')
            .lean();

        const categoryMap = new Map();

        designs.forEach((design) => {
            (design.charms || []).forEach((entry) => {
                const charm = entry?.charm;
                const category = charm?.category;
                const categoryName = category?.name || '';

                if (!category?._id || !categoryName || isBasicCategory(categoryName)) return;

                const key = String(category._id);
                const current = categoryMap.get(key) || {
                    categoryId: key,
                    categoryName,
                    count: 0,
                    image: charm.image,
                    charmName: charm.name
                };

                current.count += 1;
                if (!current.image && charm.image) current.image = charm.image;
                if (!current.charmName && charm.name) current.charmName = charm.name;
                categoryMap.set(key, current);
            });
        });

        const topThemes = [...categoryMap.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
            .map((item, index) => ({
                ...item,
                rank: index + 1,
                badge: index === 0 ? 'HOT' : index === 1 ? 'TRENDING' : 'POPULAR'
            }));

        res.status(200).json({
            success: true,
            count: topThemes.length,
            data: topThemes
        });
    } catch (error) {
        next(error);
    }
};

const createDesign = async (req, res, next) => {
    try {
        const design = await BraceletDesign.create(req.body);
        res.status(201).json({
            success: true,
            data: design
        });
    } catch (error) {
        next(error);
    }
};

const updateDesign = async (req, res, next) => {
    try {
        const design = await BraceletDesign.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('charms.charm');

        if (!design) {
            res.status(404);
            throw new Error('Design not found');
        }

        res.status(200).json({
            success: true,
            data: design
        });
    } catch (error) {
        next(error);
    }
};


const deleteDesign = async (req, res, next) => {
    try {
        const design = await BraceletDesign.findByIdAndDelete(req.params.id);
        if (!design) {
            res.status(404);
            throw new Error('Design not found');
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
    getDesigns,
    getPopularThemes,
    createDesign,
    updateDesign,
    deleteDesign
};
