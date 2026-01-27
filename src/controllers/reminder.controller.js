import { checkReminders } from '../services/reminder.service.js';

export const triggerReminders = async (req, res) => {
  try {
    console.log("⚡ Manual trigger for reminder check...");
    await checkReminders();
    res.json({ success: true, message: "Reminder check triggered." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
