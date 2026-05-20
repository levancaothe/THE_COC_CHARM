const express = require('express');
const { proxyImage } = require('../controllers/proxyController');

const router = express.Router();

router.get('/image', proxyImage);

module.exports = router;
