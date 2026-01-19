# 🔐 Environment Variables Reference

Complete reference for all environment variables needed for BharatPrint deployment.

## Frontend Environment Variables

### Development (frontend/.env.local)
Currently configured for local development:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_FIREBASE_API_KEY=AIzaSyC7k2z8kJ9mQ3xL6pR2tN5vW8yD1aE4bF5
REACT_APP_FIREBASE_AUTH_DOMAIN=bharatprint-b388f.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bharatprint-b388f
REACT_APP_FIREBASE_STORAGE_BUCKET=bharatprint-b388f.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890ghijk
```

### Production (frontend/.env.production)
Already configured for Netlify deployment:
```env
REACT_APP_BACKEND_URL=https://bharatprint-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=AIzaSyC7k2z8kJ9mQ3xL6pR2tN5vW8yD1aE4bF5
REACT_APP_FIREBASE_AUTH_DOMAIN=bharatprint-b388f.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bharatprint-b388f
REACT_APP_FIREBASE_STORAGE_BUCKET=bharatprint-b388f.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890ghijk
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=true
```

**Where to set**: Netlify UI automatically reads from `.env.production`

---

## Backend Environment Variables

### Development (backend/.env - local only, NOT committed)
```env
# Supabase Database Configuration
SUPABASE_URL=https://pnrsdfkivemwgajpssdz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucnNkZmtpdmVtd2dhanBzc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2MTUyMjAsImV4cCI6MTkyNTE5MTIyMH0.xxx
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucnNkZmtpdmVtd2dhanBzc2R6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTYxNTIyMCwiZXhwIjoxOTI1MTkxMjIwfQ.xxx

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# CORS Configuration (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Razorpay (if using payments)
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_SECRET_KEY=xxxx

# Logging
LOG_LEVEL=INFO
```

### Production (Render.com - Set via UI)

Set these environment variables on Render.com dashboard under Environment Variables:

#### Database & Auth (REQUIRED)
1. **SUPABASE_URL**
   - Where: Supabase dashboard → Settings → API
   - What: Project URL
   - Format: `https://your-project.supabase.co`
   - Get it: https://app.supabase.com/project/[your-project]/settings/api

2. **SUPABASE_KEY**
   - Where: Supabase dashboard → Settings → API
   - What: anon public key
   - Format: Starts with `eyJhbGc...`
   - Get it: https://app.supabase.com/project/[your-project]/settings/api

3. **SUPABASE_SERVICE_KEY**
   - Where: Supabase dashboard → Settings → API
   - What: service_role secret key
   - Format: Starts with `eyJhbGc...`
   - Get it: https://app.supabase.com/project/[your-project]/settings/api
   - ⚠️ KEEP THIS SECRET!

#### Firebase (REQUIRED)
4. **FIREBASE_CREDENTIALS_PATH**
   - Value: `./firebase-service-account-key.json`
   - (Fixed value, don't change)

#### Security (REQUIRED)
5. **JWT_SECRET**
   - Where: Your local `backend/.env` file
   - What: Your JWT_SECRET value
   - ⚠️ KEEP THIS SECRET!

#### CORS (REQUIRED)
6. **CORS_ORIGINS**
   - Value: Your Netlify URL
   - Format: `https://your-app.netlify.app`
   - Replace `your-app` with your actual Netlify subdomain

#### Optional - Payments
7. **RAZORPAY_KEY_ID** (if using Razorpay)
   - Where: Razorpay dashboard
   - What: Test key for development, Live key for production

8. **RAZORPAY_SECRET_KEY** (if using Razorpay)
   - Where: Razorpay dashboard
   - What: Test secret for development, Live secret for production

#### Optional - Logging
9. **LOG_LEVEL** (optional)
   - Value: `INFO` (default) or `DEBUG` or `WARNING`
   - Default: INFO

---

## Where to Find Your Values

### Supabase Configuration
1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. You'll see:
   - **Project URL** → Copy to `SUPABASE_URL`
   - **anon public** → Copy to `SUPABASE_KEY`
   - **service_role** → Copy to `SUPABASE_SERVICE_KEY`

### Firebase Configuration
1. Go to https://console.firebase.google.com
2. Select your project (bharatprint-b388f)
3. Settings ⚙️ → Project settings
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. This creates `firebase-service-account-key.json`
7. Upload this file to your backend

### Your Local Backend (.env)
1. Open `/backend/.env` on your computer
2. Find the line: `JWT_SECRET=xxx`
3. Copy the value (xxx)
4. Paste into Render.com as `JWT_SECRET`

### Netlify URL (After Frontend Deployment)
1. Deploy frontend to Netlify first
2. Netlify will give you a URL like: `https://your-site.netlify.app`
3. Copy this URL (including `https://`)
4. Paste into Render.com as `CORS_ORIGINS`

---

## How to Set Environment Variables on Render.com

1. Go to https://dashboard.render.com
2. Click on your `bharatprint-backend` service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Fill in:
   - **Key**: (e.g., `SUPABASE_URL`)
   - **Value**: (e.g., `https://xxx.supabase.co`)
6. Click **Add**
7. Repeat for all required variables
8. Click **Save Changes** (or it auto-saves)
9. Render will **automatically redeploy** with new variables

---

## How to Set Environment Variables on Netlify

1. Go to https://app.netlify.com
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Fill in:
   - **Key**: (e.g., `REACT_APP_BACKEND_URL`)
   - **Value**: (e.g., `https://bharatprint-backend.onrender.com`)
6. Click **Save**
7. Go to **Deploys** and click **Trigger deploy**
8. Wait for rebuild (~3 minutes)

---

## Important Notes

### Security
- ⚠️ **NEVER** commit `.env` files to GitHub
- ⚠️ **NEVER** share your `SUPABASE_SERVICE_KEY` or `JWT_SECRET`
- ✅ Anon key (`SUPABASE_KEY`) is safe to expose
- ✅ Frontend keys are safe to expose

### Sensitive Variables (NEVER expose)
- `SUPABASE_SERVICE_KEY` - Database admin access
- `JWT_SECRET` - Session signing key
- `RAZORPAY_SECRET_KEY` - Payment processing
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase admin access

### Safe to Expose
- `REACT_APP_BACKEND_URL` - Your API URL
- `SUPABASE_URL` - Your database URL
- `SUPABASE_KEY` - Anon public key (RLS protects data)
- Firebase public keys (browser-safe)

### After Setting Variables
- **Netlify**: Trigger a new deploy to use new variables
- **Render.com**: Automatically redeploys with new variables

---

## Troubleshooting

### Error: "Supabase credentials not configured"
- ✅ Check that `SUPABASE_URL` and `SUPABASE_KEY` are set
- ✅ Make sure they're not empty strings
- ✅ Check for typos in variable names

### Error: "Firebase credentials not found"
- ✅ Upload `firebase-service-account-key.json` to backend directory
- ✅ Ensure path is `./firebase-service-account-key.json` on Render
- ✅ File should not be committed to GitHub

### Error: "CORS origin not allowed"
- ✅ Check `CORS_ORIGINS` includes your Netlify URL
- ✅ Format: `https://your-site.netlify.app` (with https://)
- ✅ No trailing slash
- ✅ Redeploy backend after changing

### Error: "JWT_SECRET not set"
- ✅ Verify `JWT_SECRET` is in Render environment variables
- ✅ Should be same value as your local `backend/.env`
- ✅ Redeploy backend after setting

---

## Quick Copy-Paste Checklist

Before going live, verify you have these values:

```
□ SUPABASE_URL: https://__________.supabase.co
□ SUPABASE_KEY: eyJhbGc...
□ SUPABASE_SERVICE_KEY: eyJhbGc...
□ JWT_SECRET: __________
□ CORS_ORIGINS: https://__________. netlify.app
□ FIREBASE_CREDENTIALS_PATH: ./firebase-service-account-key.json
□ REACT_APP_BACKEND_URL: https://bharatprint-backend.onrender.com
```

Once you have all these values, you're ready to deploy!

---

## Support

Having issues with environment variables?

1. **Check exact variable names** - They're case-sensitive!
2. **Verify no extra spaces** - Trim leading/trailing whitespace
3. **Check for typos** - Copy-paste instead of typing
4. **Look at logs** - Render.com and Netlify logs show env var errors
5. **Redeploy after changes** - Variables only take effect on new deploy

---

**Next Step**: Set these variables on Render.com and Netlify, then deploy! 🚀
