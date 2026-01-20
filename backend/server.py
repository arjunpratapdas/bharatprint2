from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
import io
import qrcode
import base64
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# Initialize Supabase client
supabase_client = None
try:
    if SUPABASE_URL and SUPABASE_KEY and 'your-project' not in SUPABASE_URL:
        from supabase import create_client, Client
        supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logging.info("Supabase client initialized successfully")
    else:
        logging.warning("Supabase credentials not configured - using mock database")
except Exception as e:
    logging.warning(f"Failed to initialize Supabase: {e}")

# Twilio SMS Configuration
twilio_client = None
TWILIO_PHONE_NUMBER = None
TWILIO_VERIFIED_NUMBERS = []
try:
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
    verified_numbers_str = os.getenv('TWILIO_VERIFIED_NUMBERS', '')
    
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        from twilio.rest import Client as TwilioClient
        twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Parse verified numbers
        if verified_numbers_str:
            TWILIO_VERIFIED_NUMBERS = [num.strip() for num in verified_numbers_str.split(',')]
        
        logging.info(f"✅ Twilio SMS client initialized successfully")
        logging.info(f"📱 Twilio Phone: {TWILIO_PHONE_NUMBER}")
        logging.info(f"✓ Verified Numbers: {len(TWILIO_VERIFIED_NUMBERS)} numbers")
    else:
        logging.warning("⚠️ Twilio credentials not configured - SMS OTP will not work")
except Exception as e:
    logging.error(f"❌ Failed to initialize Twilio: {e}")

# Razorpay client
razorpay_client = None
try:
    if os.getenv('RAZORPAY_KEY_ID') and os.getenv('RAZORPAY_SECRET_KEY'):
        import razorpay
        razorpay_client = razorpay.Client(auth=(
            os.getenv('RAZORPAY_KEY_ID'),
            os.getenv('RAZORPAY_SECRET_KEY')
        ))
        logging.info("Razorpay client initialized")
except Exception as e:
    logging.warning(f"Razorpay not configured: {e}")

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-this-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30

# Setup lifespan
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("="*60)
    logging.info("🚀 BharatPrint API starting up...")
    logging.info("="*60)
    
    if supabase_client:
        logging.info("✅ Connected to Supabase")
    else:
        logging.warning("⚠️ Running with mock database - configure Supabase for production")
    
    if twilio_client:
        logging.info(f"✅ Twilio SMS OTP enabled")
        logging.info(f"   📱 From: {TWILIO_PHONE_NUMBER}")
        logging.info(f"   ✓ Verified: {len(TWILIO_VERIFIED_NUMBERS)} numbers")
    else:
        logging.warning("⚠️ Twilio SMS not configured - OTP will not work")
    
    logging.info("="*60)
    
    yield
    
    # Shutdown
    logging.info("👋 BharatPrint API shutting down...")

# Create the main app
app = FastAPI(title="BharatPrint API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# In-memory mock database for development when Supabase is not configured
mock_db = {
    "users": [],
    "otps": [],
    "documents": [],
    "files": {}
}

# ==================== MODELS ====================

class SendOTPRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    phone_number: str = Field(alias="phoneNumber")
    name: Optional[str] = None

class SendOTPResponse(BaseModel):
    success: bool
    message: str
    expires_in: int = Field(alias="expiresIn")
    phone_number: str = Field(alias="phoneNumber")
    model_config = ConfigDict(populate_by_name=True)

class VerifyOTPRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    otp_code: Optional[str] = Field(None, alias="otpCode")
    otp: Optional[str] = None  # Alternative field name from frontend
    name: Optional[str] = None
    
    def get_phone_number(self):
        return self.phone_number
    
    def get_otp_code(self):
        return self.otp_code or self.otp


class UserProfile(BaseModel):
    id: str
    phone_number: str = Field(alias="phoneNumber")
    shop_name: Optional[str] = Field(None, alias="shopName")
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    referral_code: str = Field(alias="referralCode")
    onboarding_completed: bool = Field(alias="onboardingCompleted")
    subscription_status: Optional[str] = Field("free", alias="subscriptionStatus")
    monthly_upload_limit: int = Field(20, alias="monthlyUploadLimit")
    uploads_used_this_month: int = Field(0, alias="uploadsUsedThisMonth")
    trial_ends_at: Optional[str] = Field(None, alias="trialEndsAt")
    model_config = ConfigDict(populate_by_name=True)

class VerifyOTPResponse(BaseModel):
    success: bool
    token: str
    is_new_user: bool = Field(alias="isNewUser")
    user: UserProfile
    model_config = ConfigDict(populate_by_name=True)

class RegisterRequest(BaseModel):
    name: str = Field(alias="name")
    shop_name: str = Field(alias="shopName")
    city: str
    state: Optional[str] = "Assam"
    pincode: Optional[str] = None
    business_category: Optional[str] = Field("print_shop", alias="businessCategory")
    referral_code: Optional[str] = Field(None, alias="referralCode")
    model_config = ConfigDict(populate_by_name=True)

# ==================== HELPER FUNCTIONS ====================

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(random.randint(100000, 999999))

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_referral_code(phone: str) -> str:
    """Generate unique referral code / merchant code"""
    suffix = phone[-4:] if len(phone) >= 4 else phone
    random_part = str(random.randint(1000, 9999))
    return f"BP_{suffix.upper()}{random_part}"

def create_jwt_token(user_id: str, phone: str) -> str:
    """Create JWT token"""
    payload = {
        'sub': user_id,
        'phone': phone,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_qr_code(data: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#134252", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"

# ==================== DATABASE OPERATIONS ====================

async def db_get_user_by_phone(phone: str):
    """Get user by phone number"""
    if supabase_client:
        try:
            result = supabase_client.table('users').select('*').eq('phone_number', phone).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase user query failed: {e}")
    
    # Fall back to mock_db
    if "users" in mock_db:
        for user in mock_db["users"]:
            if user.get("phone_number") == phone:
                return user
    return None

async def db_get_user_by_id(user_id: str):
    """Get user by ID"""
    if supabase_client:
        try:
            result = supabase_client.table('users').select('*').eq('id', user_id).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase user query failed: {e}")
    
    # Fall back to mock_db
    if "users" in mock_db:
        for user in mock_db["users"]:
            if user.get("id") == user_id:
                return user
    return None

async def db_get_user_by_merchant_code(merchant_code: str):
    """Get user by merchant/referral code"""
    if supabase_client:
        try:
            result = supabase_client.table('users').select('*').eq('referral_code', merchant_code).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase user query failed: {e}")
    
    # Fall back to mock_db
    if "users" in mock_db:
        for user in mock_db["users"]:
            if user.get("referral_code") == merchant_code:
                return user
    return None

async def db_create_user(user_data: dict):
    """Create new user"""
    if supabase_client:
        try:
            result = supabase_client.table('users').insert(user_data).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase user insert failed: {e}")
    
    # Fall back to mock_db
    if "users" not in mock_db:
        mock_db["users"] = []
    mock_db["users"].append(user_data)
    return user_data

async def db_update_user(user_id: str, update_data: dict):
    """Update user"""
    if supabase_client:
        try:
            result = supabase_client.table('users').update(update_data).eq('id', user_id).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase user update failed: {e}")
    
    # Fall back to mock_db
    if "users" in mock_db:
        for i, user in enumerate(mock_db["users"]):
            if user.get("id") == user_id:
                mock_db["users"][i].update(update_data)
                return mock_db["users"][i]
    return None

async def db_create_otp(otp_data: dict):
    """Store OTP record"""
    if supabase_client:
        try:
            result = supabase_client.table('otps').insert(otp_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Supabase OTP insert failed: {e}")
            # Fall back to mock_db
            if "otps" not in mock_db:
                mock_db["otps"] = []
            mock_db["otps"].append(otp_data)
            return otp_data
    else:
        if "otps" not in mock_db:
            mock_db["otps"] = []
        mock_db["otps"].append(otp_data)
        return otp_data

async def db_get_latest_otp(phone: str):
    """Get latest valid OTP for phone"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Try Supabase first
    if supabase_client:
        try:
            result = supabase_client.table('otps')\
                .select('*')\
                .eq('phone_number', phone)\
                .gt('expires_at', now)\
                .is_('verified_at', 'null')\
                .order('sent_at', desc=True)\
                .limit(1)\
                .execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase OTP query failed: {e}")
    
    # Fall back to mock_db (or if Supabase failed)
    if "otps" in mock_db:
        valid_otps = [
            otp for otp in mock_db["otps"]
            if otp.get("phone_number") == phone
            and otp.get("expires_at") > now
            and otp.get("verified_at") is None
        ]
        return valid_otps[-1] if valid_otps else None
    
    return None

async def db_update_otp(otp_id: str, update_data: dict):
    """Update OTP record"""
    if supabase_client:
        try:
            result = supabase_client.table('otps').update(update_data).eq('id', otp_id).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            logging.error(f"Supabase OTP update failed: {e}")
    
    # Fall back to mock_db (or if Supabase failed)
    if "otps" in mock_db:
        for i, otp in enumerate(mock_db["otps"]):
            if otp.get("id") == otp_id:
                mock_db["otps"][i].update(update_data)
                return mock_db["otps"][i]
    
    return None

async def db_create_document(doc_data: dict):
    """Create document record"""
    if supabase_client:
        result = supabase_client.table('documents').insert(doc_data).execute()
        return result.data[0] if result.data else None
    else:
        mock_db["documents"].append(doc_data)
        return doc_data

async def db_get_documents_by_user(user_id: str, limit: int = 20, offset: int = 0):
    """Get user's documents"""
    if supabase_client:
        result = supabase_client.table('documents')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('status', 'active')\
            .order('created_at', desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        return result.data
    else:
        docs = [d for d in mock_db["documents"] if d.get("user_id") == user_id and d.get("status") == "active"]
        return docs[offset:offset + limit]

async def db_count_documents_by_user(user_id: str):
    """Count user's active documents"""
    if supabase_client:
        result = supabase_client.table('documents')\
            .select('id', count='exact')\
            .eq('user_id', user_id)\
            .eq('status', 'active')\
            .execute()
        return result.count or 0
    else:
        return len([d for d in mock_db["documents"] if d.get("user_id") == user_id and d.get("status") == "active"])

async def db_get_document_by_id(doc_id: str, user_id: str = None):
    """Get document by ID"""
    if supabase_client:
        query = supabase_client.table('documents').select('*').eq('id', doc_id)
        if user_id:
            query = query.eq('user_id', user_id)
        result = query.execute()
        return result.data[0] if result.data else None
    else:
        for doc in mock_db["documents"]:
            if doc.get("id") == doc_id:
                if user_id and doc.get("user_id") != user_id:
                    continue
                return doc
        return None

async def db_get_document_by_share_link(share_link: str):
    """Get document by share link"""
    if supabase_client:
        result = supabase_client.table('documents').select('*').eq('shared_link', share_link).execute()
        return result.data[0] if result.data else None
    else:
        for doc in mock_db["documents"]:
            if doc.get("shared_link") == share_link:
                return doc
        return None

async def db_update_document(doc_id: str, update_data: dict):
    """Update document"""
    if supabase_client:
        result = supabase_client.table('documents').update(update_data).eq('id', doc_id).execute()
        return result.data[0] if result.data else None
    else:
        for i, doc in enumerate(mock_db["documents"]):
            if doc.get("id") == doc_id:
                mock_db["documents"][i].update(update_data)
                return mock_db["documents"][i]
        return None

async def db_get_expired_trials():
    """Get users with expired trials"""
    now = datetime.now(timezone.utc).isoformat()
    if supabase_client:
        result = supabase_client.table('users')\
            .select('*')\
            .eq('subscription_status', 'trial')\
            .lt('trial_ends_at', now)\
            .execute()
        return result.data
    else:
        return [
            u for u in mock_db["users"]
            if u.get("subscription_status") == "trial"
            and u.get("trial_ends_at") and u.get("trial_ends_at") < now
        ]

# ==================== AUTH DEPENDENCY ====================

async def get_current_user(authorization: str = Header(None)):
    """Dependency to get current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    
    try:
        token = authorization.replace('Bearer ', '')
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        user = await db_get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTHENTICATION ENDPOINTS ====================

@api_router.post("/auth/send-otp", response_model=SendOTPResponse)
async def send_otp(request: SendOTPRequest):
    """Send OTP via Twilio SMS service"""
    phone = request.phone_number
    name = request.name
    
    # Format phone number - accept both formats
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    # Remove all non-digit characters (spaces, dashes, etc.)
    phone_digits = ''.join(c for c in phone if c.isdigit())
    
    # Check length and format consistently
    if len(phone_digits) == 10:
        # Indian phone number without country code - add +91
        phone_formatted = f"+91{phone_digits}"
    elif len(phone_digits) == 12 and phone_digits.startswith('91'):
        # Already has country code (91) - add + prefix
        phone_formatted = f"+{phone_digits}"
    elif len(phone_digits) == 11 and phone_digits.startswith('91'):
        # Has country code but missing one digit - invalid
        raise HTTPException(status_code=400, detail="Invalid phone number. Please enter a valid 10-digit Indian mobile number.")
    else:
        raise HTTPException(status_code=400, detail=f"Invalid phone number format. Expected 10 digits, got {len(phone_digits)} digits. Please enter a valid 10-digit Indian mobile number.")
    
    # Check if Twilio is configured
    if not twilio_client:
        logging.error("❌ Twilio client not initialized - check environment variables")
        raise HTTPException(
            status_code=500, 
            detail="SMS service not configured. Please contact support."
        )
    
    if not TWILIO_PHONE_NUMBER:
        logging.error("❌ Twilio phone number not configured")
        raise HTTPException(
            status_code=500,
            detail="SMS service phone number not configured. Please contact support."
        )
    
    # TRIAL ACCOUNT CHECK: Verify phone number is in verified list
    if TWILIO_VERIFIED_NUMBERS and phone_formatted not in TWILIO_VERIFIED_NUMBERS:
        logging.warning(f"⚠️ Unverified number attempted: {phone_formatted}")
        logging.warning(f"⚠️ Verified numbers: {TWILIO_VERIFIED_NUMBERS}")
        raise HTTPException(
            status_code=403,
            detail=f"This phone number ({phone_formatted}) is not verified for trial account. Please use a verified number or verify {phone_formatted} in Twilio Console first."
        )
    
    # Generate OTP
    otp_code = generate_otp()
    otp_hash = hash_password(otp_code)
    
    # Send SMS via Twilio
    try:
        logging.info(f"📤 Attempting to send SMS to {phone_formatted} via Twilio...")
        message = twilio_client.messages.create(
            body=f"Your BharatPrint verification code is: {otp_code}\n\nValid for 5 minutes.\n\nDo not share this code with anyone.",
            from_=TWILIO_PHONE_NUMBER,
            to=phone_formatted
        )
        
        logging.info(f"✅ SMS sent successfully via Twilio")
        logging.info(f"📱 To: {phone_formatted}")
        logging.info(f"📨 Message SID: {message.sid}")
        logging.info(f"📊 Status: {message.status}")
        
    except Exception as e:
        error_message = str(e)
        logging.error(f"❌ Twilio SMS failed: {error_message}")
        logging.error(f"❌ Error type: {type(e).__name__}")
        
        # Check for common Twilio errors
        error_lower = error_message.lower()
        if "not a valid phone number" in error_lower or "invalid" in error_lower:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid phone number format: {phone_formatted}. Please enter a valid 10-digit Indian mobile number."
            )
        elif "unverified" in error_lower or "not verified" in error_lower:
            raise HTTPException(
                status_code=403,
                detail=f"Phone number {phone_formatted} must be verified in Twilio Console for trial accounts. Please verify the number or use a different verified number."
            )
        elif "authentication" in error_lower or "credentials" in error_lower or "unauthorized" in error_lower:
            raise HTTPException(
                status_code=500,
                detail="SMS service authentication failed. Please contact support."
            )
        elif "network" in error_lower or "connection" in error_lower or "timeout" in error_lower:
            raise HTTPException(
                status_code=503,
                detail="SMS service temporarily unavailable. Please try again in a few moments."
            )
        else:
            # Generic error - include the actual error message for debugging
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to send SMS: {error_message}. Please try again or contact support."
            )
    
    # Store OTP in database (5-minute expiration as per Twilio best practices)
    otp_doc = {
        "id": str(uuid.uuid4()),
        "phone_number": phone_formatted,
        "otp_code": otp_code,  # For dev/debugging
        "otp_hash": otp_hash,
        "attempts": 0,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
        "verified_at": None,
        "message_sid": message.sid  # Twilio tracking
    }
    
    # Store OTP (will use Supabase or fallback to memory automatically)
    await db_create_otp(otp_doc)
    logging.info(f"✅ OTP stored successfully")
    
    # Development mode: print OTP to console
    logging.info(f"[DEV MODE] OTP for {phone_formatted}: {otp_code}")
    print(f"\n{'='*50}")
    print(f"📱 OTP SENT via Twilio SMS")
    print(f"{'='*50}")
    print(f"Phone: {phone_formatted}")
    if name:
        print(f"Name: {name}")
    print(f"OTP Code: {otp_code}")
    print(f"Valid for: 5 minutes")
    print(f"Message SID: {message.sid}")
    print(f"{'='*50}\n")
    
    return SendOTPResponse(
        success=True,
        message=f"OTP sent to {phone_formatted} via SMS",
        expiresIn=300,  # 5 minutes = 300 seconds
        phoneNumber=phone_formatted
    )

@api_router.post("/auth/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP and return JWT token"""
    phone = request.get_phone_number()
    otp_code = request.get_otp_code()
    name = request.name
    
    # Validate inputs
    if not phone or not otp_code:
        raise HTTPException(status_code=400, detail="Phone number and OTP code are required")
    
    # Format phone number - accept both formats (with and without +91)
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    
    # Remove all non-digit characters (spaces, dashes, etc.)
    phone_digits = ''.join(c for c in phone if c.isdigit())
    
    # Format consistently
    if len(phone_digits) == 10:
        # Indian phone number without country code - add +91
        phone_formatted = f"+91{phone_digits}"
    elif len(phone_digits) == 12 and phone_digits.startswith('91'):
        # Already has country code (91) - add + prefix
        phone_formatted = f"+{phone_digits}"
    else:
        raise HTTPException(status_code=400, detail=f"Invalid phone number format. Expected 10 digits, got {len(phone_digits)} digits. Please enter a valid 10-digit Indian mobile number.")
    
    logging.info(f"Verifying OTP for phone: {phone_formatted}, OTP: {otp_code}")
    
    # Find latest unexpired OTP using formatted phone
    otp_record = await db_get_latest_otp(phone_formatted)
    
    if not otp_record:
        logging.error(f"OTP not found for phone: {phone_formatted}")
        raise HTTPException(status_code=400, detail="OTP expired or not found")
    
    # Check attempts
    if otp_record.get('attempts', 0) >= 5:
        raise HTTPException(status_code=400, detail="Too many attempts. Request new OTP.")
    
    # Verify OTP (check both hash and plain for dev mode)
    is_valid = verify_password(otp_code, otp_record['otp_hash']) or otp_code == otp_record.get('otp_code')
    
    if not is_valid:
        await db_update_otp(otp_record['id'], {"attempts": otp_record.get('attempts', 0) + 1})
        logging.error(f"Invalid OTP: {otp_code}")
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Mark OTP as verified
    await db_update_otp(otp_record['id'], {"verified_at": datetime.now(timezone.utc).isoformat()})
    
    # Find or create user
    user = await db_get_user_by_phone(phone_formatted)
    
    is_new_user = False
    if not user:
        is_new_user = True
        user_id = str(uuid.uuid4())
        referral_code = generate_referral_code(phone_formatted)
        
        user = {
            "id": user_id,
            "phone_number": phone_formatted,
            "owner_name": name or "",  # Save the name provided during signup
            "phone_verified": True,
            "shop_name": "",
            "city": "",
            "state": "Assam",
            "pincode": None,
            "business_category": "print_shop",
            "referral_code": referral_code,
            "documents_uploaded": 0,
            "subscription_status": "free",
            "monthly_upload_limit": 20,
            "uploads_used_this_month": 0,
            "onboarding_completed": False,
            "trial_started_at": None,
            "trial_ends_at": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db_create_user(user)
        logging.info(f"New user created: {user_id}")
    else:
        # Update name if provided and not already set
        update_data = {"last_login": datetime.now(timezone.utc).isoformat()}
        if name and not user.get('owner_name'):
            update_data["owner_name"] = name
        await db_update_user(user['id'], update_data)
        logging.info(f"Existing user logged in: {user['id']}")
    
    # Generate JWT token
    token = create_jwt_token(user['id'], phone_formatted)
    
    # Build user profile
    user_profile = UserProfile(
        id=user['id'],
        phoneNumber=user['phone_number'],
        shopName=user.get('shop_name', ''),
        city=user.get('city', ''),
        state=user.get('state', 'Assam'),
        pincode=user.get('pincode'),
        referralCode=user['referral_code'],
        onboardingCompleted=user.get('onboarding_completed', False),
        subscriptionStatus=user.get('subscription_status', 'free'),
        monthlyUploadLimit=user.get('monthly_upload_limit', 20),
        uploadsUsedThisMonth=user.get('uploads_used_this_month', 0),
        trialEndsAt=user.get('trial_ends_at')
    )
    
    return VerifyOTPResponse(
        success=True,
        token=token,
        isNewUser=is_new_user,
        user=user_profile
    )


@api_router.post("/auth/register")
async def register_user(request: RegisterRequest, current_user: dict = Depends(get_current_user)):
    """Complete user profile during onboarding"""
    user_id = current_user['id']
    
    update_data = {
        "owner_name": request.name,
        "shop_name": request.shop_name,
        "city": request.city,
        "state": request.state or "Assam",
        "pincode": request.pincode,
        "business_category": request.business_category or "print_shop",
        "onboarding_completed": True,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db_update_user(user_id, update_data)
    user = await db_get_user_by_id(user_id)
    
    return {
        "success": True,
        "user": {
            "id": user['id'],
            "phoneNumber": user['phone_number'],
            "shopName": user['shop_name'],
            "city": user['city'],
            "referralCode": user['referral_code'],
            "onboardingCompleted": True
        }
    }

# ==================== DOCUMENT ENDPOINTS ====================

@api_router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    customer_name: str = Form(..., alias="customerName"),
    customer_phone: Optional[str] = Form(None, alias="customerPhone"),
    customer_email: Optional[str] = Form(None, alias="customerEmail"),
    order_details: Optional[str] = Form(None, alias="orderDetails"),
    due_date: Optional[str] = Form(None, alias="dueDate"),
    one_time_view: bool = Form(False, alias="oneTimeView"),
    delete_after_minutes: int = Form(5, alias="deleteAfterMinutes"),
    allow_download: bool = Form(True, alias="allowDownload"),
    current_user: dict = Depends(get_current_user)
):
    """Upload document with auto-delete"""
    user_id = current_user['id']
    
    # Check upload limit
    upload_limit = current_user.get('monthly_upload_limit', 20)
    uploads_used = current_user.get('uploads_used_this_month', 0)
    
    if uploads_used >= upload_limit:
        raise HTTPException(status_code=400, detail="Monthly upload limit reached. Please upgrade your plan.")
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > 52428800:  # 50MB
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
    
    document_id = str(uuid.uuid4())
    share_link_uuid = str(uuid.uuid4())
    auto_delete_at = datetime.now(timezone.utc) + timedelta(minutes=delete_after_minutes)
    
    # Store file content (in production, use Supabase Storage)
    file_storage_key = f"docs/{document_id}/{file.filename}"
    
    if supabase_client:
        # Upload to Supabase Storage
        try:
            supabase_client.storage.from_('documents').upload(file_storage_key, file_content)
        except Exception as e:
            logging.error(f"Failed to upload to Supabase Storage: {e}")
            mock_db["files"][file_storage_key] = file_content
    else:
        mock_db["files"][file_storage_key] = file_content
    
    # Create document record
    doc_record = {
        "id": document_id,
        "user_id": user_id,
        "document_name": file.filename,
        "document_type": file.content_type,
        "file_size_bytes": len(file_content),
        "file_storage_key": file_storage_key,
        "shared_link": share_link_uuid,
        "share_link_expires_at": auto_delete_at.isoformat(),
        "share_view_count": 0,
        "one_time_view": one_time_view,
        "allow_merchant_download": allow_download,
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "customer_email": customer_email,
        "order_details": order_details,
        "due_date": due_date,
        "status": "active",
        "auto_delete_at": auto_delete_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db_create_document(doc_record)
    
    # Update user stats
    await db_update_user(user_id, {
        "documents_uploaded": current_user.get('documents_uploaded', 0) + 1,
        "uploads_used_this_month": uploads_used + 1
    })
    
    # Generate QR code
    share_url = f"https://bharatprint.app/view/{share_link_uuid}"
    qr_code = generate_qr_code(share_url)
    
    return {
        "success": True,
        "document": {
            "id": document_id,
            "documentName": file.filename,
            "sharedLink": share_url,
            "qrCode": qr_code,
            "expiresIn": delete_after_minutes * 60,
            "shareCount": 0,
            "createdAt": doc_record['created_at']
        }
    }

@api_router.get("/documents/list")
async def list_documents(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """List user's documents with pagination"""
    user_id = current_user['id']
    
    total = await db_count_documents_by_user(user_id)
    documents = await db_get_documents_by_user(user_id, limit, offset)
    
    formatted_docs = []
    for doc in documents:
        # Handle documents that may not have shared_link (e.g., customer uploads)
        shared_link = doc.get('shared_link')
        shared_url = f"https://bharatprint.app/view/{shared_link}" if shared_link else None
        
        formatted_docs.append({
            "id": doc['id'],
            "documentName": doc['document_name'],
            "customerName": doc.get('customer_name', ''),
            "customerPhone": doc.get('customer_phone', ''),
            "fileSize": doc['file_size_bytes'],
            "shareCount": doc['share_view_count'],
            "sharedLink": shared_url,
            "expiresAt": doc.get('share_link_expires_at'),
            "createdAt": doc['created_at'],
            "status": doc['status']
        })
    
    return {
        "success": True,
        "documents": formatted_docs,
        "total": total,
        "hasMore": (offset + limit) < total
    }

@api_router.get("/documents/{document_id}")
async def get_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Get single document details"""
    doc = await db_get_document_by_id(document_id, current_user['id'])
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "success": True,
        "document": {
            "id": doc['id'],
            "documentName": doc['document_name'],
            "customerName": doc.get('customer_name', ''),
            "customerPhone": doc.get('customer_phone', ''),
            "customerEmail": doc.get('customer_email', ''),
            "orderDetails": doc.get('order_details', ''),
            "dueDate": doc.get('due_date'),
            "fileSize": doc['file_size_bytes'],
            "mimeType": doc['document_type'],
            "shareCount": doc['share_view_count'],
            "sharedLink": f"https://bharatprint.app/view/{doc['shared_link']}",
            "expiresAt": doc['share_link_expires_at'],
            "createdAt": doc['created_at']
        }
    }

@api_router.get("/documents/public/{share_link}")
async def view_shared_document(share_link: str):
    """View shared document (public, no auth)"""
    doc = await db_get_document_by_share_link(share_link)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or expired")
    
    # Check if expired
    expires_at = datetime.fromisoformat(doc['share_link_expires_at'].replace('Z', '+00:00'))
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Document has expired")
    
    # Check one-time view
    if doc.get('one_time_view') and doc['share_view_count'] > 0:
        raise HTTPException(status_code=410, detail="Document was a one-time view and has been accessed")
    
    # Increment view count
    await db_update_document(doc['id'], {"share_view_count": doc['share_view_count'] + 1})
    
    # Calculate remaining time in seconds
    time_remaining = int((expires_at - datetime.now(timezone.utc)).total_seconds())
    
    return {
        "success": True,
        "document": {
            "id": doc['id'],
            "customerName": doc.get('customer_name', ''),
            "orderDetails": doc.get('order_details', ''),
            "downloadUrl": f"/api/documents/download/{share_link}",
            "expires": max(0, time_remaining),
            "oneTimeView": doc.get('one_time_view', False),
            "fileName": doc['document_name'],
            "fileType": doc['document_type'],
            "allowDownload": doc.get('allow_merchant_download', True)
        }
    }

@api_router.get("/documents/download/{share_link}")
async def download_document(share_link: str):
    """Download shared document"""
    doc = await db_get_document_by_share_link(share_link)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get file content
    file_storage_key = doc.get('file_storage_key')
    file_content = None
    
    if supabase_client:
        try:
            file_content = supabase_client.storage.from_('documents').download(file_storage_key)
        except:
            file_content = mock_db["files"].get(file_storage_key)
    else:
        file_content = mock_db["files"].get(file_storage_key)
    
    if not file_content:
        raise HTTPException(status_code=404, detail="File not found")
    
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=doc['document_type'],
        headers={"Content-Disposition": f"attachment; filename={doc['document_name']}"}
    )

@api_router.delete("/documents/{document_id}")
async def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """Delete document manually"""
    doc = await db_get_document_by_id(document_id, current_user['id'])
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from storage
    file_storage_key = doc.get('file_storage_key')
    if supabase_client and file_storage_key:
        try:
            supabase_client.storage.from_('documents').remove([file_storage_key])
        except:
            pass
    
    if file_storage_key in mock_db["files"]:
        del mock_db["files"][file_storage_key]
    
    await db_update_document(document_id, {
        "status": "deleted",
        "deleted_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Document deleted successfully"}

# ==================== CUSTOMER UPLOAD ENDPOINT ====================

@api_router.post("/documents/customer-upload/{merchant_code}")
async def customer_upload_document(
    merchant_code: str,
    file: UploadFile = File(...),
    self_destruct_minutes: int = Form(5),
    allow_merchant_download: bool = Form(False)
):
    """Customer uploads document to merchant's portal (no auth required)"""
    # Find merchant by code
    merchant = await db_get_user_by_merchant_code(merchant_code)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    # Validate file
    file_content = await file.read()
    if len(file_content) > 52428800:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB.")
    
    document_id = str(uuid.uuid4())
    auto_delete_at = datetime.now(timezone.utc) + timedelta(minutes=self_destruct_minutes)
    
    # Store file
    file_storage_key = f"customer-uploads/{document_id}/{file.filename}"
    if supabase_client:
        try:
            supabase_client.storage.from_('documents').upload(file_storage_key, file_content)
        except:
            mock_db["files"][file_storage_key] = file_content
    else:
        mock_db["files"][file_storage_key] = file_content
    
    # Create document record
    doc_record = {
        "id": document_id,
        "user_id": merchant['id'],
        "document_name": file.filename,
        "document_type": file.content_type,
        "file_size_bytes": len(file_content),
        "file_storage_key": file_storage_key,
        "customer_uploaded": True,
        "allow_merchant_download": allow_merchant_download,
        "self_destruct_minutes": self_destruct_minutes,
        "status": "active",
        "share_view_count": 0,
        "auto_delete_at": auto_delete_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db_create_document(doc_record)
    
    # Update merchant stats
    await db_update_user(merchant['id'], {
        "documents_uploaded": merchant.get('documents_uploaded', 0) + 1
    })
    
    return {
        "success": True,
        "message": "Document uploaded successfully",
        "documentId": document_id,
        "selfDestructIn": self_destruct_minutes,
        "merchantShop": merchant.get('shop_name', 'Print Shop')
    }

# ==================== DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    user_id = current_user['id']
    
    total_documents = await db_count_documents_by_user(user_id)
    documents = await db_get_documents_by_user(user_id, 1000, 0)
    
    # Calculate stats
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    
    documents_this_month = 0
    documents_this_week = 0
    total_views = 0
    
    for doc in documents:
        created = datetime.fromisoformat(doc['created_at'].replace('Z', '+00:00'))
        if created >= month_start:
            documents_this_month += 1
        if created >= week_start:
            documents_this_week += 1
        total_views += doc.get('share_view_count', 0)
    
    return {
        "success": True,
        "stats": {
            "documents": {
                "totalUploaded": total_documents,
                "thisMonth": documents_this_month,
                "thisWeek": documents_this_week,
                "totalViews": total_views
            },
            "subscription": {
                "plan": current_user.get('subscription_status', 'free'),
                "monthlyLimit": current_user.get('monthly_upload_limit', 20),
                "used": current_user.get('uploads_used_this_month', 0),
                "remaining": current_user.get('monthly_upload_limit', 20) - current_user.get('uploads_used_this_month', 0)
            },
            "recentActivity": []
        }
    }

# ==================== SUBSCRIPTION ENDPOINTS ====================

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "success": True,
        "plans": [
            {
                "id": "plan_free",
                "name": "Free",
                "pricePerMonth": 0,
                "monthlyLimit": 20,
                "features": [
                    "20 documents/month",
                    "5-minute auto-delete",
                    "Basic analytics"
                ]
            },
            {
                "id": "plan_unlimited",
                "name": "Unlimited",
                "pricePerMonth": 250,
                "monthlyLimit": 999999,
                "trialDays": 7,
                "features": [
                    "Unlimited documents",
                    "Custom auto-delete (5/10/15 min)",
                    "Advanced analytics",
                    "Priority support"
                ]
            }
        ]
    }

@api_router.post("/subscriptions/start-trial")
async def start_trial(current_user: dict = Depends(get_current_user)):
    """Start 7-day unlimited trial"""
    user_id = current_user['id']
    
    # Check if already on trial or paid plan
    if current_user.get('subscription_status') in ['trial', 'unlimited']:
        raise HTTPException(status_code=400, detail="Already on trial or paid plan")
    
    # Check if user already had a trial
    if current_user.get('trial_started_at'):
        raise HTTPException(status_code=400, detail="Trial already used")
    
    # Set trial
    trial_end = datetime.now(timezone.utc) + timedelta(days=7)
    await db_update_user(user_id, {
        "subscription_status": "trial",
        "trial_started_at": datetime.now(timezone.utc).isoformat(),
        "trial_ends_at": trial_end.isoformat(),
        "monthly_upload_limit": 999999,
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "message": "7-day unlimited trial activated",
        "trialEndsAt": trial_end.isoformat()
    }

@api_router.post("/subscriptions/create-order")
async def create_subscription_order(
    plan_id: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Create Razorpay payment order"""
    razorpay_key = os.getenv('RAZORPAY_KEY_ID', '')
    
    if not razorpay_key or not razorpay_client:
        # Return mock order for testing when Razorpay not configured
        return {
            "success": True,
            "order": {
                "orderId": "order_" + str(uuid.uuid4())[:12],
                "amount": 25000,
                "currency": "INR",
                "razorpayKeyId": razorpay_key or "rzp_test_placeholder",
                "planDetails": {
                    "name": "Unlimited",
                    "monthlyLimit": 999999,
                    "price": 250
                }
            },
            "testMode": True
        }
    
    try:
        # Create Razorpay order
        order_data = {
            "amount": 25000,  # ₹250 in paise
            "currency": "INR",
            "receipt": f"bp_sub_{current_user['id'][:8]}",
            "notes": {
                "user_id": current_user['id'],
                "plan_id": plan_id,
                "phone": current_user.get('phone_number', '')
            }
        }
        
        razorpay_order = razorpay_client.order.create(data=order_data)
        
        return {
            "success": True,
            "order": {
                "orderId": razorpay_order['id'],
                "amount": razorpay_order['amount'],
                "currency": razorpay_order['currency'],
                "razorpayKeyId": razorpay_key,
                "planDetails": {
                    "name": "Unlimited",
                    "monthlyLimit": 999999,
                    "price": 250
                }
            }
        }
    except Exception as e:
        logging.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

@api_router.post("/subscriptions/verify-payment")
async def verify_payment(
    razorpay_order_id: str = Form(...),
    razorpay_payment_id: str = Form(...),
    razorpay_signature: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Verify Razorpay payment and activate subscription"""
    user_id = current_user['id']
    
    if not razorpay_client:
        # Mock verification for testing
        await db_update_user(user_id, {
            "subscription_status": "unlimited",
            "monthly_upload_limit": 999999,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        return {
            "success": True,
            "message": "Subscription activated (test mode)",
            "subscription": {
                "plan": "unlimited",
                "monthlyLimit": 999999
            }
        }
    
    try:
        # Verify signature
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Payment verified - activate subscription
        await db_update_user(user_id, {
            "subscription_status": "unlimited",
            "monthly_upload_limit": 999999,
            "subscription_payment_id": razorpay_payment_id,
            "subscription_started_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "message": "Payment verified! Subscription activated.",
            "subscription": {
                "plan": "unlimited",
                "monthlyLimit": 999999,
                "paymentId": razorpay_payment_id
            }
        }
    except Exception as e:
        logging.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=400, detail="Payment verification failed")

# ==================== TRIAL MANAGEMENT (BACKGROUND TASK) ====================

async def check_expired_trials():
    """Check and downgrade expired trials - Run daily via cron or background task"""
    expired_users = await db_get_expired_trials()
    
    for user in expired_users:
        # Downgrade to free plan
        await db_update_user(user['id'], {
            "subscription_status": "free",
            "monthly_upload_limit": 20,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        
        logging.info(f"Downgraded user {user['id']} from trial to free")
    
    return len(expired_users)

@api_router.post("/admin/check-trials")
async def trigger_trial_check():
    """Manual trigger for trial check (for testing)"""
    count = await check_expired_trials()
    return {"success": True, "downgraded_count": count}

# ==================== REFERRAL ENDPOINTS (MINIMAL - FOR API COMPATIBILITY) ====================

@api_router.get("/referrals/my-code")
async def get_my_referral_code(current_user: dict = Depends(get_current_user)):
    """Get user's merchant code (keeping for API compatibility)"""
    return {
        "success": True,
        "referral": {
            "code": current_user['referral_code'],
            "referralLink": f"https://bharatprint.app/upload/{current_user['referral_code']}",
            "qrCode": generate_qr_code(f"https://bharatprint.app/upload/{current_user['referral_code']}"),
            "referralsCount": {"total": 0, "pending": 0, "earned": 0, "claimed": 0},
            "rewardsEarned": {"totalRupees": 0, "pendingRupees": 0, "claimedRupees": 0},
            "referrals": []
        }
    }

# ==================== HEALTH & STATUS ENDPOINTS ====================

@app.get("/health", tags=["Status"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "BharatPrint API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/", tags=["Status"])
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to BharatPrint API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Suppress favicon.ico 404 errors"""
    return {"detail": "Not Found"}, 204

# ==================== INCLUDE ROUTER & MIDDLEWARE ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
