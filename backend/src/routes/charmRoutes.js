const express = require('express');
const {
    getCharms,
    getCharm,
    createCharm,
    updateCharm,
    deleteCharm
} = require('../controllers/charmController');

const router = express.Router();

router.route('/')
    .get(getCharms)
    .post(createCharm);

router.route('/:id')
    .get(getCharm)
    .put(updateCharm)
    .delete(deleteCharm);

module.exports = router;
