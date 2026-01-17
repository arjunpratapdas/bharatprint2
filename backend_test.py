#!/usr/bin/env python3
"""
BharatPrint Backend API Test Suite
Tests all backend endpoints according to the review request
"""

import requests
import json
import time
import io
import os
from datetime import datetime

# Configuration
BASE_URL = "https://printdoc-1.preview.emergentagent.com/api"
TEST_PHONE = "+919876543211"
TEST_SHOP_NAME = "Mumbai Print Hub"
TEST_CITY = "Mumbai"

class BharatPrintTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.jwt_token = None
        self.user_data = None
        self.merchant_code = None
        
    def log(self, message):
        """Log test messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def test_send_otp(self):
        """Test POST /api/auth/send-otp"""
        self.log("Testing OTP Send...")
        
        payload = {"phoneNumber": TEST_PHONE}
        
        try:
            response = self.session.post(f"{self.base_url}/auth/send-otp", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "OTP sent" in data.get("message", ""):
                    self.log("✅ OTP Send: SUCCESS")
                    return True
                else:
                    self.log(f"❌ OTP Send: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ OTP Send: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ OTP Send: Exception - {str(e)}")
            return False
    
    def get_otp_from_logs(self):
        """Get OTP from backend logs"""
        self.log("Checking backend logs for OTP...")
        
        try:
            # Check supervisor backend logs
            result = os.popen("tail -n 50 /var/log/supervisor/backend.*.log 2>/dev/null | grep 'OTP for' | tail -1").read()
            
            if "OTP for" in result:
                # Extract OTP from log line like "=== OTP for +919876543211: 123456 ==="
                otp = result.split(":")[-1].strip().split()[0]
                self.log(f"Found OTP in logs: {otp}")
                return otp
            else:
                self.log("❌ No OTP found in backend logs")
                return None
                
        except Exception as e:
            self.log(f"❌ Error reading logs: {str(e)}")
            return None
    
    def test_verify_otp(self, otp_code):
        """Test POST /api/auth/verify-otp"""
        self.log(f"Testing OTP Verify with code: {otp_code}")
        
        payload = {
            "phoneNumber": TEST_PHONE,
            "otpCode": otp_code
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/verify-otp", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.jwt_token = data["token"]
                    self.user_data = data.get("user", {})
                    self.merchant_code = self.user_data.get("referralCode")
                    self.log("✅ OTP Verify: SUCCESS - JWT token received")
                    self.log(f"   User ID: {self.user_data.get('id')}")
                    self.log(f"   Merchant Code: {self.merchant_code}")
                    return True
                else:
                    self.log(f"❌ OTP Verify: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ OTP Verify: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ OTP Verify: Exception - {str(e)}")
            return False
    
    def test_register_user(self):
        """Test POST /api/auth/register"""
        self.log("Testing User Registration...")
        
        if not self.jwt_token:
            self.log("❌ Registration: No JWT token available")
            return False
        
        payload = {
            "shopName": TEST_SHOP_NAME,
            "city": TEST_CITY
        }
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user", {}).get("onboardingCompleted"):
                    self.log("✅ User Registration: SUCCESS")
                    return True
                else:
                    self.log(f"❌ User Registration: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ User Registration: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ User Registration: Exception - {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats"""
        self.log("Testing Dashboard Stats...")
        
        if not self.jwt_token:
            self.log("❌ Dashboard Stats: No JWT token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/dashboard/stats", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "stats" in data:
                    stats = data["stats"]
                    self.log("✅ Dashboard Stats: SUCCESS")
                    self.log(f"   Total Documents: {stats.get('documents', {}).get('totalUploaded', 0)}")
                    self.log(f"   Subscription: {stats.get('subscription', {}).get('plan', 'unknown')}")
                    return True
                else:
                    self.log(f"❌ Dashboard Stats: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ Dashboard Stats: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Dashboard Stats: Exception - {str(e)}")
            return False
    
    def test_start_trial(self):
        """Test POST /api/subscriptions/start-trial"""
        self.log("Testing Start Trial...")
        
        if not self.jwt_token:
            self.log("❌ Start Trial: No JWT token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        
        try:
            response = self.session.post(f"{self.base_url}/subscriptions/start-trial", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "trial activated" in data.get("message", ""):
                    self.log("✅ Start Trial: SUCCESS")
                    self.log(f"   Trial ends at: {data.get('trialEndsAt')}")
                    return True
                else:
                    self.log(f"❌ Start Trial: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ Start Trial: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Start Trial: Exception - {str(e)}")
            return False
    
    def test_subscription_plans(self):
        """Test GET /api/subscriptions/plans"""
        self.log("Testing Subscription Plans...")
        
        try:
            response = self.session.get(f"{self.base_url}/subscriptions/plans")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "plans" in data:
                    plans = data["plans"]
                    if len(plans) >= 2:  # Should have Free and Unlimited plans
                        self.log("✅ Subscription Plans: SUCCESS")
                        for plan in plans:
                            self.log(f"   Plan: {plan.get('name')} - ₹{plan.get('pricePerMonth')}/month")
                        return True
                    else:
                        self.log(f"❌ Subscription Plans: Insufficient plans - {plans}")
                        return False
                else:
                    self.log(f"❌ Subscription Plans: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ Subscription Plans: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Subscription Plans: Exception - {str(e)}")
            return False
    
    def test_customer_upload(self):
        """Test POST /api/documents/customer-upload/{merchant_code}"""
        self.log("Testing Customer Upload Portal...")
        
        if not self.merchant_code:
            self.log("❌ Customer Upload: No merchant code available")
            return False
        
        # Create a test file
        test_content = b"This is a test document for customer upload"
        files = {
            'file': ('test_document.txt', io.BytesIO(test_content), 'text/plain')
        }
        data = {
            'self_destruct_minutes': 5
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/documents/customer-upload/{self.merchant_code}",
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "uploaded successfully" in data.get("message", ""):
                    self.log("✅ Customer Upload: SUCCESS")
                    self.log(f"   Document ID: {data.get('documentId')}")
                    self.log(f"   Self-destruct: {data.get('selfDestructIn')} minutes")
                    return True
                else:
                    self.log(f"❌ Customer Upload: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ Customer Upload: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Customer Upload: Exception - {str(e)}")
            return False
    
    def test_document_upload(self):
        """Test POST /api/documents/upload"""
        self.log("Testing Document Upload...")
        
        if not self.jwt_token:
            self.log("❌ Document Upload: No JWT token available")
            return False
        
        # Create a test file
        test_content = b"This is a test document for merchant upload"
        files = {
            'file': ('merchant_document.pdf', io.BytesIO(test_content), 'application/pdf')
        }
        data = {
            'customerName': 'Rajesh Kumar',
            'deleteAfterMinutes': 5
        }
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        
        try:
            response = self.session.post(
                f"{self.base_url}/documents/upload",
                files=files,
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "document" in data:
                    doc = data["document"]
                    self.log("✅ Document Upload: SUCCESS")
                    self.log(f"   Document ID: {doc.get('id')}")
                    self.log(f"   QR Code generated: {'qrCode' in doc}")
                    return True
                else:
                    self.log(f"❌ Document Upload: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ Document Upload: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Document Upload: Exception - {str(e)}")
            return False
    
    def test_document_list(self):
        """Test GET /api/documents/list"""
        self.log("Testing Document List...")
        
        if not self.jwt_token:
            self.log("❌ Document List: No JWT token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.jwt_token}"}
        
        try:
            response = self.session.get(f"{self.base_url}/documents/list", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "documents" in data:
                    docs = data["documents"]
                    self.log("✅ Document List: SUCCESS")
                    self.log(f"   Total documents: {data.get('total', 0)}")
                    self.log(f"   Documents in response: {len(docs)}")
                    return True
                else:
                    self.log(f"❌ Document List: Invalid response - {data}")
                    return False
            else:
                self.log(f"❌ Document List: HTTP {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log(f"❌ Document List: Exception - {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        self.log("=" * 60)
        self.log("BHARATPRINT BACKEND API TEST SUITE")
        self.log("=" * 60)
        
        results = {}
        
        # Authentication Flow
        self.log("\n🔐 AUTHENTICATION FLOW")
        results['send_otp'] = self.test_send_otp()
        
        if results['send_otp']:
            # Wait a moment for OTP to be logged
            time.sleep(2)
            otp_code = self.get_otp_from_logs()
            
            if otp_code:
                results['verify_otp'] = self.test_verify_otp(otp_code)
                
                if results['verify_otp']:
                    results['register_user'] = self.test_register_user()
                else:
                    results['register_user'] = False
            else:
                results['verify_otp'] = False
                results['register_user'] = False
        else:
            results['verify_otp'] = False
            results['register_user'] = False
        
        # Protected Endpoints (require auth)
        self.log("\n🔒 PROTECTED ENDPOINTS")
        results['dashboard_stats'] = self.test_dashboard_stats()
        results['start_trial'] = self.test_start_trial()
        
        # Public Endpoints
        self.log("\n🌐 PUBLIC ENDPOINTS")
        results['subscription_plans'] = self.test_subscription_plans()
        
        # Customer Upload (no auth required)
        self.log("\n📤 CUSTOMER UPLOAD PORTAL")
        results['customer_upload'] = self.test_customer_upload()
        
        # Document Operations (require auth)
        self.log("\n📄 DOCUMENT OPERATIONS")
        results['document_upload'] = self.test_document_upload()
        results['document_list'] = self.test_document_list()
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name.replace('_', ' ').title()}: {status}")
            if result:
                passed += 1
        
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        return results

def main():
    """Main test execution"""
    tester = BharatPrintTester()
    results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    if not all(results.values()):
        exit(1)

if __name__ == "__main__":
    main()