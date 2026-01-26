const express = require('express');
const cors = require('cors');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const P = require('pino');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let sock;
let qrCodeData = null;
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

// Pino logger with reduced verbosity
const logger = P({ level: 'info' });

// Initialize WhatsApp connection
async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger,
            printQRInTerminal: true,
            auth: state,
            markOnlineOnConnect: false,
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                // Generate QR code as base64
                qrCodeData = await QRCode.toDataURL(qr);
                console.log('QR Code generated. Scan with WhatsApp to authenticate.');
                isConnected = false;
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('Connection closed. Reconnecting:', shouldReconnect);
                isConnected = false;
                qrCodeData = null;

                if (shouldReconnect && connectionRetries < MAX_RETRIES) {
                    connectionRetries++;
                    setTimeout(() => connectToWhatsApp(), 5000);
                } else if (connectionRetries >= MAX_RETRIES) {
                    console.error('Max reconnection attempts reached. Please restart the service.');
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connected successfully!');
                isConnected = true;
                qrCodeData = null;
                connectionRetries = 0;
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (error) {
        console.error('Error connecting to WhatsApp:', error);
        if (connectionRetries < MAX_RETRIES) {
            connectionRetries++;
            setTimeout(() => connectToWhatsApp(), 10000);
        }
    }
}

// Format phone number to WhatsApp format
function formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    return cleaned + '@s.whatsapp.net';
}

// Routes
app.get('/status', (req, res) => {
    res.json({
        status: isConnected ? 'connected' : 'disconnected',
        needsQR: !isConnected && qrCodeData !== null,
        retries: connectionRetries
    });
});

app.get('/qr', (req, res) => {
    if (qrCodeData) {
        res.json({
            status: 'qr_available',
            qrCode: qrCodeData
        });
    } else if (isConnected) {
        res.json({
            status: 'connected',
            message: 'Already authenticated'
        });
    } else {
        res.json({
            status: 'connecting',
            message: 'Connecting to WhatsApp...'
        });
    }
});

app.post('/send', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({
            status: 'error',
            message: 'Phone and message are required'
        });
    }

    if (!isConnected || !sock) {
        return res.status(503).json({
            status: 'error',
            message: 'WhatsApp is not connected. Please scan QR code first.'
        });
    }

    try {
        const formattedPhone = formatPhoneNumber(phone);
        await sock.sendMessage(formattedPhone, { text: message });
        
        console.log(`Message sent to ${phone}`);
        res.json({
            status: 'success',
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to send message',
            error: error.message
        });
    }
});

app.post('/send-batch', async (req, res) => {
    const { messages } = req.body; // Array of {phone, message}

    if (!Array.isArray(messages)) {
        return res.status(400).json({
            status: 'error',
            message: 'messages must be an array'
        });
    }

    if (!isConnected || !sock) {
        return res.status(503).json({
            status: 'error',
            message: 'WhatsApp is not connected'
        });
    }

    const results = [];
    for (const msg of messages) {
        try {
            const formattedPhone = formatPhoneNumber(msg.phone);
            await sock.sendMessage(formattedPhone, { text: msg.message });
            results.push({ phone: msg.phone, status: 'success' });
            
            // Add delay between messages to avoid spam detection
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`Error sending to ${msg.phone}:`, error);
            results.push({ phone: msg.phone, status: 'failed', error: error.message });
        }
    }

    res.json({
        status: 'completed',
        results
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'whatsapp-microservice' });
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp service running on port ${PORT}`);
    connectToWhatsApp();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    if (sock) {
        await sock.logout();
    }
    process.exit(0);
});
