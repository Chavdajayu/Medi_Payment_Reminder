from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WHATSAPP_SERVICE_URL = os.environ.get('WHATSAPP_SERVICE_URL', 'http://localhost:3001')

class WhatsAppPayload(BaseModel):
    phone: str
    message: str

@app.post("/api/send-whatsapp")
async def send_whatsapp(payload: WhatsAppPayload):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send",
                json=payload.model_dump(),
                timeout=30.0
            )
            return response.json()
    except Exception as e:
        print(f"Error sending WhatsApp: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/whatsapp/qr")
async def get_qr():
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{WHATSAPP_SERVICE_URL}/qr")
            return resp.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/whatsapp/status")
async def get_status():
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{WHATSAPP_SERVICE_URL}/status")
            return resp.json()
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}

@app.get("/")
def root():
    return {"status": "ok", "mode": "local-bridge"}
