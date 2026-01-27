import cron from 'node-cron';
import { checkReminders } from '../services/reminder.service.js';

const startReminderScheduler = () => {
  cron.schedule('0 * * * *', checkReminders);
  console.log('✅ Reminder Scheduler started (Hourly Check)');
};

startReminderScheduler();

export { startReminderScheduler };
