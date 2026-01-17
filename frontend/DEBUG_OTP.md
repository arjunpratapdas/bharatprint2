# Firebase OTP Error Debugging Guide

## Issue: "dash/network-request-failed" Error

This error occurs when Firebase phone authentication fails to send OTP. Here are the steps to debug and fix:

### Root Causes & Solutions

#### 1. **reCAPTCHA Container Missing** ✅ FIXED
- **Error**: reCAPTCHA container div was not in index.html
- **Solution**: Added `<div id="recaptcha-container"></div>` to public/index.html

#### 2. **Firebase Project Configuration**
Check that your Firebase project has:
- ✅ Phone authentication enabled in Firebase Console
- ✅ Authorization domain set to `localhost:3000` (for testing)
- ✅ reCAPTCHA v3 enabled (automatic with phone auth)

**To verify in Firebase Console:**
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `bharatprint-b388f`
3. Go to Authentication > Settings > Authorized domains
4. Ensure `localhost` is listed for local testing

#### 3. **Browser Console Diagnostics**
Open browser DevTools (F12) and check:

```javascript
// In Console, run:
console.log(window.recaptchaVerifier); // Should not be null
console.log(document.getElementById('recaptcha-container')); // Should find div
```

#### 4. **Network Request Failures - Common Causes**

| Error | Cause | Solution |
|-------|-------|----------|
| `network-request-failed` | Network connectivity or reCAPTCHA verification failed | Check internet, clear cache |
| `invalid-phone-number` | Wrong phone format or country code | Ensure format: +91XXXXXXXXXX |
| `too-many-requests` | Rate limiting applied | Wait 1 hour before retrying |
| `operation-not-allowed` | Phone auth not enabled in Firebase | Enable in Firebase Console |

#### 5. **Test Steps**
1. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. **Hard refresh**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. **Check Firebase Console logs**: https://console.firebase.google.com/ > Project Settings > Logs
4. **Verify phone number format**: Must be exactly 10 digits (Indian format)
5. **Test with delay**: Sometimes SMS takes 30-60 seconds, not instant

#### 6. **To Verify OTP Send is Working**
1. Open your app at http://localhost:3000
2. Navigate to /auth/signup
3. Check browser console (F12 > Console tab)
4. Look for these console messages:
   ```
   "Firebase initialized with project: bharatprint-b388f"
   "Attempting to send OTP to: +91XXXXXXXXXX"
   "reCAPTCHA verified"
   ```

#### 7. **If Still Not Working**

Create a test script in browser console:
```javascript
const testConfig = {
  apiKey: "AIzaSyC7k2z8ReEPjEa6pJtaga9NIWp8gqBDKAA",
  authDomain: "bharatprint-b388f.firebaseapp.com",
  projectId: "bharatprint-b388f"
};

console.log('Testing Firebase config:');
console.log('API Key present:', !!testConfig.apiKey);
console.log('Auth Domain:', testConfig.authDomain);
console.log('Project ID:', testConfig.projectId);
```

#### 8. **Backend is Not Required for OTP Send**
The "Send OTP" step only requires Firebase - the backend is only needed for OTP verification. So focus on Firebase configuration.

---

## What We Fixed

1. ✅ Added missing `recaptcha-container` div to `public/index.html`
2. ✅ Improved error handling in `handleSendOTP()` with detailed error messages
3. ✅ Added reCAPTCHA callback handlers (expired, error callbacks)
4. ✅ Added better console logging for debugging

---

## Next Steps to Test

1. **Clear everything**: 
   ```bash
   # In frontend folder
   rm -rf node_modules/.cache
   ```

2. **Restart frontend**:
   ```bash
   npm start
   ```

3. **Try sending OTP again** with a real phone number

4. **If error persists**, check:
   - Browser DevTools Console for detailed error messages
   - Firebase Console Project Settings to ensure phone auth is enabled
   - Network tab in DevTools to see if request reaches Firebase

---

## Expected Success Flow

✅ User enters name and 10-digit phone number  
✅ Clicks "Send OTP"  
✅ Browser shows reCAPTCHA challenge (invisible or visible)  
✅ Firebase sends SMS to phone with 6-digit OTP  
✅ User receives SMS within 30-60 seconds  
✅ User enters OTP code  
✅ Backend verifies Firebase token and creates user account  

---

## Support

If the error persists after these fixes:
1. Check Firebase Console > Authentication > Phone for any error messages
2. Verify project ID matches: `bharatprint-b388f`
3. Check if rate limiting has been applied (try again after 1 hour)
4. Ensure phone number is formatted correctly: +91 followed by 10 digits

