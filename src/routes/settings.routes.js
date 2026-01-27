const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

router.post('/', settingsController.updateSettings);
router.get('/:uid', settingsController.getSettings);

module.exports = router;
