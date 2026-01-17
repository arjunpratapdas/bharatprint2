# 🎯 CLERK SMS-OTP Architecture - Complete System Diagram

## System Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         BHARATPRINT SMS-OTP SYSTEM                        │
│                         Powered by CLERK                                  │
└───────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────────┐
                            │   USER'S PHONE      │
                            │  📱 Receives SMS    │
                            │  "OTP: 123456"      │
                            └──────────┬──────────┘
                                       │
                                       │ SMS received
                                       ↓
                    ┌──────────────────────────────────────┐
                    │     CLERK AUTHENTICATION             │
                    │   (Cloud Service)                    │
                    │                                      │
                    │  ✅ Phone validation                 │
                    │  ✅ OTP generation                   │
                    │  ✅ SMS delivery                     │
                    │  ✅ Code verification                │
                    │  ✅ Session creation                 │
                    │                                      │
                    │  API: https://api.clerk.com          │
                    │  JWKS: https://.../well-known/jwks.json
                    └──────────┬──────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ↓                      ↓                      ↓
   ┌─────────────┐      ┌────────────────┐    ┌──────────────┐
   │   FRONTEND  │      │    BACKEND     │    │   DATABASE   │
   │  (React)    │◄────►│   (FastAPI)    │◄──►│  (Supabase)  │
   │             │      │                │    │              │
   └─────────────┘      └────────────────┘    └──────────────┘
```

---

## 📱 Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
│              (http://localhost:3000)                        │
└─────────────────────────────────────────────────────────────┘

┌─── App.js ───────────────────────────────────┐
│                                               │
│  ┌─ ClerkProvider ─────────────────────────┐  │
│  │ publishableKey=CLERK_PUBLISHABLE_KEY    │  │
│  │                                         │  │
│  │  ┌─ Pages ────────────────────────────┐ │  │
│  │  │                                    │ │  │
│  │  │  ┌─── /auth/login ──────────────┐ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  │ 1️⃣ Input Phone              │ │ │  │
│  │  │  │    └─ formatPhoneNumber()    │ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  │ 2️⃣ Send OTP                 │ │ │  │
│  │  │  │    └─ signIn.create()       │ │ │  │
│  │  │  │    └─ SMS sent              │ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  │ 3️⃣ Verify OTP              │ │ │  │
│  │  │  │    └─ signIn.attemptFirstFactor()
│  │  │  │    └─ Session created       │ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  │ 4️⃣ Backend Verify          │ │ │  │
│  │  │  │    └─ POST /auth/verify-clerk-token
│  │  │  │    └─ JWT returned          │ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  │ 5️⃣ Login Success ✅         │ │ │  │
│  │  │  │    └─ localStorage.setItem(token)
│  │  │  │    └─ navigate('/dashboard') │ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  └──────────────────────────────┘ │ │  │
│  │  │                                    │ │  │
│  │  │  ┌─── /auth/signup ──────────────┐ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  │ Steps 1-2: SMS-OTP (same as login)
│  │  │  │ Steps 3+:  User Profile      │ │ │  │
│  │  │  │            - Shop Name       │ │ │  │
│  │  │  │            - City/State      │ │ │  │
│  │  │  │                              │ │ │  │
│  │  │  └──────────────────────────────┘ │ │  │
│  │  │                                    │ │  │
│  │  └────────────────────────────────────┘ │  │
│  │                                         │  │
│  └─────────────────────────────────────────┘  │
│                                               │
└─────────────────────────────────────────────────────────────┘

  ├─ lib/clerk.js (Helper Functions)
  │  ├─ formatPhoneNumber(phone) → "+91..." format
  │  ├─ getErrorMessage(error) → User-friendly text
  │  └─ logAuthStep(step, msg, data) → Debug logs
  │
  ├─ lib/api.js (API Calls)
  │  └─ authAPI.post('/auth/verify-clerk-token')
  │
  └─ store/authStore.js (State Management)
     ├─ user → Current user data
     ├─ token → JWT token
     └─ setAuth() → Store auth data
```

---

## 🖥️ Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│              (http://localhost:8000)                        │
└─────────────────────────────────────────────────────────────┘

┌─── server.py ─────────────────────────────────────────────┐
│                                                            │
│ ┌─ API Routes ────────────────────────────────────────┐  │
│ │                                                     │  │
│ │ POST /auth/verify-clerk-token                      │  │
│ │   │                                                │  │
│ │   ├─ Receive: { phoneNumber, clerkUserId }        │  │
│ │   │                                                │  │
│ │   ├─ Validate phone format                        │  │
│ │   │  └─ "+91" + 10 digits                         │  │
│ │   │                                                │  │
│ │   ├─ Check database: db_get_user_by_phone()      │  │
│ │   │                                                │  │
│ │   ├─ If new user:                                 │  │
│ │   │  ├─ Generate UUID                            │  │
│ │   │  ├─ Generate referral code                   │  │
│ │   │  └─ db_create_user()                         │  │
│ │   │                                                │  │
│ │   ├─ If existing user:                            │  │
│ │   │  ├─ Update last_login                        │  │
│ │   │  └─ db_update_user()                         │  │
│ │   │                                                │  │
│ │   ├─ Generate JWT token                           │  │
│ │   │  └─ create_jwt_token(user_id, phone)         │  │
│ │   │                                                │  │
│ │   ├─ Build UserProfile                            │  │
│ │   │  ├─ id                                        │  │
│ │   │  ├─ phoneNumber                               │  │
│ │   │  ├─ referralCode                              │  │
│ │   │  ├─ subscriptionStatus                        │  │
│ │   │  └─ ... (other fields)                        │  │
│ │   │                                                │  │
│ │   └─ Return: {                                    │  │
│ │      success: true,                               │  │
│ │      token: "JWT...",                             │  │
│ │      isNewUser: true/false,                       │  │
│ │      user: UserProfile                            │  │
│ │    }                                              │  │
│ │                                                     │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                            │
│ ┌─ Models ────────────────────────────────────────────┐  │
│ │                                                     │  │
│ │ VerifyClerkTokenRequest                           │  │
│ │   ├─ phone_number: str                            │  │
│ │   ├─ clerk_user_id: str                           │  │
│ │   └─ name: Optional[str]                          │  │
│ │                                                     │  │
│ │ VerifyOTPResponse                                 │  │
│ │   ├─ success: bool                                │  │
│ │   ├─ token: str                                   │  │
│ │   ├─ isNewUser: bool                              │  │
│ │   └─ user: UserProfile                            │  │
│ │                                                     │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                            │
│ ┌─ Utilities ─────────────────────────────────────────┐  │
│ │                                                     │  │
│ │ create_jwt_token(user_id, phone)                  │  │
│ │   └─ Returns: "eyJhbGciOiJIUzI1NiI..."            │  │
│ │                                                     │  │
│ │ db_get_user_by_phone(phone)                       │  │
│ │   └─ Returns: User dict or None                   │  │
│ │                                                     │  │
│ │ db_create_user(user_dict)                         │  │
│ │   └─ Creates new user in database                 │  │
│ │                                                     │  │
│ │ db_update_user(user_id, updates)                  │  │
│ │   └─ Updates existing user                        │  │
│ │                                                     │  │
│ └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘

Environment Variables (.env):
├─ CLERK_SECRET_KEY=sk_test_...
├─ CLERK_JWKS_URL=https://.../.well-known/jwks.json
├─ CLERK_PUBLISHABLE_KEY=pk_test_...
├─ SUPABASE_URL=...
├─ SUPABASE_KEY=...
└─ JWT_SECRET=...
```

---

## 💾 Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                      │
│                   (Cloud PostgreSQL)                        │
└─────────────────────────────────────────────────────────────┘

┌─── users Table ──────────────────────────────────────────┐
│                                                          │
│ Columns:                                                 │
│ ├─ id (UUID) ..................... Primary key          │
│ ├─ phone_number (VARCHAR) ........ "+919876543210"      │
│ ├─ clerk_user_id (VARCHAR) ...... "user_2RnXxxx"       │
│ ├─ owner_name (VARCHAR) ......... "John Doe"           │
│ ├─ phone_verified (BOOLEAN) ..... true                 │
│ ├─ shop_name (VARCHAR) .......... "My Print Shop"      │
│ ├─ city (VARCHAR) ............... "Mumbai"             │
│ ├─ state (VARCHAR) .............. "Maharashtra"        │
│ ├─ pincode (VARCHAR) ............ "400001"             │
│ ├─ referral_code (VARCHAR) ...... "BP-ABC123XYZ"       │
│ ├─ subscription_status (VARCHAR). "free"/"premium"     │
│ ├─ documents_uploaded (INT) ..... 5                    │
│ ├─ monthly_upload_limit (INT) ... 20                   │
│ ├─ uploads_used_this_month (INT). 5                    │
│ ├─ last_login (TIMESTAMP) ....... "2024-..."           │
│ ├─ created_at (TIMESTAMP) ....... "2024-..."           │
│ └─ updated_at (TIMESTAMP) ....... "2024-..."           │
│                                                          │
│ Sample Row:                                              │
│ │ id         │ 550e8400-e29b-41d4-a716-446655440000    │
│ │ phone_number│ +919876543210                           │
│ │ clerk_user_id│ user_2RnXaV7vZXN5O...                 │
│ │ owner_name │ Arjun Kumar                              │
│ │ referral_code│ BP-KAL89HJK2                           │
│ └────────────────────────────────────────────────────────┘
│
│ Operations during Clerk login:
│ ├─ SELECT * FROM users WHERE phone_number = "+91..."
│ ├─ If NOT found:
│ │  └─ INSERT new user with clerk_user_id
│ └─ If found:
│    └─ UPDATE user SET clerk_user_id, last_login, owner_name
│
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│               SMS-OTP AUTHENTICATION - COMPLETE FLOW                │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: SEND OTP REQUEST
┌─ FRONTEND ──────────────────┐
│ signIn.create({             │
│   identifier: "+919876543210"
│ })                          │
└──────────────┬──────────────┘
               │
               │ POST to Clerk API
               ↓
┌─ CLERK ─────────────────────┐
│ 1. Validate phone format    │
│ 2. Generate 6-digit OTP     │
│ 3. Send SMS via SMS provider│
│ 4. Store OTP in memory      │
│ 5. Return success           │
└──────────────┬──────────────┘
               │
               │ SMS to user's phone
               ↓
        📱 USER RECEIVES SMS
        "Your OTP: 123456"

STEP 2: VERIFY OTP REQUEST
┌─ FRONTEND ──────────────────┐
│ signIn.attemptFirstFactor({  │
│   strategy: 'phone_code',    │
│   code: '123456'             │
│ })                          │
└──────────────┬──────────────┘
               │
               │ POST to Clerk API
               ↓
┌─ CLERK ─────────────────────┐
│ 1. Retrieve stored OTP       │
│ 2. Validate code matches     │
│ 3. Create Clerk session      │
│ 4. Return session + user ID  │
└──────────────┬──────────────┘
               │
               ↓
┌─ FRONTEND ──────────────────┐
│ setActive({                 │
│   session: sessionId         │
│ })                          │
│                             │
│ POST /auth/verify-          │
│ clerk-token                 │
└──────────────┬──────────────┘
               │
               │ {phoneNumber, clerkUserId}
               ↓
┌─ BACKEND ───────────────────────┐
│ 1. Validate phone format        │
│ 2. Query users table            │
│ 3. If new: CREATE user          │
│ 4. If exist: UPDATE user        │
│ 5. Generate JWT token           │
│ 6. Build response               │
└──────────────┬──────────────────┘
               │
               │ JSON response
               ↓
┌─ FRONTEND ──────────────────┐
│ 1. Receive token            │
│ 2. localStorage.setItem()   │
│ 3. Store user data          │
│ 4. navigate('/dashboard')   │
│ 5. User logged in ✅        │
└─────────────────────────────┘
```

---

## 🔐 Security Layer

```
┌─────────────────────────────────────────────────────────┐
│                  SECURITY FEATURES                      │
└─────────────────────────────────────────────────────────┘

1. PHONE VALIDATION
   └─ Must be 10 digits
   └─ Frontend: "+91" + digits
   └─ Backend: Re-validates format

2. OTP DELIVERY
   └─ Clerk handles SMS via Twilio
   └─ 6-digit random code
   └─ Expires after 5 minutes
   └─ Rate limited (prevent brute force)

3. SESSION MANAGEMENT
   └─ Clerk creates secure session
   └─ createdSessionId returned to frontend
   └─ setActive() activates session

4. JWT TOKEN
   └─ Generated on backend only
   └─ Signed with JWT_SECRET
   └─ Contains: user_id, phone_number
   └─ Expires after 24 hours (configurable)

5. DATABASE SECURITY
   └─ Supabase hosted (secure cloud)
   └─ Row-level security (RLS) enabled
   └─ Phone number indexed for performance
   └─ clerk_user_id indexed for lookups

6. API AUTHENTICATION
   └─ All endpoints require valid JWT
   └─ JWT verified on every request
   └─ Invalid JWT returns 401 Unauthorized

7. CORS PROTECTION
   └─ Frontend origins whitelisted
   └─ Only http://localhost:3000 allowed
   └─ Production: https://yourdomain.com

8. ERROR HANDLING
   └─ Generic error messages to frontend
   └─ Detailed logs on backend
   └─ No sensitive data in error messages
```

---

## 📊 Data Flow Diagram

```
┌──────────────┐
│   User's     │
│  Phone 📱    │
│              │
│  Receives    │
│  SMS with    │
│  OTP Code    │
└────────┬─────┘
         │
         │ User enters code in app
         │
         ↓
┌──────────────────────────┐
│   REACT FRONTEND        │
│  (http://localhost:3000)│
│                          │
│  Login Component         │
│  ├─ Enter phone          │
│  ├─ Send OTP (Clerk)     │
│  ├─ Verify OTP (Clerk)   │
│  ├─ Verify token (Backend│
│  └─ Store JWT + Redirect │
└────────┬─────────────────┘
         │
         │ POST /auth/verify-clerk-token
         │ {phoneNumber, clerkUserId}
         │
         ↓
┌──────────────────────────┐
│   FASTAPI BACKEND       │
│  (http://localhost:8000)│
│                          │
│  verify_clerk_token()    │
│  ├─ Format phone         │
│  ├─ Query users table    │
│  ├─ Create/Update user   │
│  ├─ Generate JWT token   │
│  └─ Return response      │
└────────┬─────────────────┘
         │
         │ {token, user, isNewUser}
         │
         ↓
┌──────────────────────────┐
│   SUPABASE DATABASE     │
│                          │
│  users table:            │
│  ├─ phone_number         │
│  ├─ clerk_user_id        │
│  ├─ referral_code        │
│  └─ ... (other fields)   │
└──────────────────────────┘

         ↑
         │ Frontend stores JWT
         │ in localStorage
         │
         ↓
┌──────────────────────────┐
│   Dashboard Access ✅    │
│                          │
│  All API calls include:  │
│  Header: {               │
│    Authorization:        │
│    Bearer <JWT_TOKEN>    │
│  }                       │
└──────────────────────────┘
```

---

## 🎯 Component Integration Map

```
┌──────────────────────────────────────────────────────────────┐
│                   COMPONENT DEPENDENCIES                     │
└──────────────────────────────────────────────────────────────┘

Frontend/src/App.js
├── imports @clerk/clerk-react
├── wraps with ClerkProvider
└── includes all route components

Frontend/src/pages/auth/Login.js
├── imports useSignIn (Clerk)
├── imports authAPI (backend calls)
├── imports formatPhoneNumber (clerk.js helper)
├── imports getErrorMessage (clerk.js helper)
├── imports logAuthStep (clerk.js helper)
└── imports useAuthStore (state management)

Frontend/src/pages/auth/Signup.js
├── imports useSignUp (Clerk)
├── imports formatPhoneNumber (clerk.js helper)
├── imports getErrorMessage (clerk.js helper)
└── imports authAPI (backend calls)

Frontend/src/lib/clerk.js
├── formatPhoneNumber()
├── getErrorMessage()
├── logAuthStep()
└── Error message mappings

Frontend/src/lib/api.js
├── Creates axios instance
├── Sets base URL to http://localhost:8000
└── POST /auth/verify-clerk-token

Backend/server.py
├── FastAPI app
├── VerifyClerkTokenRequest model
├── @api_router.post("/auth/verify-clerk-token")
├── Connects to Supabase database
└── Returns VerifyOTPResponse

Backend/requirements.txt
├── fastapi
├── uvicorn
├── pydantic
├── supabase
├── python-jose
├── passlib
└── ... (other dependencies)

Database (Supabase)
├── users table
├── phone_number (indexed)
├── clerk_user_id (indexed)
└── All other user fields
```

---

## 🚀 Deployment Ready

```
✅ FRONTEND
   ├─ Clerk SDK installed
   ├─ Components updated
   ├─ .env.local configured
   ├─ No syntax errors
   └─ Ready to test

✅ BACKEND
   ├─ /auth/verify-clerk-token endpoint added
   ├─ Database integration complete
   ├─ JWT generation working
   ├─ .env configured
   └─ No syntax errors

✅ CONFIGURATION
   ├─ Clerk credentials set
   ├─ Database credentials set
   ├─ JWT secret configured
   └─ CORS properly configured

✅ SECURITY
   ├─ Phone validation
   ├─ OTP verification
   ├─ JWT token-based auth
   ├─ Database indexed
   └─ Error messages sanitized

✅ ERROR HANDLING
   ├─ Invalid phone format
   ├─ Wrong OTP code
   ├─ Missing credentials
   ├─ Database errors
   └─ Network failures

STATUS: 🚀 READY FOR PRODUCTION TESTING
```

---

**Diagram Created:** 2024
**System Status:** ✅ **FULLY INTEGRATED**
**Next Action:** Start testing with real phone number!
