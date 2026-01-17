# 🔑 BHARATPRINT - REQUIRED CREDENTIALS

This document lists **ALL** credentials you need to provide for the MVP to run properly from Day 1.

---

## ✅ CRITICAL CREDENTIALS (MVP WON'T WORK WITHOUT THESE)

### 1. **Twilio (OTP/SMS Service)**
Required for: User authentication via OTP

**Where to get:**
1. Sign up at https://www.twilio.com/
2. Go to Console → Account → Settings
3. Get these values:

```bash
# In /app/backend/.env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"  # Your Twilio phone number (must be verified)
```

**Cost:** ~$1-2 per 100 SMS (India rates)

**Testing:** During development, OTP will print to console if Twilio is not configured

---

## 🔄 PLACEHOLDER CREDENTIALS (ADD LATER FOR FULL FUNCTIONALITY)

### 2. **Razorpay (Payment Gateway)**
Required for: Subscription payments (Starter & Pro plans)

**Where to get:**
1. Sign up at https://razorpay.com/
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys

```bash
# In /app/backend/.env
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxx"  # or rzp_live_xxxxxxxxxxxxx
RAZORPAY_SECRET_KEY="your_secret_key_here"
```

**Status:** Currently using placeholder - payments won't work until you add real keys
**Cost:** 2% + GST per transaction

---

## 🔒 AUTO-GENERATED CREDENTIALS (NO ACTION NEEDED)

### 3. **JWT Secret**
Already generated in `/app/backend/.env`:
```bash
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

**Recommendation:** Change this to a strong random string before production deployment

**Generate strong secret:**
```bash
openssl rand -base64 32
```

---

## 📊 DATABASE CREDENTIALS (ALREADY CONFIGURED)

### 4. **MongoDB**
Already configured in `/app/backend/.env`:
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="bharatprint_db"
```

**Status:** ✅ Working locally  
**Production:** You'll need MongoDB Atlas or similar for deployment

---

## 🌐 FRONTEND ENVIRONMENT

Already configured in `/app/frontend/.env`:
```bash
REACT_APP_BACKEND_URL="<your-backend-url>"
```

**Status:** ✅ Configured for local development

---

## 📝 CREDENTIAL CHECKLIST

### For MVP to be 100% functional:

- [ ] **TWILIO_ACCOUNT_SID** - Get from Twilio Console
- [ ] **TWILIO_AUTH_TOKEN** - Get from Twilio Console
- [ ] **TWILIO_PHONE_NUMBER** - Buy/verify on Twilio
- [ ] **RAZORPAY_KEY_ID** - Get from Razorpay Dashboard (for payments)
- [ ] **RAZORPAY_SECRET_KEY** - Get from Razorpay Dashboard (for payments)
- [ ] **JWT_SECRET** - Change to strong random string (optional but recommended)

---

## 🚀 QUICK START STEPS

1. **Sign up for Twilio** (critical for OTP authentication)
2. **Add Twilio credentials** to `/app/backend/.env`
3. **Restart backend server:** `sudo supervisorctl restart backend`
4. **Test OTP flow** by signing up with your phone number
5. **Add Razorpay later** when you want to enable paid subscriptions

---

## 🔧 HOW TO UPDATE CREDENTIALS

### Step 1: Edit the `.env` file
```bash
nano /app/backend/.env
```

### Step 2: Add your credentials
```bash
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_token_here"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Step 3: Restart backend
```bash
sudo supervisorctl restart backend
```

### Step 4: Test
```bash
# Check if backend is running
sudo supervisorctl status backend

# Check logs
tail -f /var/log/supervisor/backend.out.log
```

---

## ⚠️ IMPORTANT NOTES

### Development Mode (Current State):
- **OTP:** Prints to console instead of sending SMS
- **Payments:** Returns placeholder response
- **Everything else:** Fully functional

### Production Mode (After adding credentials):
- **OTP:** Real SMS via Twilio
- **Payments:** Real transactions via Razorpay
- **Security:** Change JWT_SECRET to strong random string

---

## 💰 ESTIMATED COSTS

### Monthly (for 1000 users):
- **Twilio SMS:** ~₹500-1000 (assuming 3 OTPs per user/month)
- **MongoDB Atlas:** ₹0 (Free tier) to ₹1500 (Shared cluster)
- **Razorpay:** 2% of transaction value
- **Hosting:** ₹0 (current platform) or ₹500-2000 (external)

**Total:** ~₹1000-3500/month for 1000 active users

---

## 📞 SUPPORT

If you have issues with:
- **Twilio setup:** https://www.twilio.com/docs/usage/tutorials/how-to-use-your-free-trial-account
- **Razorpay setup:** https://razorpay.com/docs/payments/
- **General questions:** Check `/app/README.md` or contact your development team

---

## ✅ VERIFICATION

Once you've added Twilio credentials, verify by:

1. Go to `/auth/signup`
2. Enter your phone number
3. Click "Send OTP"
4. You should receive SMS with 6-digit code
5. Enter OTP and complete signup

If OTP prints to console instead of SMS, Twilio is not configured correctly.

---

**Last Updated:** January 2026  
**Version:** 1.0.0
