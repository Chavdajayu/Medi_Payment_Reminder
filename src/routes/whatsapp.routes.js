import express from 'express';
import * as whatsappController from '../controllers/whatsapp.controller.js';

const router = express.Router();

router.get('/qr', whatsappController.getQR);
router.get('/status', whatsappController.getStatus);
router.post('/reset', whatsappController.reset);
router.post('/send', whatsappController.send);

export default router;
