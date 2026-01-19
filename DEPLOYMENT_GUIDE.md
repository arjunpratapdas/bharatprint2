# BharatPrint Deployment Guide

Complete step-by-step guide to deploy BharatPrint to **Netlify (Frontend)** and **Render.com (Backend)**.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
3. [Backend Deployment (Render.com)](#backend-deployment-rendercom)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting deployment, ensure you have:
- ✅ GitHub account with BharatPrint repo pushed
- ✅ Netlify account (free: https://app.netlify.com)
- ✅ Render.com account (free: https://render.com)
- ✅ Configuration files committed to GitHub:
  - `netlify.toml` ✓
  - `frontend/.env.production` ✓
  - `Procfile` ✓
  - `render.yaml` ✓
  - `backend/runtime.txt` ✓

### Push Configuration Files to GitHub
```bash
cd /home/arjun/Downloads/BHARATPRINTmain2

# Verify files are created
ls netlify.toml
ls frontend/.env.production
ls Procfile
ls render.yaml
ls backend/runtime.txt

# Add to git
git add netlify.toml frontend/.env.production Procfile render.yaml backend/runtime.txt

# Commit and push
git commit -m "deployment: Add Netlify and Render.com deployment configurations"
git push origin main
```

---

## Frontend Deployment (Netlify)

### Step 1: Connect GitHub to Netlify

1. Go to **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Search for and select **`bharatprint2`** repository
6. Click **"Install and Authorize"**

### Step 2: Configure Build Settings

Netlify will automatically detect `netlify.toml`, but verify:

- **Base directory**: `frontend` (detected from netlify.toml)
- **Build command**: `npm run build` (detected from netlify.toml)
- **Publish directory**: `frontend/build` (detected from netlify.toml)

Leave all settings as auto-detected (they're correct from netlify.toml).

### Step 3: Set Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **"Add"** and configure these:

| Variable | Value |
|----------|-------|
| `REACT_APP_BACKEND_URL` | `https://bharatprint-backend.onrender.com` |
| `REACT_APP_FIREBASE_API_KEY` | (from your Firebase console) |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | (from your Firebase console) |
| `REACT_APP_FIREBASE_PROJECT_ID` | (from your Firebase console) |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | (from your Firebase console) |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | (from your Firebase console) |
| `REACT_APP_FIREBASE_APP_ID` | (from your Firebase console) |
| `SKIP_PREFLIGHT_CHECK` | `true` |
| `GENERATE_SOURCEMAP` | `true` |

**Note:** Firebase keys are already in `frontend/.env.production`, so Netlify should auto-detect them.

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (~3-5 minutes)
3. Your frontend will be live at: **https://bharatprint-xxxxx.netlify.app**
4. Note down this URL - you'll need it for the backend!

### Step 5: Update Backend CORS

Once you have your Netlify URL, you'll configure it in the backend.

---

## Backend Deployment (Render.com)

### Step 1: Connect GitHub to Render.com

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** and authorize with GitHub
4. Select **`bharatprint2`** repository
5. Choose a service name: `bharatprint-backend` (recommended)

### Step 2: Configure Build Settings

Render.com will auto-detect `render.yaml`, but verify:

- **Environment**: Python (auto-detected)
- **Build command**: `pip install -r backend/requirements.txt` (from render.yaml)
- **Start command**: `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT -k uvicorn.workers.UvicornWorker backend.server:app`
- **Python version**: `3.11.9` (from backend/runtime.txt)

### Step 3: Set Environment Variables

Go to **Environment Variables** and add these:

**CRITICAL - Get these values from your Supabase project:**

1. **SUPABASE_URL**
   - Go to: https://app.supabase.com → Select your project
   - Copy from: **Settings** → **API** → **Project URL**
   - Example: `https://pnrsdfkivemwgajpssdz.supabase.co`

2. **SUPABASE_KEY**
   - From same location: **Settings** → **API** → **anon public**
   - Copy the long key starting with `eyJhbGc...`

3. **SUPABASE_SERVICE_KEY**
   - From same location: **Settings** → **API** → **service_role**
   - Copy the long key (KEEP THIS SECRET!)

**From your backend/.env file:**

4. **JWT_SECRET**
   - Copy from: `/backend/.env` → Look for `JWT_SECRET=`

5. **FIREBASE_CREDENTIALS_PATH**
   - Value: `./firebase-service-account-key.json`

**Frontend Netlify URL:**

6. **CORS_ORIGINS**
   - Use the Netlify URL from frontend deployment
   - Example: `https://bharatprint-xxxxx.netlify.app`

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (~2-5 minutes)
3. You'll get a URL like: **https://bharatprint-backend.onrender.com**
4. Verify it's working: Visit `https://bharatprint-backend.onrender.com/docs`

### Step 5: Monitor Logs

1. Go to **Logs** tab in Render.com
2. Look for "Server started" message indicating successful launch
3. Check for any error messages

---

## Environment Variables Reference

### Frontend (Netlify)
```env
REACT_APP_BACKEND_URL=https://bharatprint-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=true
```

### Backend (Render.com)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret_from_local_env
FIREBASE_CREDENTIALS_PATH=./firebase-service-account-key.json
CORS_ORIGINS=https://bharatprint-xxxxx.netlify.app
PYTHONUNBUFFERED=1
```

---

## Testing

### Test 1: Frontend is Live
```bash
# Visit your Netlify URL
https://bharatprint-xxxxx.netlify.app

# Should see: BharatPrint landing page
# Check browser console (F12) for any errors
```

### Test 2: Backend API is Responding
```bash
# Visit the API docs
https://bharatprint-backend.onrender.com/docs

# Should see: Swagger API documentation
```

### Test 3: Frontend-Backend Communication
1. Go to your Netlify frontend
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try to login/signup
5. Watch network requests - should go to `bharatprint-backend.onrender.com`
6. Should NOT see CORS errors

### Test 4: SMS-OTP Flow
1. Open Netlify frontend
2. Go to signup page
3. Enter a phone number: `+91 9999999999`
4. Request OTP
5. Check Firebase console for sent SMS
6. Enter OTP to complete signup

### Test 5: Database Connection
1. Backend should be writing to Supabase
2. Go to: https://app.supabase.com
3. Check `users` table for new signups
4. Verify data is being saved correctly

---

## Troubleshooting

### Frontend Shows 404 After Refresh
**Problem**: Routes not working  
**Solution**: netlify.toml has SPA redirect rules. If not working:
- Go to Netlify Settings → Redirects
- Verify rule exists: `/` → `/index.html` (status 200)
- Re-deploy frontend

### Frontend Can't Connect to Backend (CORS Error)
**Problem**: Browser console shows: `Access to XMLHttpRequest blocked by CORS`  
**Solution**:
1. Verify `CORS_ORIGINS` environment variable on Render.com includes Netlify URL
2. Format should be: `https://bharatprint-xxxxx.netlify.app` (no trailing slash)
3. Re-deploy backend after updating

### Backend Returns 503 Service Unavailable
**Problem**: Render.com shows red/orange status  
**Solution**:
1. Go to Render.com → Logs
2. Check for Python errors
3. Common issues:
   - Missing environment variables → Add them
   - Supabase connection failed → Verify SUPABASE_URL and SUPABASE_KEY
   - Module import error → Check requirements.txt
4. Re-deploy after fixes

### SMS-OTP Not Sending
**Problem**: "OTP sent" but no SMS received  
**Solution**:
1. Verify Firebase Blaze plan is active
2. Check Firebase console → SMS quotas
3. Verify FIREBASE_CREDENTIALS_PATH is correct on Render.com
4. Check backend logs on Render.com for Firebase errors

### Database Says "Table Does Not Exist"
**Problem**: Error: `relation "users" does not exist`  
**Solution**:
1. Go to Supabase: https://app.supabase.com
2. SQL Editor → Create tables manually if needed
3. Run: [schema.sql](./backend/schema.sql)
4. Verify tables: `users`, `otps`, `documents`, `audit_logs`

### Deployment Still Running After 30 Minutes
**Problem**: Build or deploy stuck  
**Solution**:
1. Cancel deployment on Render.com / Netlify
2. Check logs for errors
3. Common causes:
   - Large node_modules download (increase timeout)
   - Missing Python package (check requirements.txt)
4. Try re-deploying

---

## Health Checks

After deployment, verify everything is working:

```bash
# 1. Frontend Health
curl -I https://bharatprint-xxxxx.netlify.app
# Should return: 200 OK

# 2. Backend Health
curl https://bharatprint-backend.onrender.com/docs
# Should return: Swagger UI page (HTML)

# 3. API Health Endpoint (if available)
curl https://bharatprint-backend.onrender.com/health
# Should return: {"status": "ok"}

# 4. CORS Headers
curl -H "Origin: https://bharatprint-xxxxx.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://bharatprint-backend.onrender.com/auth/signup
# Should return CORS headers in response
```

---

## Production Monitoring

### Monitor Frontend (Netlify)
1. Go to Site analytics
2. Watch for error rates
3. Check Performance metrics
4. Review Deploy logs

### Monitor Backend (Render.com)
1. Go to Logs tab
2. Watch for errors
3. Set up alerts (paid feature)
4. Monitor CPU/Memory usage (free: limited view)

---

## Next Steps

After successful deployment:

1. ✅ Test all features end-to-end
2. ✅ Collect user feedback
3. ✅ Monitor error logs daily
4. ✅ Optimize performance if needed
5. ✅ Plan feature releases
6. ✅ Set up automated backups for Supabase
7. ✅ Configure custom domain (if needed)

---

## Support

Having issues? Check:
- ✅ Render.com Logs: https://dashboard.render.com → Your service → Logs
- ✅ Netlify Logs: https://app.netlify.com → Your site → Deploys
- ✅ Firebase Console: https://console.firebase.google.com
- ✅ Supabase Dashboard: https://app.supabase.com

---

**Deployment completed? Celebrate! 🎉 Your app is now live!**
