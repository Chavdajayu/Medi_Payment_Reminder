#!/usr/bin/env python3
import asyncio
import os
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
import httpx
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# WhatsApp service URL
WHATSAPP_SERVICE_URL = os.environ.get('WHATSAPP_SERVICE_URL', 'http://localhost:3001')

# Load language templates
with open(BACKEND_DIR / 'languages.json', 'r', encoding='utf-8') as f:
    LANGUAGE_TEMPLATES = json.load(f)

async def send_auto_reminders():
    """Send automated reminders to all retailers with unpaid invoices"""
    logger.info("Starting automated reminder job...")
    
    try:
        # Get all users with auto reminders enabled
        settings_list = await db.settings.find(
            {"auto_reminder_enabled": True},
            {"_id": 0}
        ).to_list(1000)
        
        logger.info(f"Found {len(settings_list)} users with auto reminders enabled")
        
        for settings in settings_list:
            user_id = settings['user_id']
            language = settings.get('default_language', 'en')
            
            # Get user info
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
            if not user:
                continue
            
            # Get retailers with unpaid invoices
            retailers = await db.retailers.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
            
            for retailer in retailers:
                # Get unpaid invoices
                invoices = await db.invoices.find(
                    {"retailer_id": retailer['id'], "payment_status": "unpaid"},
                    {"_id": 0}
                ).to_list(1000)
                
                if not invoices:
                    continue
                
                total_due = sum(inv['amount'] for inv in invoices)
                invoice_count = len(invoices)
                earliest_due_date = min(inv['due_date'] for inv in invoices)
                
                # Build message
                template = LANGUAGE_TEMPLATES[language]['reminderTemplate']
                message = template.replace('{{retailer}}', retailer['retailer_name'])
                message = message.replace('{{totalDue}}', f"{total_due:.2f}")
                message = message.replace('{{invoiceCount}}', str(invoice_count))
                message = message.replace('{{dueDate}}', earliest_due_date)
                message = message.replace('{{wholesaler}}', user['business_name'])
                
                # Send via WhatsApp service
                try:
                    async with httpx.AsyncClient() as http_client:
                        response = await http_client.post(
                            f"{WHATSAPP_SERVICE_URL}/send",
                            json={
                                "phone": retailer['retailer_phone'],
                                "message": message
                            },
                            timeout=30.0
                        )
                        result = response.json()
                        send_status = "sent" if result.get('status') == 'success' else "failed"
                        logger.info(f"Sent reminder to {retailer['retailer_name']}: {send_status}")
                except Exception as e:
                    logger.error(f"Error sending to {retailer['retailer_name']}: {e}")
                    send_status = "failed"
                
                # Log the send
                log_doc = {
                    "id": str(datetime.now(timezone.utc).timestamp()),
                    "user_id": user_id,
                    "retailer_id": retailer['id'],
                    "retailer_name": retailer['retailer_name'],
                    "language": language,
                    "total_due": total_due,
                    "invoice_count": invoice_count,
                    "message": message,
                    "status": send_status,
                    "trigger_type": "auto",
                    "sent_at": datetime.now(timezone.utc).isoformat()
                }
                await db.logs.insert_one(log_doc)
                
                # Add delay between messages
                await asyncio.sleep(2)
        
        logger.info("Automated reminder job completed")
    
    except Exception as e:
        logger.error(f"Error in automated reminder job: {e}", exc_info=True)
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(send_auto_reminders())
