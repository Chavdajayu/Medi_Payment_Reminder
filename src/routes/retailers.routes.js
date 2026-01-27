const express = require('express');
const router = express.Router();
const retailersController = require('../controllers/retailers.controller');

router.get('/:uid', retailersController.getRetailers);
router.post('/', retailersController.createRetailer);

module.exports = router;
