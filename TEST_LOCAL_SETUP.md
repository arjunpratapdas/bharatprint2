# Local Testing Guide - SMS OTP System

## Issue Found & Fixed

**Problem**: Backend was running on port 8001, but frontend was configured to connect to port 8000.

**Solution**: 
- ✅ Updated `backend/server.py` to use port 8000
- ✅ Updated `frontend/.env.local` to point to `http://localhost:8000`

---

## Step-by-Step Testing Instructions

### 1. Start Backend Server

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Linux/Mac
pip install -r requirements.txt
python server.py
```

**Expected Output:**
```
============================================================
🚀 BharatPrint API starting up...
============================================================
✅ Connected to Supabase
✅ Twilio SMS OTP enabled
   📱 From: +19787802379
   ✓ Verified: 2 numbers
============================================================
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view bharatprint in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### 3. Test the Signup Flow

1. **Open Browser**: Navigate to `http://localhost:3000/auth/signup`

2. **Step 1 - Enter Details**:
   - Name: `Test User`
   - Phone: `7086230642` or `8822545981` (verified numbers)
   - Click "Send OTP"

3. **Check Backend Console**: You should see:
   ```
   ==================================================
   📱 OTP SENT via Twilio SMS
   ==================================================
   Phone: +917086230642
   Name: Test User
   OTP Code: 123456
   Valid for: 5 minutes
   Message SID: SM...
   ==================================================
   ```

4. **Step 2 - Enter OTP**:
   - Check your phone for SMS
   - Enter the 6-digit OTP
   - Click "Verify & Continue"

5. **Step 3 - Complete Profile**:
   - Shop Name: `Test Print Shop`
   - City: Select any city
   - Click "Complete Sign Up"

6. **Success**: You should be redirected to `/dashboard`

---

## Troubleshooting

### Backend Not Starting

**Error**: `ModuleNotFoundError: No module named 'twilio'`
```bash
cd backend
pip install -r requirements.txt
```

**Error**: `Address already in use`
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Frontend Not Connecting

**Error**: `Failed to fetch OTP`
- ✅ Check backend is running on port 8000
- ✅ Check `frontend/.env.local` has `REACT_APP_BACKEND_URL=http://localhost:8000`
- ✅ Restart frontend: `Ctrl+C` then `npm start`

### OTP Not Received

**Error**: `Phone number not verified`
- ✅ Use only verified numbers: `+917086230642` or `+918822545981`
- ✅ Check `backend/.env` has correct `TWILIO_VERIFIED_NUMBERS`

### CORS Error

**Error**: `Access-Control-Allow-Origin`
- ✅ Check `backend/.env` has `CORS_ORIGINS=http://localhost:3000,...`
- ✅ Restart backend server

---

## Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:8000/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "BharatPrint API",
  "version": "1.0.0",
  "timestamp": "2026-01-20T..."
}
```

### Test Send OTP API
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+917086230642", "name": "Test User"}'
```

Expected:
```json
{
  "success": true,
  "message": "OTP sent to +917086230642 via SMS",
  "expiresIn": 300,
  "phoneNumber": "+917086230642"
}
```

---

## Verified Phone Numbers (Twilio Trial)

- ✅ `+917086230642`
- ✅ `+918822545981`

**Note**: Twilio trial accounts can only send SMS to verified numbers. To add more numbers, verify them in the [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/verified).

---

## Next Steps After Local Testing

1. ✅ Test complete signup flow (Steps 1-3)
2. ✅ Test login flow with existing user
3. ✅ Verify JWT token is stored in localStorage
4. ✅ Test dashboard access after login
5. 🚀 Deploy to production (Render + Netlify)

---

## Files Modified

- ✅ `backend/server.py` - Changed port from 8001 to 8000
- ✅ `frontend/.env.local` - Updated backend URL to port 8000
