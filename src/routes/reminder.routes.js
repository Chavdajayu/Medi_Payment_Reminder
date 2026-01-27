import express from 'express';
import * as reminderController from '../controllers/reminder.controller.js';

const router = express.Router();

router.post('/trigger-reminders', reminderController.triggerReminders);

export default router;
