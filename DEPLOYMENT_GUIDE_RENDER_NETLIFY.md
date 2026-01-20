# Deployment Guide - Render (Backend) + Netlify (Frontend)

## 🎯 Overview

This guide will help you deploy:
- **Backend** → Render.com (Python/FastAPI)
- **Frontend** → Netlify (React)

---

## 📋 Prerequisites

1. ✅ GitHub account with your code pushed
2. ✅ Render.com account (free tier)
3. ✅ Netlify account (free tier)
4. ✅ Twilio account with credentials
5. ✅ Supabase account with database

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repository

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `arjunpratapdas/bharatprint2`
3. Configure:
   - **Name**: `bharatprint-backend`
   - **Region**: Choose closest to your users (e.g., Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables

Click **"Environment"** tab and add these variables:

```bash
# Database
SUPABASE_URL=YOUR_SUPABASE_URL_HERE
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY_HERE
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY_HERE

# Twilio SMS OTP
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER_HERE
TWILIO_VERIFIED_NUMBERS=+917086230642,+918822545981

# JWT
JWT_SECRET=YOUR_JWT_SECRET_HERE

# CORS (add your Netlify URL after deployment)
CORS_ORIGINS=https://bharatprint.netlify.app,http://localhost:3000

# Python
PYTHON_VERSION=3.11
```

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://bharatprint-backend.onrender.com`

### Step 5: Test Backend
```bash
curl https://bharatprint-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "BharatPrint API",
  "version": "1.0.0"
}
```

---

## 🌐 Part 2: Deploy Frontend to Netlify

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify to access your repository

### Step 2: Create New Site
1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"GitHub"**
3. Select repository: `arjunpratapdas/bharatprint2`
4. Configure:
   - **Branch**: `main`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

### Step 3: Add Environment Variables

Click **"Site settings"** → **"Environment variables"** → **"Add a variable"**

```bash
# Backend API URL (use your Render URL from Part 1)
REACT_APP_BACKEND_URL=https://bharatprint-backend.onrender.com
```

### Step 4: Deploy
1. Click **"Deploy site"**
2. Wait for deployment (3-5 minutes)
3. You'll get a URL like: `https://bharatprint-xyz123.netlify.app`

### Step 5: Update Backend CORS

Go back to **Render** → Your backend service → **Environment** → Edit `CORS_ORIGINS`:

```bash
CORS_ORIGINS=https://bharatprint-xyz123.netlify.app,http://localhost:3000
```

Replace `bharatprint-xyz123.netlify.app` with your actual Netlify URL.

Click **"Save Changes"** - Render will automatically redeploy.

---

## 🧪 Testing Production Deployment

### Test 1: Backend Health
```bash
curl https://bharatprint-backend.onrender.com/health
```

### Test 2: Frontend Access
Open: `https://bharatprint-xyz123.netlify.app`

### Test 3: Signup Flow
1. Go to: `https://bharatprint-xyz123.netlify.app/auth/signup`
2. Enter name and phone: `7086230642` or `8822545981`
3. Click "Send OTP"
4. Check phone for SMS
5. Enter OTP and complete signup

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "Application failed to respond"**
- Check Render logs: Dashboard → Your service → Logs
- Verify all environment variables are set
- Check Python version is 3.11

**Error: "Module not found"**
- Check `requirements.txt` is in `backend/` folder
- Verify build command: `pip install -r requirements.txt`

**Error: "Twilio authentication failed"**
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
- Check Twilio Console for account status

### Frontend Issues

**Error: "Failed to fetch"**
- Check `REACT_APP_BACKEND_URL` points to correct Render URL
- Verify backend CORS includes your Netlify URL
- Check browser console for CORS errors

**Error: "Build failed"**
- Check Node version is 20 (set in `netlify.toml`)
- Verify `package.json` has all dependencies
- Check Netlify build logs

**Error: "Page not found on refresh"**
- Verify `netlify.toml` has redirects configured
- Should have: `from = "/*"` → `to = "/index.html"`

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Verify Twilio credentials are correct
- [ ] Check Supabase RLS (Row Level Security) policies
- [ ] Update CORS to only allow your Netlify domain
- [ ] Remove test phone numbers from verified list (add real users)
- [ ] Enable HTTPS only (both Render and Netlify do this by default)
- [ ] Set up monitoring and alerts

---

## 📊 Monitoring

### Render Monitoring
- Dashboard → Your service → Metrics
- Check CPU, Memory, Response time
- Set up email alerts for downtime

### Netlify Monitoring
- Site overview → Analytics
- Check page views, bandwidth
- Monitor build times

### Twilio Monitoring
- Twilio Console → Monitor → Logs
- Check SMS delivery status
- Monitor usage and costs

---

## 💰 Cost Estimate

### Free Tier Limits

**Render (Free)**:
- 750 hours/month
- Sleeps after 15 min inactivity
- 512 MB RAM
- ⚠️ First request after sleep takes 30-60 seconds

**Netlify (Free)**:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Twilio (Trial)**:
- $15.50 credit
- ~$0.0075 per SMS
- ~2,000 SMS with trial credit
- ⚠️ Can only send to verified numbers

### Upgrade Recommendations

When you get real users:

1. **Render**: Upgrade to Starter ($7/month)
   - No sleep
   - 512 MB RAM
   - Better performance

2. **Twilio**: Upgrade to paid account
   - Send to any number
   - Better delivery rates
   - Volume discounts

3. **Supabase**: Stay on free tier (500 MB database is enough for 10,000+ users)

---

## 🚀 Post-Deployment Steps

1. ✅ Test complete signup flow in production
2. ✅ Test login flow
3. ✅ Test document upload
4. ✅ Verify SMS delivery
5. ✅ Check database records in Supabase
6. ✅ Set up custom domain (optional)
7. ✅ Configure monitoring alerts
8. ✅ Share with beta users

---

## 📝 Custom Domain Setup (Optional)

### For Netlify (Frontend)
1. Buy domain (e.g., bharatprint.com)
2. Netlify → Domain settings → Add custom domain
3. Update DNS records as instructed
4. SSL certificate auto-generated

### For Render (Backend)
1. Render → Settings → Custom domain
2. Add: `api.bharatprint.com`
3. Update DNS CNAME record
4. Update frontend `REACT_APP_BACKEND_URL`

---

## 🎉 Success Checklist

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] SMS OTP working in production
- [ ] Signup flow complete (3 steps)
- [ ] Login flow working
- [ ] Dashboard accessible
- [ ] Database records created
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Monitoring enabled

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Twilio Docs**: https://www.twilio.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: January 20, 2026
**Status**: Ready for deployment 🚀
