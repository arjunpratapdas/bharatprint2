# Firebase Setup Guide for BharatPrint

## Overview
This guide explains how to set up Firebase for SMS-OTP authentication in BharatPrint, replacing Twilio.

## What has been changed:

### Frontend Changes
1. **Firebase SDK installed** - Firebase is now installed in the frontend
2. **Firebase config created** at `frontend/src/lib/firebase.js` with your credentials
3. **Signup.js updated** to use Firebase Phone Authentication instead of backend OTP
4. **reCAPTCHA invisible verification** added for security
5. **API endpoint updated** to `verifyOTPWithToken` for Firebase integration

### Backend Changes
1. **Firebase Admin SDK added** to requirements.txt
2. **New endpoint** `/auth/verify-otp-firebase` created to verify Firebase tokens
3. **User registration** now automatically saves `owner_name` and `phone_number` to database
4. **Firebase initialization** added to backend server

## Required Firebase Service Account Credentials

To complete the setup, you need to generate a Firebase Service Account Key:

### Step 1: Get Service Account Key from Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **bharatprint-b388f**
3. Click the gear icon (⚙️) → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file securely

### Step 2: Create .env file in backend directory
Create a file: `backend/.env`

Add the following:
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Razorpay (if needed)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET_KEY=your_razorpay_secret
```

### Step 3: Place Firebase Service Account Key
1. Copy the downloaded JSON file to: `backend/firebase-service-account-key.json`
2. Update `.env` to point to this file (already configured above)

### Step 4: Create .env.local file in frontend directory
Create a file: `frontend/.env.local`

Add the following (these are already in the code, but good to have in .env):
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## How Firebase OTP Authentication Works

### Sign-up Flow:
1. User enters **name** and **phone number** on Step 1
2. Frontend calls `signInWithPhoneNumber()` with Firebase Auth
3. Firebase sends OTP via SMS using Google's infrastructure
4. User enters OTP on Step 2
5. Frontend confirms OTP with `confirmationResult.confirm(otpCode)`
6. Frontend gets Firebase ID token
7. Frontend sends ID token to backend `/auth/verify-otp-firebase`
8. Backend verifies Firebase token and creates user with name and phone
9. User proceeds to Step 3 to fill shop details
10. Registration completes

### Database Fields:
The following fields are now automatically saved:
- `phone_number` - User's phone number
- `owner_name` - User's full name (from signup Step 1)
- `phone_verified` - Set to true after Firebase verification
- `created_at` - Timestamp when user signed up
- All other profile fields during registration

## Important Notes

⚠️ **Do NOT commit these files to git:**
- `backend/firebase-service-account-key.json`
- `backend/.env`
- `frontend/.env.local`

Add them to `.gitignore`:
```
backend/.env
backend/firebase-service-account-key.json
frontend/.env.local
```

✅ **Benefits of Firebase over Twilio:**
- Firebase has built-in phone authentication
- Better integration with Google services
- Automatic reCAPTCHA protection
- No need to manage OTP storage and verification separately
- Free tier includes 100 SMS verifications per month (after that, standard rates apply)
- Better compliance with international regulations

## Testing

To test the signup flow:
1. Make sure backend is running with Firebase credentials
2. Go to `/auth/signup`
3. Enter name and a valid Indian phone number (with +91 prefix, Firebase will add it automatically)
4. You should receive an OTP via SMS
5. Enter the OTP to verify
6. Complete your profile

## Troubleshooting

### Firebase Token Verification Fails
- Check that `FIREBASE_CREDENTIALS_PATH` is correctly set
- Ensure the service account JSON file exists at the specified path
- Check backend logs for detailed error messages

### OTP Not Received
- Verify phone number format is correct (10 digits for India)
- Check Firebase Console → Authentication → Phone providers is enabled
- Ensure you're in a supported region

### reCAPTCHA Not Working
- The reCAPTCHA is invisible and shouldn't show by default
- If you see errors, check browser console for reCAPTCHA issues
- Make sure domain is whitelisted in Firebase Console

## Next Steps

1. ✅ Download Firebase Service Account Key
2. ✅ Create backend/.env file
3. ✅ Place service account key in backend/
4. ✅ Restart backend server
5. ✅ Test signup flow
