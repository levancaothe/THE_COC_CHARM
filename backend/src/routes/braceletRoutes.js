const express = require('express');
const {
    getDesigns,
    getPopularThemes,
    createDesign,
    updateDesign,
    deleteDesign
} = require('../controllers/braceletController');

const router = express.Router();

router.route('/')
    .get(getDesigns)
    .post(createDesign);

router.get('/popular-themes', getPopularThemes);

router.route('/:id')
    .put(updateDesign)
    .delete(deleteDesign);

module.exports = router;
