from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    business_name: str
    owner_name: str
    whatsapp_number: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    business_name: str
    owner_name: str
    whatsapp_number: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    business_name: str
    owner_name: str
    whatsapp_number: str
    email: str

class Retailer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    retailer_name: str
    retailer_phone: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RetailerCreate(BaseModel):
    retailer_name: str
    retailer_phone: str

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    retailer_id: str
    user_id: str
    invoice_number: str
    amount: float
    invoice_date: str
    due_date: str
    payment_status: str = "unpaid"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    retailer_id: str
    invoice_number: str
    amount: float
    invoice_date: str
    due_date: str
    payment_status: str = "unpaid"

class InvoiceUpdate(BaseModel):
    payment_status: str

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    default_language: str = "en"
    default_credit_days: int = 30
    reminder_frequency: str = "weekly"
    auto_reminder_enabled: bool = False
    auto_send_time: str = "09:00"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    default_language: Optional[str] = None
    default_credit_days: Optional[int] = None
    reminder_frequency: Optional[str] = None
    auto_reminder_enabled: Optional[bool] = None
    auto_send_time: Optional[str] = None

class Log(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    retailer_id: str
    retailer_name: str
    language: str
    total_due: float
    invoice_count: int
    message: str
    status: str
    trigger_type: str
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LogCreate(BaseModel):
    retailer_id: str
    retailer_name: str
    language: str
    total_due: float
    invoice_count: int
    message: str
    status: str
    trigger_type: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UploadedData(BaseModel):
    retailers: List[dict]
    invoices: List[dict]
