const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const SESSION_DIR = path.join(process.cwd(), 'whatsapp-session');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qr = null;
    this.status = 'DISCONNECTED';
    this.init();
  }

  async init() {
    if (!fs.existsSync(SESSION_DIR)) {
      fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

    this.sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      connectTimeoutMs: 60000,
    });

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          this.qr = await qrcode.toDataURL(qr);
          this.status = 'QR_READY';
          console.log('WhatsApp QR Code generated');
        } catch (err) {
          console.error('QR Generation Error:', err);
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('WhatsApp connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
        this.status = 'DISCONNECTED';
        this.qr = null;
        if (shouldReconnect) {
          setTimeout(() => this.init(), 3000);
        }
      } else if (connection === 'open') {
        console.log('WhatsApp connection opened');
        this.status = 'CONNECTED';
        this.qr = null;
      }
    });

    this.sock.ev.on('creds.update', saveCreds);
  }

  async reset() {
    try {
      if (this.sock) {
        this.sock.end(undefined);
        this.sock = null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (fs.existsSync(SESSION_DIR)) {
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
      }
      
      this.status = 'DISCONNECTED';
      this.qr = null;
      await this.init();
      return true;
    } catch (error) {
      console.error('Reset Error:', error);
      throw error;
    }
  }

  getQR() {
    return this.qr;
  }

  getStatus() {
    return this.status;
  }

  async sendMessage(to, message) {
    if (this.status !== 'CONNECTED' || !this.sock) {
      throw new Error('WhatsApp not connected');
    }
    
    let formattedNumber = to.replace(/\D/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = '91' + formattedNumber;
    }
    
    const jid = formattedNumber + '@s.whatsapp.net';
    await this.sock.sendMessage(jid, { text: message });
  }
}

const whatsappService = new WhatsAppService();
module.exports = whatsappService;
