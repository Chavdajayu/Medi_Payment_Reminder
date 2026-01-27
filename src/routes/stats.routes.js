const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/:uid', statsController.getStats);

module.exports = router;
