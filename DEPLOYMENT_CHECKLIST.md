# 🚀 Quick Deployment Checklist

## Phase 1: Pre-Deployment (Do First)
- [ ] Clone/pull latest code from GitHub
- [ ] Verify these files exist in repo:
  ```
  netlify.toml
  frontend/.env.production
  Procfile
  render.yaml
  backend/runtime.txt
  ```
- [ ] Run: `git push origin main` (push any local changes)

## Phase 2: Frontend Deployment (5-10 minutes)

### Netlify Setup
- [ ] Go to https://app.netlify.com
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Select GitHub → Authorize → Select `bharatprint2`
- [ ] Build settings auto-configured from netlify.toml ✓
- [ ] Add Environment Variables:
  - `REACT_APP_BACKEND_URL=https://bharatprint-backend.onrender.com`
  - Firebase keys (from Firebase console)
  - `SKIP_PREFLIGHT_CHECK=true`
- [ ] Click "Deploy"
- [ ] **📝 SAVE**: Your Netlify URL (format: `https://bharatprint-xxxxx.netlify.app`)

### ✅ Frontend Deployed
- [ ] Visit your Netlify URL - should see BharatPrint homepage
- [ ] Open DevTools (F12) → Console - NO ERRORS
- [ ] Test that pages load without 404

## Phase 3: Backend Deployment (5-10 minutes)

### Render.com Setup
- [ ] Go to https://dashboard.render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub → Select `bharatprint2`
- [ ] Service name: `bharatprint-backend`
- [ ] Build settings auto-configured from render.yaml ✓

### Environment Variables - Get These Values First

#### From Supabase (https://app.supabase.com)
- [ ] **SUPABASE_URL**: Settings → API → Project URL
  - Copy: `https://xxx.supabase.co`
- [ ] **SUPABASE_KEY**: Settings → API → anon public
  - Copy entire key (starts with `eyJhbGc...`)
- [ ] **SUPABASE_SERVICE_KEY**: Settings → API → service_role
  - Copy entire key (KEEP SECRET!)

#### From backend/.env (local file)
- [ ] **JWT_SECRET**: Copy from your local `backend/.env`
- [ ] **FIREBASE_CREDENTIALS_PATH**: Set to `./firebase-service-account-key.json`

#### From Frontend Deployment
- [ ] **CORS_ORIGINS**: Your Netlify URL
  - Format: `https://bharatprint-xxxxx.netlify.app`

### Add All Variables to Render.com
- [ ] SUPABASE_URL=`[value from supabase]`
- [ ] SUPABASE_KEY=`[value from supabase]`
- [ ] SUPABASE_SERVICE_KEY=`[value from supabase]`
- [ ] JWT_SECRET=`[value from local .env]`
- [ ] FIREBASE_CREDENTIALS_PATH=`./firebase-service-account-key.json`
- [ ] CORS_ORIGINS=`[your netlify url]`
- [ ] PYTHONUNBUFFERED=`1`

### Deploy Backend
- [ ] Click "Create Web Service"
- [ ] Wait for build (~2-5 minutes)
- [ ] **📝 SAVE**: Your Render backend URL (format: `https://bharatprint-backend.onrender.com`)

### ✅ Backend Deployed
- [ ] Visit `https://bharatprint-backend.onrender.com/docs`
- [ ] Should see Swagger API documentation
- [ ] Check Render.com → Logs - NO ERRORS

## Phase 4: Integration Testing (5-10 minutes)

### Test Frontend ↔ Backend Connection
- [ ] Open your Netlify frontend in browser
- [ ] Open DevTools (F12) → Network tab
- [ ] Try any API call (login, signup, upload)
- [ ] Watch Network tab:
  - Requests should go to `bharatprint-backend.onrender.com`
  - Status should be 200 (not CORS errors)
- [ ] If CORS error → Check CORS_ORIGINS on Render.com

### Test SMS-OTP Flow
- [ ] Go to Netlify frontend → Signup page
- [ ] Enter test phone: `+91 9999999999`
- [ ] Click "Request OTP"
- [ ] Check Firebase console → Authentication → Users
- [ ] Should see sent SMS in Firebase logs
- [ ] Receive OTP and complete signup

### Test Database
- [ ] Go to Supabase: https://app.supabase.com
- [ ] Check `users` table → Should see new signup
- [ ] Verify data structure is correct
- [ ] Check `audit_logs` for activity

## Phase 5: Production Readiness

### Security Checklist
- [ ] No sensitive data in GitHub (checked with security audit)
- [ ] All credentials in environment variables only
- [ ] Firebase keys restricted to web domain
- [ ] Supabase service key never exposed
- [ ] CORS limited to your frontend domain

### Performance
- [ ] Netlify build time < 5 minutes
- [ ] Backend startup time < 2 minutes
- [ ] API response times < 500ms
- [ ] Frontend loads in < 3 seconds

### Monitoring
- [ ] Bookmark Render.com Logs: https://dashboard.render.com → Your service → Logs
- [ ] Bookmark Netlify Deploys: https://app.netlify.com → Your site → Deploys
- [ ] Set up daily log review habit
- [ ] Alert on any errors (coming from logs)

## Phase 6: Launch! 🎉

- [ ] All tests passing ✅
- [ ] No errors in logs ✅
- [ ] Frontend loads correctly ✅
- [ ] Backend responding ✅
- [ ] SMS-OTP working ✅
- [ ] Database saving data ✅

### Go Live!
- [ ] Share your Netlify URL with users
- [ ] Monitor first 24 hours closely
- [ ] Check logs every hour initially
- [ ] Be ready to fix issues quickly

---

## Quick Commands Reference

```bash
# Check if files exist before pushing
ls netlify.toml frontend/.env.production Procfile render.yaml backend/runtime.txt

# Push to GitHub
git add netlify.toml frontend/.env.production Procfile render.yaml backend/runtime.txt
git commit -m "deployment: Add Netlify and Render configuration"
git push origin main

# Test backend after deployment
curl https://bharatprint-backend.onrender.com/docs

# Test CORS
curl -H "Origin: https://bharatprint-xxxxx.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://bharatprint-backend.onrender.com/auth/signup
```

---

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| Frontend shows 404 on refresh | netlify.toml redirects not applied → re-deploy |
| CORS errors in console | CORS_ORIGINS missing on Render → add and re-deploy |
| Backend returns 503 | Check Render logs for errors → likely missing env vars |
| SMS not sending | Firebase Blaze plan not active → upgrade Firebase |
| Database errors | Tables don't exist → run schema.sql on Supabase |

---

## Deployment Tracking

**Start time**: _________  
**Frontend deployed**: _________ @ _________  
**Backend deployed**: _________ @ _________  
**All tests passing**: _________ ✓  
**Live date**: _________

---

**Need help?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions!
