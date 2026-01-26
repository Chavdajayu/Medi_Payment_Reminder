const cron = require('node-cron');
const { db } = require('./firebaseAdmin');
const whatsappService = require('./whatsappService');

const checkReminders = async () => {
  const currentHour = new Date().getHours();
  const timeString = `${currentHour.toString().padStart(2, '0')}:00`;

  console.log(`⏰ Running reminder check for ${timeString}...`);

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Get all users who have auto-reminders enabled
    const usersSnapshot = await db.collection('users').get();
    
    const promises = [];

    usersSnapshot.forEach((userDoc) => {
      promises.push(processUserReminders(userDoc, currentHour, today));
    });

    await Promise.all(promises);

  } catch (error) {
    console.error('❌ Scheduler Error:', error);
  }
};

const processUserReminders = async (userDoc, currentHour, today) => {
  const userData = userDoc.data();
  const settings = userData.settings || {};
  
  if (settings.auto_reminder_enabled) {
      const userTime = settings.reminder_time || "09:00";
      const userHour = parseInt(userTime.split(':')[0]);
      
      // Check if it's the right hour OR if called manually (ignoring hour check for testing? No, stick to logic)
      // Actually for manual trigger, we might want to FORCE it.
      // But let's keep strict logic for now.
      
      if (userHour === currentHour) {
          const invoicesSnapshot = await userDoc.ref.collection('invoices')
              .where('status', '==', 'unpaid')
              .where('dueDate', '==', today)
              .get();

          if (!invoicesSnapshot.empty) {
              invoicesSnapshot.forEach(async (invDoc) => {
                  const invoice = invDoc.data();
                  const phoneNumber = invoice.phoneNumber; 
                  
                  if (phoneNumber && whatsappService.getStatus() === 'CONNECTED') {
                      const message = `Hello ${invoice.buyerName},\nThis is a reminder from ${userData.businessName || 'Medi Payment'}.\nYour invoice ${invoice.invoiceNumber} for amount ${invoice.amount} is due today (${invoice.dueDate}).\nPlease make the payment.`;
                      
                      try {
                          await whatsappService.sendMessage(phoneNumber, message);
                          console.log(`✅ Reminder sent to ${invoice.buyerName} (${phoneNumber})`);
                      } catch (err) {
                          console.error(`❌ Failed to send reminder to ${phoneNumber}:`, err.message);
                      }
                  }
              });
          }
      }
  }
};

function startScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', checkReminders);
  console.log('✅ Reminder Scheduler started (Hourly Check)');
}

module.exports = { startScheduler, checkReminders };
