const express = require('express');
const {
    getCategories,
    getCategory
} = require('../controllers/categoryController');

const router = express.Router();

router.route('/')
    .get(getCategories);

router.route('/:id')
    .get(getCategory);

module.exports = router;
