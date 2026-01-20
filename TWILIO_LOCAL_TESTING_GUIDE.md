# 🧪 Twilio SMS-OTP Local Testing Guide

## ✅ All Issues Fixed!

The following issues have been resolved:
1. ✅ Frontend was using Firebase instead of Twilio backend API
2. ✅ Backend URL mismatch (was 8001, now 8000)
3. ✅ Signup.js now uses Twilio backend endpoints
4. ✅ Login.js now uses Twilio backend endpoints

---

## 🚀 Step-by-Step Testing Instructions

### Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
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

INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**✅ If you see this, backend is ready!**

---

### Step 2: Start the Frontend

Open a **NEW terminal** (keep backend running) and run:

```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**✅ Browser should automatically open to http://localhost:3000**

---

### Step 3: Test Signup Flow

1. **Go to Signup Page**
   - Click "Sign Up" button
   - Or navigate to: http://localhost:3000/auth/signup

2. **Enter Details (Step 1)**
   - **Full Name**: `arjunpratapdas` (or any name)
   - **Mobile Number**: `7086230642` OR `8822545981`
     - ⚠️ **IMPORTANT**: Only these verified numbers will work!
   - Click **"Send OTP"**

3. **Check for SMS**
   - You should receive SMS on the phone number
   - SMS will say: "Your BharatPrint verification code is: XXXXXX"
   - **Also check backend terminal** - OTP is printed there for testing!

4. **Backend Terminal Output:**
   ```
   ==================================================
   📱 OTP SENT via Twilio SMS
   ==================================================
   Phone: +917086230642
   Name: arjunpratapdas
   OTP Code: 123456
   Valid for: 5 minutes
   Message SID: SM...
   ==================================================
   ```

5. **Enter OTP (Step 2)**
   - Enter the 6-digit code from SMS (or from backend terminal)
   - Click **"Verify & Continue"**

6. **Complete Profile (Step 3)**
   - **Shop Name**: `Test Print Shop`
   - **City**: Select any city
   - Click **"Complete Sign Up"**

7. **Success!**
   - You should be redirected to `/dashboard`
   - You're now logged in!

---

### Step 4: Test Login Flow

1. **Go to Login Page**
   - Navigate to: http://localhost:3000/auth/login
   - Or click "Login" from homepage

2. **Enter Phone Number**
   - **Mobile Number**: `7086230642` OR `8822545981`
   - Click **"Send OTP"**

3. **Check for SMS**
   - You'll receive SMS with OTP
   - Check backend terminal for OTP code

4. **Enter OTP**
   - Enter the 6-digit code
   - Click **"Verify & Login"**

5. **Success!**
   - You should be logged in and redirected to dashboard

---

## 🧪 Test Different Scenarios

### Test 1: Valid Verified Number
```
Phone: 7086230642
Expected: ✅ SMS sent, OTP received
```

### Test 2: Other Verified Number
```
Phone: 8822545981
Expected: ✅ SMS sent, OTP received
```

### Test 3: Unverified Number (Should Fail)
```
Phone: 9999999999
Expected: ❌ Error: "Phone number not verified for trial account"
```

### Test 4: Invalid OTP
```
Enter: 000000
Expected: ❌ Error: "Invalid OTP"
```

### Test 5: Expired OTP
```
Wait 5 minutes, then enter OTP
Expected: ❌ Error: "OTP expired or not found"
```

### Test 6: Resend OTP
```
1. Send OTP
2. Wait for countdown to reach 0:00
3. Click "Resend OTP"
Expected: ✅ New OTP sent
```

---

## 🔍 Debugging

### Backend Not Starting?

**Check Python version:**
```bash
python --version
# Should be 3.11 or higher
```

**Reinstall dependencies:**
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

**Check Twilio config:**
```bash
cd backend
python test_twilio.py
```

---

### Frontend Not Connecting?

**Check .env.local:**
```bash
cat frontend/.env.local
# Should show: REACT_APP_BACKEND_URL=http://localhost:8000
```

**If wrong, fix it:**
```bash
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > frontend/.env.local
```

**Restart frontend:**
```bash
# Stop frontend (Ctrl+C)
npm start
```

---

### SMS Not Received?

**Check backend logs:**
- Look for "✅ SMS sent successfully via Twilio"
- Look for "Message SID: SM..."
- OTP code is printed in terminal

**Check Twilio Console:**
- Go to: https://console.twilio.com/us1/monitor/logs/sms
- Check message delivery status

**Verify phone number:**
- Make sure you're using `7086230642` or `8822545981`
- These are the only verified numbers for trial account

---

### "Failed to send OTP" Error?

**Check backend terminal for detailed error:**
```
❌ Twilio SMS failed: [error message]
```

**Common causes:**
1. Phone number not verified
2. Twilio credentials incorrect
3. Backend not running
4. Network issue

**Solution:**
```bash
# Test Twilio config
cd backend
python test_twilio.py
```

---

## 📊 What to Look For

### ✅ Success Indicators

**Backend Terminal:**
- `✅ Twilio SMS OTP enabled`
- `📱 OTP SENT via Twilio SMS`
- `✅ OTP verified successfully`

**Frontend:**
- Green toast: "OTP sent to +91XXXXXXXXXX via SMS"
- Green toast: "Account created successfully!"
- Redirected to dashboard

**Phone:**
- SMS received with 6-digit code
- Message from: +1 978 780 2379

---

### ❌ Error Indicators

**Backend Terminal:**
- `❌ Twilio SMS failed`
- `⚠️ Unverified number attempted`
- `❌ Invalid OTP`

**Frontend:**
- Red toast: "Failed to send OTP"
- Red toast: "Invalid OTP"
- Red error box above form

---

## 🎯 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Twilio initialization message appears
- [ ] Frontend loads at localhost:3000
- [ ] Can navigate to signup page
- [ ] Can enter name and phone number
- [ ] "Send OTP" button works
- [ ] SMS received on phone
- [ ] OTP printed in backend terminal
- [ ] Can enter OTP in frontend
- [ ] "Verify & Continue" works
- [ ] Can complete profile
- [ ] Redirected to dashboard
- [ ] Can logout and login again

---

## 🆘 Still Having Issues?

1. **Check both terminals** (backend and frontend) for errors
2. **Check browser console** (F12 → Console tab)
3. **Check network tab** (F12 → Network tab) for failed requests
4. **Verify environment variables** in `backend/.env`
5. **Test Twilio directly**: `python backend/test_twilio.py`

---

## 🎉 Success!

If you can:
1. ✅ Send OTP
2. ✅ Receive SMS
3. ✅ Verify OTP
4. ✅ Create account
5. ✅ Login

**Then Twilio SMS-OTP is working perfectly!** 🎊

You're ready to deploy to production!
