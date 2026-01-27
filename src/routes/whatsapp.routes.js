const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');

router.get('/qr', whatsappController.getQR);
router.get('/status', whatsappController.getStatus);
router.post('/reset', whatsappController.reset);
router.post('/send', whatsappController.send);

module.exports = router;
