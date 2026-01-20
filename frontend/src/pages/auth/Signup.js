import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { Phone, Building2, MapPin, ArrowRight, User } from 'lucide-react';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';

const Signup = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    city: '',
    state: 'Assam',
    pincode: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const cities = ['Guwahati', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur'];
  const states = ['Assam', 'Maharashtra', 'Delhi', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan'];

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Please enter your full name');
      return;
    }
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('📱 Twilio SMS: Sending OTP', { phoneNumber, name });
      
      // Clean phone number - remove any spaces or non-digits
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        const msg = 'Please enter a valid 10-digit phone number';
        toast.error(msg);
        setError(msg);
        setLoading(false);
        return;
      }
      
      const formattedPhone = `+91${cleanPhone}`;
      console.log('📱 Formatted phone number:', formattedPhone);
      
      // Call backend API to send OTP via Twilio
      const response = await authAPI.sendOTP({
        phoneNumber: formattedPhone,
        name: name
      });
      
      console.log('✅ OTP sent successfully:', response.data);
      
      // Store in session storage
      sessionStorage.setItem('pendingPhoneNumber', formattedPhone);
      sessionStorage.setItem('pendingName', name);
      
      toast.success(response.data.message || `OTP sent to ${formattedPhone}`);
      setFormData({...formData, name: name});
      setStep(2);
      
      // Set countdown from response (300 seconds = 5 minutes)
      const expiresIn = response.data.expiresIn || 300;
      setCountdown(expiresIn);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('❌ OTP Send Error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        code: err.code,
        request: err.request
      });
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      // Network error - backend not reachable
      if (!err.response) {
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:8000';
        } else if (err.code === 'ERR_NETWORK' || err.request) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = `Connection error: ${err.message || 'Please check if the backend server is running.'}`;
        }
      }
      // Backend responded with error
      else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 403) {
        errorMessage = 'This phone number is not verified. Please use a verified number for testing.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.detail || 'Invalid phone number format. Please enter a valid 10-digit number.';
      } else if (err.response?.status === 500 || err.response?.status === 503) {
        errorMessage = err.response.data?.detail || 'SMS service error. Please try again or contact support.';
      } else if (err.response?.status) {
        errorMessage = `Error ${err.response.status}: ${err.response.data?.detail || err.response.statusText || 'Please try again.'}`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Full error object:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      setError('Please enter a 6-digit code');
      return;
    }

    const phoneNum = sessionStorage.getItem('pendingPhoneNumber');
    const nameVal = sessionStorage.getItem('pendingName');

    if (!phoneNum || !nameVal) {
      toast.error('Please request OTP first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('📝 Verifying OTP code...', { phoneNumber: phoneNum, otpCode });
      
      // Call backend API to verify OTP
      const response = await authAPI.verifyOTP({
        phoneNumber: phoneNum,
        otpCode: otpCode,
        name: nameVal
      });
      
      console.log('✅ OTP verified successfully:', response.data);
      
      const { token, user, isNewUser } = response.data;
      
      // Clear session storage
      sessionStorage.removeItem('pendingPhoneNumber');
      sessionStorage.removeItem('pendingName');
      
      // Store auth data
      setAuth({
        user: user,
        token: token
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Account created successfully!');
      
      // If new user and onboarding not completed, go to step 3
      if (isNewUser && !user.onboardingCompleted) {
        setStep(3);
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      console.error('❌ OTP Verification Error:', err);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid or expired OTP. Please try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset OTP
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
      
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.shopName || !formData.city) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Completing registration...', formData);
      
      // Call backend API to complete registration
      await authAPI.register({
        name: formData.name,
        shopName: formData.shopName,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        businessCategory: 'print_shop',
        referralCode: formData.referralCode
      });
      
      console.log('✅ Registration completed');
      
      toast.success('Registration completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMsg = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const handleOTPChange = (index, value) => {
    if (isNaN(value)) return;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    
    // Restore phone and name from session
    const phoneNum = sessionStorage.getItem('pendingPhoneNumber');
    const nameVal = sessionStorage.getItem('pendingName');
    
    if (phoneNum && nameVal) {
      // Remove +91 prefix for display
      setPhoneNumber(phoneNum.replace('+91', ''));
      setName(nameVal);
    }
    
    handleSendOTP({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] items-center justify-center p-12">
        <div className="text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Manage your Print Shop efficiently</h1>
          <p className="text-xl mb-8 text-white/90">
            Streamline your document workflow with auto-delete, customer portals, and detailed analytics all in one place. Join thousands of partners growing with BharatPrint.
          </p>
          <div className="flex items-center gap-2 text-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span>Trusted by 2,000+ Print Shops</span>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white" data-testid="signup-form">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-2 rounded-full mx-1 ${
                  step >= s ? 'bg-[#34BEE8]' : 'bg-gray-200'
                }`} data-testid={`progress-step-${s}`} />
              ))}
            </div>
            <p className="text-sm text-[#626C71] text-center">Step {step} of 3</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Logo size="md" />
              <span className="text-2xl font-bold text-[#134252]">BharatPrint</span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
            {step < 3 && (
              <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg px-4 py-2 mb-4">
                <p className="text-sm font-semibold text-[#92400E]">START YOUR 7-DAY FREE TRIAL</p>
              </div>
            )}
            <h2 className="text-3xl font-bold text-[#134252] mb-2">
              {step === 3 ? 'Complete Your Profile' : 'Create your Partner Account'}
            </h2>
            <p className="text-[#626C71]">
              {step === 1 && 'Enter your mobile number to get started.'}
              {step === 2 && 'Enter the verification code sent to your phone.'}
              {step === 3 && 'Tell us about your print shop to finish setup.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="w-5 h-5 text-[#626C71]" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="arjunpratapdas"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Phone className="w-5 h-5 text-[#626C71]" />
                  </div>
                  <div className="absolute inset-y-0 left-12 flex items-center text-[#626C71] font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="8822545981"
                    className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="phone-input"
                  />
                </div>
                <p className="mt-2 text-xs text-[#626C71]">
                  Testing: Use 7086230642 or 8822545981 (verified numbers)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10 || !name}
                className="w-full bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="send-otp-btn"
              >
                {loading ? 'Sending...' : 'Send OTP'}
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-sm text-[#626C71]">
                Already have an account?{' '}
                <a href="/auth/login" className="text-[#34BEE8] font-semibold hover:underline">
                  Login
                </a>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  Enter Verification Code
                </label>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                      data-testid={`otp-input-${index}`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-[#626C71]">
                    Code expires in {formatCountdown()}
                  </p>
                  {countdown === 0 && (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-[#34BEE8] font-semibold hover:underline"
                      data-testid="resend-otp-btn"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#626C71] mt-2">
                  Sent to {sessionStorage.getItem('pendingPhoneNumber')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-[#134252] text-white py-3 rounded-lg font-semibold hover:bg-[#0F3440] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  Shop Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Building2 className="w-5 h-5 text-[#626C71]" />
                  </div>
                  <input
                    type="text"
                    value={formData.shopName}
                    onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                    placeholder="Enter shop name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="shop-name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  City *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <MapPin className="w-5 h-5 text-[#626C71]" />
                  </div>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent appearance-none"
                    data-testid="city-select"
                  >
                    <option value="">Select city</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.shopName || !formData.city}
                className="w-full bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="complete-signup-btn"
              >
                {loading ? 'Creating Account...' : 'Complete Sign Up'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-center gap-6 text-sm text-[#626C71]">
              <a href="#" className="hover:text-[#134252]">Terms of Service</a>
              <a href="#" className="hover:text-[#134252]">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
