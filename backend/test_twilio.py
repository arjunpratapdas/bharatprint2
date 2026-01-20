#!/usr/bin/env python3
"""
Quick test script to verify Twilio SMS integration
Run this to test if Twilio is configured correctly
"""

import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

def test_twilio_config():
    """Test Twilio configuration"""
    print("="*60)
    print("🧪 Testing Twilio SMS Configuration")
    print("="*60)
    
    # Check environment variables
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    phone_number = os.getenv('TWILIO_PHONE_NUMBER')
    verified_numbers = os.getenv('TWILIO_VERIFIED_NUMBERS', '')
    
    print(f"\n📋 Configuration Check:")
    print(f"   Account SID: {'✅ Set' if account_sid else '❌ Missing'}")
    print(f"   Auth Token: {'✅ Set' if auth_token else '❌ Missing'}")
    print(f"   Phone Number: {phone_number if phone_number else '❌ Missing'}")
    
    if verified_numbers:
        verified_list = [num.strip() for num in verified_numbers.split(',')]
        print(f"   Verified Numbers: ✅ {len(verified_list)} numbers")
        for num in verified_list:
            print(f"      - {num}")
    else:
        print(f"   Verified Numbers: ⚠️ None (all numbers allowed)")
    
    if not all([account_sid, auth_token, phone_number]):
        print("\n❌ Configuration incomplete!")
        return False
    
    # Try to initialize Twilio client
    print(f"\n🔌 Initializing Twilio Client...")
    try:
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        print("✅ Twilio client initialized successfully!")
        
        # Try to fetch account info
        print(f"\n📊 Fetching Account Info...")
        account = client.api.accounts(account_sid).fetch()
        print(f"   Account Name: {account.friendly_name}")
        print(f"   Status: {account.status}")
        print(f"   Type: {account.type}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize Twilio: {e}")
        return False

def test_send_sms(to_number=None):
    """Test sending SMS (optional)"""
    if not to_number:
        print("\n⏭️ Skipping SMS send test (no number provided)")
        return
    
    print(f"\n📱 Testing SMS Send to {to_number}...")
    
    try:
        from twilio.rest import Client
        import random
        
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        
        client = Client(account_sid, auth_token)
        otp = str(random.randint(100000, 999999))
        
        message = client.messages.create(
            body=f"[TEST] Your BharatPrint verification code is: {otp}\n\nThis is a test message.",
            from_=phone_number,
            to=to_number
        )
        
        print(f"✅ SMS sent successfully!")
        print(f"   Message SID: {message.sid}")
        print(f"   Status: {message.status}")
        print(f"   To: {message.to}")
        print(f"   OTP: {otp}")
        
    except Exception as e:
        print(f"❌ Failed to send SMS: {e}")

if __name__ == "__main__":
    print("\n")
    success = test_twilio_config()
    
    if success:
        print("\n" + "="*60)
        print("✅ Twilio configuration is valid!")
        print("="*60)
        
        # Optionally test sending SMS
        print("\n💡 To test sending SMS, uncomment the line below and add a verified number:")
        print("   test_send_sms('+917086230642')")
        
        # Uncomment to test SMS sending:
        # test_send_sms('+917086230642')
    else:
        print("\n" + "="*60)
        print("❌ Twilio configuration has issues!")
        print("="*60)
    
    print("\n")
