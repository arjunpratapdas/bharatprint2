-- BharatPrint Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    owner_name VARCHAR(255),
    shop_name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Assam',
    pincode VARCHAR(10),
    business_category VARCHAR(50) DEFAULT 'print_shop',
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    documents_uploaded INTEGER DEFAULT 0,
    subscription_status VARCHAR(20) DEFAULT 'free', -- 'free', 'trial', 'unlimited'
    monthly_upload_limit INTEGER DEFAULT 20,
    uploads_used_this_month INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    trial_started_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_status);

-- ==================== OTP TABLE ====================
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10), -- For development/debugging only
    otp_hash VARCHAR(255) NOT NULL,
    attempts INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    message_sid VARCHAR(50), -- Twilio message tracking ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone_number);
CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);

-- ==================== DOCUMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_size_bytes BIGINT DEFAULT 0,
    file_storage_key VARCHAR(500),
    shared_link VARCHAR(100) UNIQUE,
    share_link_expires_at TIMESTAMPTZ,
    share_view_count INTEGER DEFAULT 0,
    one_time_view BOOLEAN DEFAULT FALSE,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(15),
    customer_email VARCHAR(255),
    order_details TEXT,
    due_date VARCHAR(50),
    customer_uploaded BOOLEAN DEFAULT FALSE,
    allow_merchant_download BOOLEAN DEFAULT FALSE,
    self_destruct_minutes INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'deleted', 'expired'
    auto_delete_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_shared_link ON documents(shared_link);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_auto_delete ON documents(auto_delete_at);

-- ==================== AUDIT LOGS TABLE ====================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Documents policy
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Public can view shared documents (for public link access)
CREATE POLICY "Public can view shared documents" ON documents
    FOR SELECT USING (shared_link IS NOT NULL AND status = 'active');

-- ==================== STORAGE BUCKET ====================
-- Run these in Supabase Dashboard > Storage

-- Create bucket for documents
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- ==================== FUNCTIONS ====================

-- Function to auto-delete expired documents
CREATE OR REPLACE FUNCTION delete_expired_documents()
RETURNS void AS $$
BEGIN
    UPDATE documents 
    SET status = 'expired', deleted_at = NOW()
    WHERE auto_delete_at < NOW() 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly upload counts (run on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_uploads()
RETURNS void AS $$
BEGIN
    UPDATE users SET uploads_used_this_month = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to downgrade expired trials
CREATE OR REPLACE FUNCTION downgrade_expired_trials()
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        subscription_status = 'free',
        monthly_upload_limit = 20,
        updated_at = NOW()
    WHERE 
        subscription_status = 'trial' 
        AND trial_ends_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ==================== SCHEDULED JOBS (pg_cron) ====================
-- Note: Enable pg_cron extension in Supabase Dashboard first

-- Delete expired documents every minute
-- SELECT cron.schedule('delete-expired-docs', '* * * * *', 'SELECT delete_expired_documents()');

-- Reset monthly uploads on 1st of each month at midnight
-- SELECT cron.schedule('reset-monthly-uploads', '0 0 1 * *', 'SELECT reset_monthly_uploads()');

-- Check expired trials every hour
-- SELECT cron.schedule('check-expired-trials', '0 * * * *', 'SELECT downgrade_expired_trials()');

-- ==================== SAMPLE DATA (Optional for Testing) ====================

-- Uncomment to insert test user
-- INSERT INTO users (phone_number, shop_name, city, referral_code, onboarding_completed)
-- VALUES ('+919876543210', 'Test Print Shop', 'Mumbai', 'BP_TEST1234', true);
