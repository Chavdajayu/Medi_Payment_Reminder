const express = require('express');
const router = express.Router();
const { checkReminders } = require('../server-lib/reminderScheduler');

router.post('/trigger-reminders', async (req, res) => {
  try {
    console.log("⚡ Manual trigger for reminder check...");
    await checkReminders();
    res.json({ success: true, message: "Reminder check triggered. Check server logs for details." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;