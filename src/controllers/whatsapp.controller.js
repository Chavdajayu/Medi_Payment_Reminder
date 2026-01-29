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
  
  if (!to || !message) {
    console.error('Missing required fields:', req.body);
    return res.status(400).json({ error: 'Missing "to" or "message" field' });
  }

  try {
    console.log(`Attempting to send WhatsApp message to ${to}`);
    await whatsappService.sendMessage(to, message);
    console.log('Message sent successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
};
