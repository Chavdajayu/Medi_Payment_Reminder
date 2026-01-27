import express from 'express';
import * as settingsController from '../controllers/settings.controller.js';

const router = express.Router();

router.post('/', settingsController.updateSettings);
router.get('/:uid', settingsController.getSettings);

export default router;
