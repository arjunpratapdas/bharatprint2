# BharatPrint - Setup Guide

## Quick Start (Development Mode)

The application works out of the box with a mock in-memory database for development. No configuration needed.

1. Backend runs on: `http://localhost:8001`
2. Frontend runs on: `http://localhost:3000`

---

## Production Setup - Supabase Configuration

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: From Settings → API → Project API keys → `anon` key
   - **Service Role Key**: From Settings → API → Project API keys → `service_role` key

### Step 2: Run Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `/app/backend/schema.sql`
3. Run the SQL to create all tables

### Step 3: Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `documents`
3. Set it to **private** (not public)

### Step 4: Configure Environment Variables

Update `/app/backend/.env`:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"
SUPABASE_SERVICE_KEY="your-service-role-key"
```

### Step 5: Restart Backend

```bash
sudo supervisorctl restart backend
```

---

## Twilio Setup (OTP SMS)

To send real OTP messages:

1. Create a [Twilio account](https://www.twilio.com/)
2. Get your credentials from Twilio Console
3. Buy a phone number
4. Update `/app/backend/.env`:

```env
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

**Development Mode**: Without Twilio configured, OTPs are printed to the backend logs.

---

## Razorpay Setup (Payments)

To enable real payments:

1. Create a [Razorpay account](https://razorpay.com/)
2. Get API keys from Dashboard → Settings → API Keys
3. Update `/app/backend/.env`:

```env
RAZORPAY_KEY_ID="rzp_live_xxxxx"
RAZORPAY_SECRET_KEY="your-secret-key"
```

---

## Database Schema Overview

| Table | Description |
|-------|-------------|
| `users` | Print shop merchants with subscription info |
| `otps` | OTP verification records |
| `documents` | Uploaded documents with auto-delete settings |
| `audit_logs` | Activity logging |

---

## Key Features

### Authentication
- OTP-based phone authentication
- JWT tokens (30-day expiry)
- No password required

### Document Management
- Upload files (PDF, PNG, JPG up to 50MB)
- Auto-delete timers: 5, 10, 15 minutes
- One-time view links
- QR code generation

### Customer Upload Portal
- Public upload page for each merchant
- Unique URL: `/upload/{merchant_code}`
- No login required for customers
- Self-destruct timers

### Subscription Plans
- **Free**: 20 documents/month, 5-min auto-delete
- **Unlimited**: ₹250/month, unlimited docs, custom timers
- **7-Day Free Trial**: No payment info required

### Trial Management
- Auto-downgrade after 7 days
- SMS notification on trial end (if Twilio configured)
- Manual trigger: `POST /api/admin/check-trials`

---

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & get token
- `POST /api/auth/register` - Complete profile

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/list` - List documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document
- `GET /api/documents/public/{share_link}` - View shared doc
- `GET /api/documents/download/{share_link}` - Download doc

### Customer Portal
- `POST /api/documents/customer-upload/{merchant_code}` - Customer upload

### Dashboard
- `GET /api/dashboard/stats` - Get statistics

### Subscriptions
- `GET /api/subscriptions/plans` - Get plans
- `POST /api/subscriptions/start-trial` - Start 7-day trial
- `POST /api/subscriptions/create-order` - Create payment order

---

## Testing

### Test OTP Flow
```bash
# Send OTP
curl -X POST https://your-app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Check backend logs for OTP code
# Verify OTP
curl -X POST https://your-app/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "otpCode": "123456"}'
```

### Test with JWT Token
```bash
TOKEN="your-jwt-token"
curl -X GET https://your-app/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## Scheduled Jobs (Supabase)

Enable `pg_cron` extension and add these jobs:

```sql
-- Delete expired documents every minute
SELECT cron.schedule('delete-expired-docs', '* * * * *', 'SELECT delete_expired_documents()');

-- Reset monthly uploads on 1st of month
SELECT cron.schedule('reset-monthly-uploads', '0 0 1 * *', 'SELECT reset_monthly_uploads()');

-- Check expired trials hourly
SELECT cron.schedule('check-expired-trials', '0 * * * *', 'SELECT downgrade_expired_trials()');
```
