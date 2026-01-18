# 📍 SMS-OTP & Firebase Code Location Guide

## 🎯 Quick Navigation

### Frontend Files (React)
| Component | File Path | Purpose |
|-----------|-----------|---------|
| Firebase Config | `frontend/src/lib/firebase.js` | SDK initialization, reCAPTCHA, phone auth functions |
| Login Page | `frontend/src/pages/auth/Login.js` | SMS-OTP login flow |
| Signup Page | `frontend/src/pages/auth/Signup.js` | SMS-OTP signup flow |
| Auth Store | `frontend/src/store/authStore.js` | User state management |
| API Helpers | `frontend/src/lib/api.js` | Backend API calls |

### Backend Files (Python)
| Component | File Path | Purpose |
|-----------|-----------|---------|
| Server | `backend/server.py` | All OTP endpoints and Firebase verification |
| Requirements | `backend/requirements.txt` | Python dependencies (Firebase Admin SDK) |
| Config | `backend/.env` | Firebase credentials path |

---

## 📍 FRONTEND - SMS-OTP Authentication

### 1. Firebase Configuration
**File:** `frontend/src/lib/firebase.js` (93 lines)

**What it contains:**
```javascript
// Lines 1-20: Imports
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ... } from 'firebase/auth';

// Lines 5-15: Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC7k2z8...",
  authDomain: "bharatprint-b388f.firebaseapp.com",
  projectId: "bharatprint-b388f",
  ...
}

// Lines 19-32: Firebase Initialization
app = initializeApp(firebaseConfig);
auth = getAuth(app);
auth.useDeviceLanguage();
setPersistence(auth, browserLocalPersistence);

// Lines 38-60: reCAPTCHA Verifier
const createRecaptchaVerifier = () => { ... }
const resetRecaptchaVerifier = () => { ... }

// Lines 92: Exports
export { auth, RecaptchaVerifier, signInWithPhoneNumber, createRecaptchaVerifier, resetRecaptchaVerifier };
```

**Key Functions:**
- `createRecaptchaVerifier()` - Creates invisible reCAPTCHA for verification
- `resetRecaptchaVerifier()` - Resets reCAPTCHA after use
- `signInWithPhoneNumber(auth, phone, verifier)` - Sends OTP via Firebase

---

### 2. Login Page
**File:** `frontend/src/pages/auth/Login.js` (387 lines)

**Step-by-Step Flow:**

#### Step 1: Phone Input (Lines 45-70)
```javascript
const handleSendOTP = async (e) => {
  // Line 47: Validate 10-digit phone number
  if (!phoneNumber || phoneNumber.length !== 10) { return; }
  
  // Line 56: Format with +91 country code
  const formattedPhone = `+91${phoneNumber}`;
  
  // Line 59: Create reCAPTCHA verifier
  const verifier = createRecaptchaVerifier();
  
  // Line 62: Send OTP via Firebase
  confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
  
  // Line 68: Move to OTP verification step
  setStep(2);
  setCountdown(300); // 5 minutes to verify
}
```

#### Step 2: OTP Verification (Lines 72-130)
```javascript
const handleVerifyOTP = async (e) => {
  e.preventDefault();
  
  // Lines 92-99: Combine 6 OTP digits
  const otpCode = otp.join('');
  
  // Line 106: Verify with Firebase
  const result = await confirmationResult.confirm(otpCode);
  
  // Line 110: Get Firebase ID token
  const idToken = await result.user.getIdToken();
  
  // Line 115: Send to backend for JWT creation
  const response = await authAPI.verifyFirebaseToken({
    idToken,
    phoneNumber,
    name: ''
  });
}
```

#### Step 3: Redirect to Dashboard (Lines 125-145)
```javascript
// After backend verification:
setAuth({
  token: response.token,
  user: response.user,
});
navigate('/dashboard');
```

**Key Variables:**
- `phoneNumber` - User's 10-digit phone (state)
- `otp` - Array of 6 OTP digits (state)
- `confirmationResult` - Firebase confirmation result
- `countdown` - 5-minute timer (300 seconds)

**Important Elements:**
- reCAPTCHA container: `<div id="recaptcha-container"></div>`
- OTP inputs: 6 individual fields with auto-focus
- Error handling: Toast notifications

---

### 3. Signup Page
**File:** `frontend/src/pages/auth/Signup.js` (Same structure as Login.js)

**Differences:**
- 3-step process instead of 2
- Step 1: Phone + Send OTP
- Step 2: Verify OTP
- Step 3: Enter shop details (name, city, state, pincode)

**Key Function (Lines 130-160):**
```javascript
const handleCompleteSignup = async () => {
  // Get Firebase ID token
  const idToken = await result.user.getIdToken();
  
  // Send to backend with shop details
  const response = await authAPI.verifyFirebaseToken({
    idToken,
    phoneNumber,
    name: shopName,
  });
}
```

---

### 4. Auth Store
**File:** `frontend/src/store/authStore.js`

**Manages:**
```javascript
setAuth(user) - Store user data and JWT token
getAuth() - Retrieve current user
logout() - Clear auth state
```

---

### 5. API Helper
**File:** `frontend/src/lib/api.js`

**Backend calls:**
```javascript
authAPI.verifyFirebaseToken({
  idToken,
  phoneNumber,
  name
})
// Returns: { token: JWT, user: userData, isNewUser: boolean }
```

---

## 📍 BACKEND - SMS-OTP Endpoints

### 1. Firebase Initialization
**File:** `backend/server.py` (Lines 55-67)

```python
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

firebase_credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
cred = credentials.Certificate(firebase_credentials_path)
firebase_app = firebase_admin.initialize_app(cred)
```

**Needs:**
- `FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json` in `.env`

---

### 2. Send OTP Endpoint
**File:** `backend/server.py` (Lines 424-481)

```python
@api_router.post("/auth/send-otp", response_model=SendOTPResponse)
async def send_otp(request: SendOTPRequest):
    """Send OTP via Firebase SMS service"""
    phone = request.phone_number
    name = request.name
    
    # Format phone with +91
    phone_formatted = f"+91{phone}"
    
    # Generate 6-digit OTP
    otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Store OTP record (expires in 10 minutes)
    otp_doc = {
        "phone_number": phone_formatted,
        "otp_code": otp_code,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        "verified_at": None
    }
    await db_create_otp(otp_doc)
    
    # Print to console (development mode)
    print(f"\n{'='*50}")
    print(f"📱 OTP SENT (Firebase)")
    print(f"Phone: {phone_formatted}")
    print(f"OTP Code: {otp_code}")
    print(f"Valid for: 10 minutes")
    print(f"{'='*50}\n")
```

**Request Model:**
```python
class SendOTPRequest(BaseModel):
    phone_number: str = Field(alias="phoneNumber")
    name: Optional[str] = None
```

**Response Model:**
```python
class SendOTPResponse(BaseModel):
    success: bool
    message: str
    expiresIn: int = 600  # 10 minutes
    phoneNumber: str
```

---

### 3. Verify Firebase Token Endpoint (MAIN)
**File:** `backend/server.py` (Lines 690-798)

**This is the KEY endpoint for SMS-OTP authentication:**

```python
@api_router.post("/auth/verify-firebase-token", response_model=VerifyOTPResponse)
async def verify_firebase_token(request: VerifyOTPFirebaseRequest):
    """Verify Firebase ID token and create/return user"""
    
    id_token = request.id_token
    phone = request.phone_number
    name = request.name
    
    # Step 1: Verify Firebase Token (Lines 700-728)
    from firebase_admin import auth as firebase_auth
    decoded_token = firebase_auth.verify_id_token(id_token)
    firebase_uid = decoded_token.get('uid')
    firebase_phone = decoded_token.get('phone_number')
    
    # Step 2: Find or Create User (Lines 730-760)
    user = await db_get_user_by_phone(phone_formatted)
    if not user:
        # Create new user
        user = {
            "id": str(uuid.uuid4()),
            "phone_number": phone_formatted,
            "owner_name": name,
            "firebase_uid": firebase_uid,
            "subscription_status": "free",
            "created_at": datetime.now(timezone.utc).isoformat(),
            ...
        }
        await db_create_user(user)
    
    # Step 3: Generate JWT Token (Lines 762-790)
    jwt_token = generate_jwt_token(user["id"], phone_formatted)
    
    # Step 4: Return Response (Lines 791-798)
    return VerifyOTPResponse(
        success=True,
        token=jwt_token,
        isNewUser=is_new_user,
        user=UserProfile(...)
    )
```

**Request Model:**
```python
class VerifyOTPFirebaseRequest(BaseModel):
    id_token: str = Field(alias="idToken")
    phone_number: str = Field(alias="phoneNumber")
    name: Optional[str] = None
```

**Response Model:**
```python
class VerifyOTPResponse(BaseModel):
    success: bool
    token: str  # JWT token for session
    isNewUser: bool
    user: UserProfile  # User data
```

---

### 4. Other OTP Endpoints

#### Verify OTP (Old - kept for compatibility)
**File:** `backend/server.py` (Lines 484-600)

Uses stored OTP from database (fallback method)

#### Verify OTP Firebase
**File:** `backend/server.py` (Lines 602-688)

Alternative Firebase verification endpoint

---

## 🔄 Complete Authentication Flow

```
FRONTEND (Browser)
├─ User enters phone number
├─ Click "Send OTP"
│  └─ createRecaptchaVerifier()
│     └─ signInWithPhoneNumber("+91XXXXXXXXXX", verifier)
│        └─ Firebase sends SMS to phone
│
├─ User receives SMS with OTP
│
├─ User enters 6-digit OTP
├─ Click "Verify OTP"
│  └─ confirmationResult.confirm(otpCode)
│     └─ Firebase verifies OTP locally
│        └─ result.user.getIdToken()
│
├─ GET FIREBASE ID TOKEN
│  └─ Send to backend: POST /auth/verify-firebase-token
│
BACKEND (Python)
├─ Receive Firebase ID token
├─ firebase_auth.verify_id_token(id_token)
│  └─ Verify signature & expiration
│
├─ Extract Firebase UID & phone
├─ Find or create user in database
├─ Generate JWT token
│
└─ Return: JWT + User data + isNewUser flag

FRONTEND (Resume)
├─ Store JWT in localStorage
├─ Store user in auth store
├─ Redirect to dashboard
└─ Include JWT in all API requests (Authorization header)
```

---

## 📋 Environment Configuration

### Frontend (.env.local)
```
REACT_APP_BACKEND_URL=http://localhost:8001

# Firebase config is hardcoded in frontend/src/lib/firebase.js
```

### Backend (.env)
```
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json

JWT_SECRET=your-super-secret-jwt-key

CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Database
SUPABASE_URL=...
SUPABASE_KEY=...
```

---

## 🧪 Testing the Flow

### 1. Start Services
```bash
# Backend
cd backend && python3 server.py

# Frontend
cd frontend && npm start
```

### 2. Go to Login
```
http://localhost:3000/auth/login
```

### 3. Enter Phone Number
- Example: `9876543210` (any 10 digits)

### 4. Check Backend Terminal
- OTP will be printed
- Example: `OTP Code: 123456`

### 5. Enter OTP in Frontend
- Copy the code from terminal
- Enter in 6 OTP fields
- Click Verify

### 6. Success
- Redirected to dashboard
- User is authenticated

---

## 📞 Key Imports Across Files

### Frontend Imports Firebase
```javascript
// In Login.js and Signup.js
import { auth, signInWithPhoneNumber, createRecaptchaVerifier, resetRecaptchaVerifier } from '../../lib/firebase';
```

### Backend Imports Firebase Admin
```python
# In server.py
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
```

### Frontend Calls Backend
```javascript
// In Login.js and Signup.js
const response = await authAPI.verifyFirebaseToken({
  idToken,
  phoneNumber,
  name
});
```

---

## 🔑 Important Values

| Key | Value | Location |
|-----|-------|----------|
| Firebase Project ID | `bharatprint-b388f` | frontend/src/lib/firebase.js |
| Firebase API Key | `AIzaSyC7k2z8...` | frontend/src/lib/firebase.js |
| OTP Validity | 10 minutes (600 seconds) | backend/server.py line 462 |
| Countdown Timer | 5 minutes (300 seconds) | frontend/src/pages/auth/Login.js line 89 |
| Phone Format | `+91XXXXXXXXXX` | Both frontend and backend |
| OTP Length | 6 digits | backend/server.py line 456 |

---

## ✅ Summary

**SMS-OTP Authentication is fully implemented using:**

1. **Frontend**: Firebase SDK for phone authentication + reCAPTCHA
2. **Backend**: Firebase Admin SDK for token verification + JWT generation
3. **Database**: Stores users and OTP records
4. **Security**: Firebase handles SMS security, backend validates tokens

**All code is in:**
- Frontend: `frontend/src/lib/firebase.js`, `frontend/src/pages/auth/Login.js`, `frontend/src/pages/auth/Signup.js`
- Backend: `backend/server.py` (lines 55-798)
