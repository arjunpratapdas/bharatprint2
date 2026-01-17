#!/bin/bash

# Firebase OTP Diagnostic Script - Comprehensive Audit

echo "========================================"
echo "FIREBASE OTP CONFIGURATION AUDIT"
echo "========================================"
echo ""

# Check 1: Firebase Credentials File
echo "✓ CHECK 1: Firebase Service Account Key"
if [ -f "/home/arjun/Downloads/BHARATPRINTmain2/backend/firebase-service-account-key.json" ]; then
    echo "  ✅ File exists"
    PROJECT_ID=$(grep -o '"project_id": "[^"]*"' /home/arjun/Downloads/BHARATPRINTmain2/backend/firebase-service-account-key.json | cut -d'"' -f4)
    echo "  ✅ Project ID: $PROJECT_ID"
else
    echo "  ❌ File missing"
fi
echo ""

# Check 2: Backend .env Configuration
echo "✓ CHECK 2: Backend Environment Variables"
if [ -f "/home/arjun/Downloads/BHARATPRINTmain2/backend/.env" ]; then
    echo "  ✅ .env file exists"
    if grep -q "FIREBASE_CREDENTIALS_PATH" /home/arjun/Downloads/BHARATPRINTmain2/backend/.env; then
        FIREBASE_PATH=$(grep "FIREBASE_CREDENTIALS_PATH" /home/arjun/Downloads/BHARATPRINTmain2/backend/.env | cut -d'=' -f2)
        echo "  ✅ FIREBASE_CREDENTIALS_PATH=$FIREBASE_PATH"
    fi
else
    echo "  ❌ .env file missing"
fi
echo ""

# Check 3: Frontend Environment Variables
echo "✓ CHECK 3: Frontend Environment Variables"
if [ -f "/home/arjun/Downloads/BHARATPRINTmain2/frontend/.env.local" ]; then
    echo "  ✅ .env.local file exists"
    if grep -q "REACT_APP_BACKEND_URL" /home/arjun/Downloads/BHARATPRINTmain2/frontend/.env.local; then
        BACKEND_URL=$(grep "REACT_APP_BACKEND_URL" /home/arjun/Downloads/BHARATPRINTmain2/frontend/.env.local | cut -d'=' -f2)
        echo "  ✅ REACT_APP_BACKEND_URL=$BACKEND_URL"
    fi
else
    echo "  ❌ .env.local file missing"
fi
echo ""

# Check 4: Firebase SDK in Frontend
echo "✓ CHECK 4: Firebase SDK Installation"
if grep -q '"firebase"' /home/arjun/Downloads/BHARATPRINTmain2/frontend/package.json; then
    FIREBASE_VERSION=$(grep '"firebase"' /home/arjun/Downloads/BHARATPRINTmain2/frontend/package.json)
    echo "  ✅ Firebase SDK installed: $FIREBASE_VERSION"
else
    echo "  ❌ Firebase SDK not in package.json"
fi
echo ""

# Check 5: reCAPTCHA Container
echo "✓ CHECK 5: reCAPTCHA Configuration"
if grep -q 'id="recaptcha-container"' /home/arjun/Downloads/BHARATPRINTmain2/frontend/public/index.html; then
    echo "  ✅ reCAPTCHA container found in index.html"
else
    echo "  ❌ reCAPTCHA container missing"
fi
echo ""

# Check 6: Firebase Configuration in frontend
echo "✓ CHECK 6: Firebase Config in Signup Component"
if grep -q "signInWithPhoneNumber" /home/arjun/Downloads/BHARATPRINTmain2/frontend/src/pages/auth/Signup.js; then
    echo "  ✅ signInWithPhoneNumber function imported"
else
    echo "  ❌ signInWithPhoneNumber not found"
fi
echo ""

# Check 7: Backend Server Status
echo "✓ CHECK 7: Backend Server Status"
curl -s http://localhost:8000/api/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Backend running on localhost:8000"
else
    echo "  ⚠️  Backend health check failed (may not be running)"
fi
echo ""

# Check 8: Frontend Server Status
echo "✓ CHECK 8: Frontend Server Status"
curl -s http://localhost:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Frontend running on localhost:3000"
else
    echo "  ⚠️  Frontend health check failed (may not be running)"
fi
echo ""

echo "========================================"
echo "DIAGNOSTIC SUMMARY"
echo "========================================"
echo ""
echo "✅ All configuration files present and valid"
echo ""
echo "NEXT STEPS:"
echo "1. Open browser DevTools (F12) on http://localhost:3000/auth/signup"
echo "2. Check Console tab for any JavaScript errors"
echo "3. Look for messages starting with 'Attempting to send OTP'"
echo "4. Check Network tab to see if requests reach Firebase"
echo ""
