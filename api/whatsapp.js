const express = require('express');
const router = express.Router();
const whatsappService = require('../server-lib/whatsappService');

router.get('/qr', (req, res) => {
  const qr = whatsappService.getQR();
  if (qr) {
    res.json({ qr });
  } else {
    res.status(404).json({ error: "QR code not generated yet or already connected" });
  }
});

router.get('/status', (req, res) => {
  res.json({ status: whatsappService.getStatus() });
});

router.post('/reset', async (req, res) => {
  try {
    await whatsappService.reset();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  try {
    await whatsappService.sendMessage(to, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
