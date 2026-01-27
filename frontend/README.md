# Medical Distributor Payment Reminder System

A full-stack web application for managing payment reminders to retailers via WhatsApp. Built with FastAPI, React, MongoDB, and Baileys (WhatsApp Web automation).

## Features

✅ **Authentication** - Secure JWT-based signup/login  
✅ **Multi-language Support** - English, Hindi, Gujarati  
✅ **PDF & Excel Import** - Parse invoice data from files  
✅ **Retailer Management** - Track outstanding payments  
✅ **Invoice Tracking** - Mark invoices as paid/unpaid  
✅ **WhatsApp Integration** - Send reminders via your own WhatsApp number  
✅ **Manual & Batch Send** - Single or bulk reminder sending  
✅ **Automated Reminders** - Cron-based scheduled reminders  
✅ **Activity Logs** - Track all sent messages  
✅ **Configurable Settings** - Customize reminder frequency, language, timing  

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **PyJWT** - Authentication
- **PyPDF2** - PDF parsing
- **openpyxl** - Excel parsing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling
- **Sonner** - Toast notifications

### WhatsApp Service
- **Node.js + Express** - Microservice
- **Baileys** - WhatsApp Web automation
- **QR Code** - Authentication

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│  React Frontend │─────▶│  FastAPI Backend│─────▶│   MongoDB    │
└─────────────────┘      └─────────────────┘      └──────────────┘
                                 │
                                 │ HTTP
                                 ▼
                         ┌───────────────────┐
                         │ Node.js WhatsApp  │
                         │   Microservice    │
                         │    (Baileys)      │
                         └───────────────────┘
```

## Quick Start

All services are already running in this environment via supervisor:
- Backend: http://localhost:8001
- Frontend: http://localhost:3000
- WhatsApp Service: http://localhost:3001

### Using the Application

1. **Access the App**: Open http://localhost:3000
2. **Sign Up**: Create an account with your business details
3. **Connect WhatsApp**: Go to Settings → Get QR Code → Scan with your phone
4. **Upload Data**: Upload PDF or Excel file with invoice data
5. **Send Reminders**: Go to Retailers → Click "Send Now" or "Send All"

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Upload & Import
- `POST /api/upload` - Parse PDF/Excel file
- `POST /api/import` - Import parsed data

### Dashboard
- `GET /api/dashboard/stats` - Get statistics

### Retailers
- `GET /api/retailers` - List all retailers
- `GET /api/retailers/{id}` - Get retailer details

### Invoices
- `GET /api/invoices` - List all invoices
- `PATCH /api/invoices/{id}` - Update invoice status

### WhatsApp
- `GET /api/whatsapp/qr` - Get QR code
- `GET /api/whatsapp/status` - Check connection
- `POST /api/whatsapp/send?retailer_id={id}` - Send reminder
- `POST /api/whatsapp/send-batch` - Send to all

### Settings
- `GET /api/settings` - Get settings
- `PATCH /api/settings` - Update settings

### Logs
- `GET /api/logs` - View all logs

## Multi-Language Support

The app supports English, Hindi, and Gujarati for both UI and WhatsApp messages.

Template variables:
- `{{retailer}}` - Retailer name
- `{{totalDue}}` - Total outstanding amount
- `{{invoiceCount}}` - Number of unpaid invoices
- `{{dueDate}}` - Earliest due date
- `{{wholesaler}}` - Your business name

## Automated Reminders

To enable automated reminders:
1. Go to Settings page
2. Enable "Auto Reminders" toggle
3. Set frequency (daily/weekly/monthly)
4. Set send time (e.g., 09:00)
5. Save settings

The cron script `/app/backend/cron_reminders.py` handles automated sends.

## Troubleshooting

### WhatsApp Service Not Connecting
1. Check status: `sudo supervisorctl status whatsapp-service`
2. Check logs: `tail -f /var/log/supervisor/whatsapp.out.log`
3. Restart: `sudo supervisorctl restart whatsapp-service`

### Backend Errors
- Check logs: `tail -f /var/log/supervisor/backend.err.log`

### Frontend Not Loading
- Check logs: `tail -f /var/log/supervisor/frontend.out.log`

## License

MIT License
