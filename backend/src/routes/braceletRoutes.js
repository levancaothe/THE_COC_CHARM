const express = require('express');
const {
    getDesigns,
    getPopularThemes
} = require('../controllers/braceletController');

const router = express.Router();

router.route('/')
    .get(getDesigns);

router.get('/popular-themes', getPopularThemes);

module.exports = router;
