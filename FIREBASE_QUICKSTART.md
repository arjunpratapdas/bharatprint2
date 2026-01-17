65# 🚀 Quick Start - Firebase SMS-OTP Setup

## 5-Minute Setup Guide

### What's Changed?
- ✅ Twilio replaced with Firebase for SMS-OTP
- ✅ Name and phone automatically saved to database
- ✅ Better security with reCAPTCHA
- ✅ No extra SMS cost management

---

## Step 1: Get Firebase Service Account (2 minutes)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select `bharatprint-b388f` project
3. Click ⚙️ icon → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate New Private Key"**
6. A JSON file will download

---

## Step 2: Setup Backend (2 minutes)

### 2a. Create backend/.env file

Create a new file: `backend/.env`

Copy this:
```env
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json
JWT_SECRET=change-this-to-something-random-and-long
```

Replace with your actual values.

### 2b. Add Firebase Service Account Key

1. In the JSON file you downloaded (step 1), check the filename
2. Copy/move it to: `backend/firebase-service-account-key.json`
3. Make sure `.gitignore` includes this file (it should):
   ```
   backend/.env
   backend/firebase-service-account-key.json
   ```

### 2c. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

---

## Step 3: Setup Frontend (1 minute)

Create a new file: `frontend/.env.local`

Copy this:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

That's it! Firebase config is already in the code.

---

## Step 4: Start Development Servers

### Terminal 1 - Backend
```bash
cd backend
python -m uvicorn server:app --reload
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
Firebase Admin SDK initialized successfully
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

Browser opens to http://localhost:3000

---

## Step 5: Test Signup

1. Go to http://localhost:3000/auth/signup
2. Enter your name
3. Enter a phone number (10 digits, you'll receive a real SMS!)
4. Click "Send OTP"
5. Check your phone for the OTP message
6. Enter the OTP
7. Complete your profile (shop name, city, etc)
8. ✅ You're in!

---

## Verify in Database

After signup, check your database:

**Supabase Console** → `users` table

You should see:
- ✅ `phone_number` = your phone
- ✅ `owner_name` = your name
- ✅ `phone_verified` = true
- ✅ All other profile fields

---

## 🎯 How It Works

```
You enter name + phone
        ↓
Firebase sends OTP via SMS
        ↓
You enter OTP
        ↓
Firebase confirms OTP
        ↓
Backend creates user + saves name & phone
        ↓
You complete profile
        ↓
All data saved ✅
```

---

## ⚠️ Important

- 🔒 Never commit `.env` file to git
- 🔒 Never commit `firebase-service-account-key.json` to git
- ✅ `.gitignore` should have both
- ✅ Firebase has a free tier limit (100 SMS/month)

---

## Troubleshooting

### "Firebase not configured" error
→ Check backend console for errors
→ Verify `.env` file exists and has correct path
→ Check `firebase-service-account-key.json` exists

### "OTP not received"
→ Check your phone number format (10 digits, India)
→ Check Firebase Console → Authentication → Phone providers is ON
→ Might be a SMS delivery delay (1-2 minutes)

### "Invalid Firebase token"
→ Make sure backend is running
→ Check backend has no errors
→ Try refreshing the page

---

## Files You Need to Create

```
backend/
  └── .env (create from template)
  └── firebase-service-account-key.json (paste downloaded file)

frontend/
  └── .env.local (create from template)
```

---

## Files Already Updated

✅ Frontend
- firebase.js (new)
- Signup.js (updated)
- api.js (updated)

✅ Backend
- server.py (updated with Firebase)
- requirements.txt (firebase-admin added)

---

## Next Time You Start

```bash
# Terminal 1
cd backend && python -m uvicorn server:app --reload

# Terminal 2  
cd frontend && npm start
```

No extra setup needed! Just make sure `.env` files exist.

---

## Questions?

Check these files for more info:
- 📖 `FIREBASE_SETUP_GUIDE.md` - Full setup guide
- 📖 `FIREBASE_IMPLEMENTATION_COMPLETE.md` - Technical details
- 📖 `FIREBASE_CHANGES_VERIFICATION.md` - What changed

---

**Status**: Ready to go! 🎉
**Time to setup**: ~5 minutes
**Time to test**: ~2 minutes

