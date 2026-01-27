const cron = require('node-cron');
const { checkReminders } = require('../services/reminder.service');

function startScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', checkReminders);
  console.log('✅ Reminder Scheduler started (Hourly Check)');
}

module.exports = { startScheduler };
