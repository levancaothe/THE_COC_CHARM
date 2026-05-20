const BraceletDesign = require('../models/BraceletDesign');

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
    createDesign,
    deleteDesign
};
