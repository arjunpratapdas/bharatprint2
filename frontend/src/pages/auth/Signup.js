import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import api, { authAPI } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { Phone, Building2, MapPin, Award, ArrowRight, User } from 'lucide-react';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';
import { formatPhoneNumber, getErrorMessage, logAuthStep } from '../../lib/clerk';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, user, updateUser } = useAuthStore();
  const { signUp, setActive } = useSignUp();
  
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
    referralCode: searchParams.get('ref') || ''
  });
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const cities = ['Guwahati', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur'];
  const states = ['Assam', 'Maharashtra', 'Delhi', 'Karnataka', 'West Bengal', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan'];

  const startTrial = useCallback(async () => {
    try {
      const response = await api.post('/subscriptions/start-trial');
      updateUser({
        subscriptionStatus: 'trial',
        trialEndsAt: response.data.trialEndsAt,
        monthlyUploadLimit: 999999
      });
      toast.success('7-day unlimited trial activated!');
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  }, [updateUser]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trialParam = urlParams.get('trial');
    
    if (trialParam === 'true') {
      // Start trial after signup/login
      startTrial();
    }
  }, [startTrial]);

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
      logAuthStep('🔥', 'Clerk Phone Authentication: Sending OTP', { phoneNumber, name });
      
      const formattedPhone = formatPhoneNumber(phoneNumber);
      logAuthStep('📱', 'Formatted phone number', { formattedPhone });
      
      if (!signUp) {
        throw new Error('Clerk SignUp not initialized');
      }

      // Create sign up with phone number
      const result = await signUp.create({
        identifier: formattedPhone
      });

      logAuthStep('✅', 'OTP sent successfully', { result });
      
      // Store in session storage
      sessionStorage.setItem('pendingPhoneNumber', phoneNumber);
      sessionStorage.setItem('pendingName', name);
      
      toast.success(`OTP sent to ${formattedPhone}`);
      setFormData({...formData, name: name});
      setStep(2);
      setCountdown(300);
      
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
      logAuthStep('❌', 'OTP Send Error', err);
      
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      
      console.error('Full error:', err);
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
      logAuthStep('📝', 'Verifying OTP code', { otpCode: '****' });
      
      if (!signUp) {
        throw new Error('Clerk SignUp not initialized');
      }

      // Attempt first factor verification with phone code
      const verificationResult = await signUp.attemptFirstFactor({
        strategy: 'phone_code',
        code: otpCode
      });

      logAuthStep('✅', 'OTP verified successfully', { verificationResult });
      
      if (verificationResult.status === 'complete') {
        // Set active session
        await setActive({ session: verificationResult.createdSessionId });
        logAuthStep('✅', 'Clerk session created', { sessionId: verificationResult.createdSessionId });

        // Verify with backend
        try {
          const response = await authAPI.post('/auth/verify-clerk-token', { 
            phoneNumber: phoneNum,
            name: nameVal,
            clerkUserId: verificationResult.userId
          });

          logAuthStep('✅', 'Backend verified token', response.data);
          
          const { user: userData, jwt_token } = response.data;
          
          // Clear session storage
          sessionStorage.removeItem('pendingPhoneNumber');
          sessionStorage.removeItem('pendingName');
          
          // Store auth data
          setAuth({
            user: userData,
            token: jwt_token
          });
          
          localStorage.setItem('auth_token', jwt_token);
          
          toast.success('Account created successfully!');
          navigate('/dashboard');
        } catch (backendError) {
          logAuthStep('❌', 'Backend verification failed', backendError);
          
          const errorMsg = backendError.response?.data?.detail || 'Backend verification failed';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } else {
        logAuthStep('⚠️', 'OTP verification incomplete', { status: verificationResult.status });
        setError('OTP verification failed');
        toast.error('OTP verification failed. Please try again.');
      }
    } catch (err) {
      logAuthStep('❌', 'OTP Verification Error', err);
      
      const errorMessage = getErrorMessage(err);
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
      // Send registration with name and phone number
      const response = await authAPI.register({
        ...formData,
        name: name,
        phoneNumber: phoneNumber
      });
      updateUser(response.data.user);
      toast.success('Registration completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = (typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : null) || 'Registration failed';
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
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div className="min-h-screen flex">
      <div id="recaptcha-container"></div>
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
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="name-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  Mobile Number
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
                    onChange={(e) => setPhoneNumber(e.target.value.slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="phone-input"
                  />
                </div>
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
                    Code expires in {countdown > 0 ? `00:${countdown.toString().padStart(2, '0')}` : '00:00'}
                  </p>
                  {countdown === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-sm text-[#34BEE8] font-semibold hover:underline"
                      data-testid="resend-otp-btn"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#626C71] mt-2">Sent to +91 {phoneNumber}</p>
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
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#134252] mb-2">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="state-select"
                  >
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#134252] mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value.slice(0, 6)})}
                    placeholder="560001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="pincode-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#134252] mb-2">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Award className="w-5 h-5 text-[#626C71]" />
                  </div>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})}
                    placeholder="BP_XXXX1234"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    data-testid="referral-code-input"
                  />
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