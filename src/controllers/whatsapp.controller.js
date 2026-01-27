import whatsappService from '../services/whatsapp.service.js';

export const getQR = (req, res) => {
  const qr = whatsappService.getQR();
  if (qr) {
    res.json({ qr });
  } else {
    res.status(404).json({ error: "QR code not generated yet or already connected" });
  }
};

export const getStatus = (req, res) => {
  res.json({ status: whatsappService.getStatus() });
};

export const reset = async (req, res) => {
  try {
    await whatsappService.reset();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const send = async (req, res) => {
  const { to, message } = req.body;
  try {
    await whatsappService.sendMessage(to, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
