import React, { useEffect } from 'react';
import axios from 'axios';
import { storage } from '../lib/storage';
import { toast } from 'sonner';

const CHECK_INTERVAL = 60 * 1000; // Check every minute
const API = '/api';

export default function ReminderManager() {
  useEffect(() => {
    const interval = setInterval(checkReminders, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const checkReminders = async () => {
    const settings = storage.getSettings();
    if (!settings.auto_reminder_enabled) return;

    const invoices = storage.getInvoices();
    const today = new Date().toISOString().split('T')[0];

    invoices.forEach(async (invoice) => {
      if (invoice.payment_status === 'unpaid' && invoice.due_date <= today) {
        // Check if we already sent a reminder today
        const lastSent = invoice.last_reminder_sent;
        if (lastSent === today) {
          return; // Already sent today
        }

        try {
          // Send Reminder
          const message = `Reminder: Invoice ${invoice.invoice_number} for Rs.${invoice.amount} is due on ${invoice.due_date}. Please pay immediately.`;
          
          await axios.post(`${API}/send-whatsapp`, {
            phone: invoice.retailer_phone,
            message: message
          });

          // Update local storage to avoid spamming
          storage.updateInvoice(invoice.id, { last_reminder_sent: today });
          toast.info(`Auto-reminder sent to ${invoice.retailer_phone}`);
          console.log(`Reminder sent for invoice ${invoice.invoice_number}`);

        } catch (error) {
          console.error(`Failed to send reminder for invoice ${invoice.invoice_number}`, error);
        }
      }
    });
  };

  return null; // This component renders nothing
}
