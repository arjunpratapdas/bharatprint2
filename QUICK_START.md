# Quick Start Guide - BharatPrint SMS OTP

## 🚀 Start Testing in 2 Commands

### Terminal 1 - Backend
```bash
./start-backend.sh
```

### Terminal 2 - Frontend
```bash
./start-frontend.sh
```

### Browser
Open: `http://localhost:3000/auth/signup`

---

## 📱 Test Phone Numbers

Use ONLY these verified numbers:
- `7086230642`
- `8822545981`

---

## ✅ What Was Fixed

**Problem**: "Failed to fetch OTP" error

**Root Cause**: Backend was on port 8001, frontend expected port 8000

**Solution**: Changed backend to port 8000 in `server.py`

---

## 📚 Full Documentation

- `TEST_LOCAL_SETUP.md` - Detailed testing guide
- `FIX_FAILED_TO_FETCH_OTP.md` - Complete fix details
- `DEPLOYMENT_GUIDE_RENDER_NETLIFY.md` - Deploy to production
- `COMPLETE_FIX_SUMMARY.md` - Full summary

---

## 🐛 Quick Troubleshooting

**"Failed to fetch"** → Restart backend: `./start-backend.sh`

**"Phone not verified"** → Use `7086230642` or `8822545981`

**"Port in use"** → Kill process: `lsof -ti:8000 | xargs kill -9`

---

## 🎯 Expected Flow

1. Enter name + phone → Click "Send OTP"
2. Check phone for SMS (6-digit code)
3. Enter OTP → Click "Verify"
4. Enter shop name + city → Click "Complete"
5. Redirected to dashboard ✅

---

**Status**: ✅ Ready to test!
