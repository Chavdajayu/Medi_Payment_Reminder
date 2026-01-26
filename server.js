const express = require('express');
const cors = require('cors');
const path = require('path');
const { startScheduler } = require('./server-lib/reminderScheduler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/whatsapp', require('./api/whatsapp'));
app.use('/api/upload', require('./api/upload'));
app.use('/api/settings', require('./api/settings'));
app.use('/api/invoices', require('./api/invoices'));
app.use('/api/retailers', require('./api/retailers'));
app.use('/api/stats', require('./api/stats'));
app.use('/api/test', require('./api/test'));

// Health Check
app.get('/health', (req, res) => res.send('Medi-Payment-Reminder Server is Running'));

// Start Scheduler
startScheduler();

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WhatsApp Service initialized`);
  });
}

module.exports = app;
