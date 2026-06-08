const express = require('express');
const {
    getCharms,
    getCharm,
    getPopularCharms
} = require('../controllers/charmController');

const router = express.Router();

router.route('/')
    .get(getCharms);

router.get('/popular', getPopularCharms);

router.route('/:id')
    .get(getCharm);

module.exports = router;
