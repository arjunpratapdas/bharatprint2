#!/bin/bash

# Firebase Network Error Diagnostics Script
# Usage: bash firebase-diagnostics.sh

echo "======================================"
echo "Firebase Network Error Diagnostics"
echo "======================================"
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found"
fi
echo ""

# Check Frontend .env
echo "2. Checking Frontend Environment..."
if [ -f "frontend/.env.local" ]; then
    if grep -q "REACT_APP_BACKEND_URL=http://localhost:8000" frontend/.env.local; then
        echo "✅ REACT_APP_BACKEND_URL configured correctly"
    else
        echo "⚠️ REACT_APP_BACKEND_URL might be misconfigured"
        grep "REACT_APP_BACKEND_URL" frontend/.env.local || echo "Not found"
    fi
else
    echo "❌ frontend/.env.local not found"
fi
echo ""

# Check reCAPTCHA container
echo "3. Checking reCAPTCHA Container..."
if grep -q 'id="recaptcha-container"' frontend/public/index.html; then
    echo "✅ reCAPTCHA container div found in index.html"
else
    echo "❌ reCAPTCHA container div NOT found in index.html"
fi
echo ""

# Check Firebase imports
echo "4. Checking Firebase Configuration..."
if [ -f "frontend/src/lib/firebase.js" ]; then
    if grep -q "createRecaptchaVerifier" frontend/src/lib/firebase.js; then
        echo "✅ firebase.js has createRecaptchaVerifier helper function"
    else
        echo "❌ firebase.js missing createRecaptchaVerifier"
    fi
    
    if grep -q "expired-callback" frontend/src/lib/firebase.js; then
        echo "✅ firebase.js has expired-callback handler"
    else
        echo "❌ firebase.js missing expired-callback handler"
    fi
    
    if grep -q "error-callback" frontend/src/lib/firebase.js; then
        echo "✅ firebase.js has error-callback handler"
    else
        echo "❌ firebase.js missing error-callback handler"
    fi
else
    echo "❌ frontend/src/lib/firebase.js not found"
fi
echo ""

# Check Backend .env
echo "5. Checking Backend Environment..."
if [ -f "backend/.env" ]; then
    if grep -q "FIREBASE_CREDENTIALS_PATH" backend/.env; then
        echo "✅ FIREBASE_CREDENTIALS_PATH configured"
    else
        echo "❌ FIREBASE_CREDENTIALS_PATH not configured"
    fi
    
    if grep -q "CORS_ORIGINS" backend/.env; then
        echo "✅ CORS_ORIGINS configured"
    else
        echo "⚠️ CORS_ORIGINS not configured"
    fi
else
    echo "❌ backend/.env not found"
fi
echo ""

# Check Firebase Service Account Key
echo "6. Checking Firebase Service Account Key..."
if [ -f "backend/firebase-service-account-key.json" ]; then
    echo "✅ Firebase service account key found"
else
    echo "⚠️ Firebase service account key NOT found at backend/firebase-service-account-key.json"
    echo "   Download from: Firebase Console → Project Settings → Service Accounts"
fi
echo ""

# Check Login.js for network error handling
echo "7. Checking Login.js Error Handling..."
if grep -q "auth/network-request-failed" frontend/src/pages/auth/Login.js; then
    echo "✅ Login.js has network-request-failed error handling"
else
    echo "❌ Login.js missing network-request-failed error handling"
fi

if grep -q "createRecaptchaVerifier" frontend/src/pages/auth/Login.js; then
    echo "✅ Login.js uses createRecaptchaVerifier helper"
else
    echo "❌ Login.js not using createRecaptchaVerifier helper"
fi
echo ""

# Check Signup.js for network error handling
echo "8. Checking Signup.js Error Handling..."
if grep -q "auth/network-request-failed" frontend/src/pages/auth/Signup.js; then
    echo "✅ Signup.js has network-request-failed error handling"
else
    echo "❌ Signup.js missing network-request-failed error handling"
fi

if grep -q "createRecaptchaVerifier" frontend/src/pages/auth/Signup.js; then
    echo "✅ Signup.js uses createRecaptchaVerifier helper"
else
    echo "❌ Signup.js not using createRecaptchaVerifier helper"
fi
echo ""

# Check internet connectivity
echo "9. Checking Internet Connectivity..."
if ping -c 1 -W 2 8.8.8.8 &> /dev/null; then
    echo "✅ Internet connection is active"
else
    echo "⚠️ Cannot reach 8.8.8.8, check connection"
fi
echo ""

# Check if Firebase endpoints are accessible
echo "10. Checking Firebase Endpoints..."
if curl -s --connect-timeout 5 https://identitytoolkit.googleapis.com &> /dev/null; then
    echo "✅ Firebase identitytoolkit.googleapis.com is accessible"
else
    echo "⚠️ Cannot reach Firebase. Check firewall/proxy settings."
fi
echo ""

echo "======================================"
echo "Diagnostics Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. If any checks failed, review the corresponding configuration"
echo "2. Restart frontend: npm start (in frontend/)"
echo "3. Restart backend: python server.py (in backend/)"
echo "4. Test signup flow at http://localhost:3001/auth/signup"
echo "5. Open DevTools (F12) to view console logs"
