const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminder.controller');

router.post('/trigger-reminders', reminderController.triggerReminders);

module.exports = router;
