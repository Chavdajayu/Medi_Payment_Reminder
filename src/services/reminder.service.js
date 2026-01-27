const db = require('../config/firebase');
const whatsappService = require('./whatsapp.service');

const checkReminders = async () => {
  const currentHour = new Date().getHours();
  const timeString = `${currentHour.toString().padStart(2, '0')}:00`;

  console.log(`⏰ Running reminder check for ${timeString}...`);

  try {
    const today = new Date().toISOString().split('T')[0];
    
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
      
      if (userHour === currentHour) {
          const invoicesSnapshot = await userDoc.ref.collection('invoices')
              .where('status', '==', 'unpaid')
              .where('dueDate', '==', today)
              .get();

          if (!invoicesSnapshot.empty) {
              invoicesSnapshot.forEach(async (invDoc) => {
                  const invoice = invDoc.data();
                  const phoneNumber = invoice.phoneNumber || invoice.retailer_phone; 
                  
                  if (phoneNumber && whatsappService.getStatus() === 'CONNECTED') {
                      const message = `Hello ${invoice.buyerName || invoice.retailer_name},\nThis is a reminder from ${userData.businessName || 'Medi Payment'}.\nYour invoice ${invoice.invoiceNumber || invoice.invoice_number} for amount ${invoice.amount} is due today (${invoice.dueDate || invoice.due_date}).\nPlease make the payment.`;
                      
                      try {
                          await whatsappService.sendMessage(phoneNumber, message);
                          console.log(`✅ Reminder sent to ${invoice.buyerName || invoice.retailer_name} (${phoneNumber})`);
                      } catch (err) {
                          console.error(`❌ Failed to send reminder to ${phoneNumber}:`, err.message);
                      }
                  }
              });
          }
      }
  }
};

module.exports = { checkReminders };
