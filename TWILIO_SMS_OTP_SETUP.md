# Twilio SMS-OTP Authentication Setup

## ✅ Implementation Complete

BharatPrint now uses **Twilio SMS** as the primary authentication method for login and signup.

---

## 🔧 Configuration

### Environment Variables (Already Set)

The following variables are configured in `backend/.env`:

```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER_HERE
TWILIO_VERIFIED_NUMBERS=+917086230642,+918822545981
```

### Twilio Trial Account Limitations

Since you're using a **Twilio Trial Account**, SMS can only be sent to:
- ✅ **+91 70862 30642** (Verified)
- ✅ **+91 88225 45981** (Verified)

**To add more test numbers:**
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Phone Numbers → Manage → Verified Caller IDs**
3. Click **Add a new Caller ID**
4. Enter the phone number and complete verification
5. Add the number to `TWILIO_VERIFIED_NUMBERS` in `.env` (comma-separated)

---

## 📱 How It Works

### 1. **User Signup/Login Flow**

```
User enters phone number
        ↓
Backend validates format (+91XXXXXXXXXX)
        ↓
Check if number is verified (trial account)
        ↓
Generate 6-digit OTP
        ↓
Send SMS via Twilio
        ↓
Store OTP in database (5-minute expiration)
        ↓
User enters OTP
        ↓
Backend verifies OTP
        ↓
Create/login user & return JWT token
```

### 2. **OTP Expiration**
- **Duration**: 5 minutes (300 seconds)
- **Attempts**: Maximum 5 attempts per OTP
- **After expiration**: User must request a new OTP

### 3. **Security Features**
- ✅ OTP is hashed before storage (bcrypt)
- ✅ Rate limiting on verification attempts
- ✅ OTP is deleted after successful verification
- ✅ Phone number format validation
- ✅ Trial account number verification

---

## 🔌 API Endpoints

### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "+917086230642",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to +917086230642 via SMS",
  "expiresIn": 300,
  "phoneNumber": "+917086230642"
}
```

**Errors:**
- `400`: Invalid phone number format
- `403`: Phone number not verified (trial account)
- `500`: SMS service not configured

---

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+917086230642",
  "otpCode": "123456",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "isNewUser": true,
  "user": {
    "id": "uuid",
    "phoneNumber": "+917086230642",
    "shopName": "",
    "referralCode": "BP_06421234",
    "onboardingCompleted": false,
    ...
  }
}
```

**Errors:**
- `400`: Invalid OTP or expired
- `400`: Too many attempts (>5)

---

## 🧪 Testing

### Local Testing
```bash
# Start the backend
cd backend
uvicorn server:app --reload --port 8000

# Test send OTP
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+917086230642", "name": "Test User"}'

# Check console for OTP code (printed in dev mode)
# Then verify OTP
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+917086230642", "otpCode": "123456"}'
```

### Frontend Integration
No changes needed! The frontend already uses these endpoints:
- `frontend/src/lib/api.js` - API calls
- `frontend/src/pages/auth/Login.js` - Login page
- `frontend/src/pages/auth/Signup.js` - Signup page

---

## 🚀 Deployment

### Render Environment Variables
Add these to your Render service:

```
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER_HERE
TWILIO_VERIFIED_NUMBERS=+917086230642,+918822545981
```

### Netlify (Frontend)
No changes needed - frontend already configured.

---

## 📊 Database Schema

The existing `otps` table in Supabase is used:

```sql
CREATE TABLE otps (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(6),  -- For dev/debugging only
  otp_hash VARCHAR(255) NOT NULL,
  attempts INTEGER DEFAULT 0,
  sent_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  message_sid VARCHAR(50)  -- Twilio message tracking
);
```

---

## 🔄 Upgrading from Trial to Production

When you upgrade your Twilio account:

1. **Remove verified number restriction**:
   - Delete or comment out `TWILIO_VERIFIED_NUMBERS` in `.env`
   - The code will automatically allow all numbers

2. **Update phone number** (if needed):
   - Get a dedicated Indian phone number (+91)
   - Update `TWILIO_PHONE_NUMBER` in `.env`

3. **Remove dev logging**:
   - Remove `otp_code` from database storage
   - Remove console OTP printing

---

## 🐛 Troubleshooting

### "SMS service not configured"
- Check `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set
- Restart the backend server

### "Phone number not verified"
- Add the number to Twilio Console → Verified Caller IDs
- Add to `TWILIO_VERIFIED_NUMBERS` in `.env`

### "Failed to send SMS"
- Check Twilio account balance (trial accounts have limits)
- Verify phone number format is correct (+91XXXXXXXXXX)
- Check Twilio Console logs for detailed error

### OTP not received
- Check phone number is verified in Twilio Console
- Check Twilio Console → Logs → Messages for delivery status
- Verify phone has signal and can receive SMS

---

## 📝 Notes

- **Firebase authentication** is still available as a backup (endpoints preserved)
- **Frontend** requires no changes - already compatible
- **OTP codes** are printed to console in development mode for easy testing
- **Trial account** can send ~50 SMS messages for free

---

## ✅ Checklist

- [x] Twilio SDK installed (`twilio==9.0.4`)
- [x] Environment variables configured
- [x] Send OTP endpoint updated
- [x] Verify OTP endpoint working
- [x] Trial account number verification
- [x] Error handling for common issues
- [x] Database schema compatible
- [x] Frontend compatibility maintained
- [x] Documentation complete

---

## 🎉 Ready to Use!

Your Twilio SMS-OTP authentication is now live and ready for testing with the verified numbers!
