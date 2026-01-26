# WhatsApp Microservice

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## Features

- QR Code authentication
- Single message sending
- Batch message sending
- Session persistence
- Auto-reconnection

## Endpoints

### GET /status
Check connection status

### GET /qr
Get QR code for authentication

### POST /send
Send single message
```json
{
  "phone": "9876543210",
  "message": "Your payment reminder"
}
```

### POST /send-batch
Send multiple messages
```json
{
  "messages": [
    {"phone": "9876543210", "message": "Message 1"},
    {"phone": "9876543211", "message": "Message 2"}
  ]
}
```
