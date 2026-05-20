const express = require('express');
const {
    getDesigns,
    createDesign,
    deleteDesign
} = require('../controllers/braceletController');

const router = express.Router();

router.route('/')
    .get(getDesigns)
    .post(createDesign);

router.route('/:id')
    .delete(deleteDesign);

module.exports = router;
