import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import Logo from '../../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Handle OTP input
  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      const msg = 'Please enter a valid 10-digit phone number';
      toast.error(msg);
      setError(msg);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('📱 Twilio SMS: Sending OTP', { phoneNumber });
      
      // Clean phone number - remove any spaces or non-digits
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        const msg = 'Please enter a valid 10-digit phone number';
        toast.error(msg);
        setError(msg);
        setLoading(false);
        return;
      }
      
      // Format phone with +91 country code
      const formattedPhone = `+91${cleanPhone}`;
      console.log('📱 Formatted phone number:', formattedPhone);
      
      // Call backend API to send OTP via Twilio
      const response = await authAPI.sendOTP({
        phoneNumber: formattedPhone
      });
      
      console.log('✅ OTP sent successfully:', response.data);
      
      // Store phone for verification
      sessionStorage.setItem('loginPhoneNumber', formattedPhone);
      
      toast.success(response.data.message || `OTP sent to ${formattedPhone}`);
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
      const msg = 'Please enter a 6-digit code';
      toast.error(msg);
      setError(msg);
      return;
    }

    const phoneNum = sessionStorage.getItem('loginPhoneNumber');
    if (!phoneNum) {
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
        otpCode: otpCode
      });
      
      console.log('✅ OTP verified successfully:', response.data);
      
      const { token, user } = response.data;
      
      // Store auth data
      setAuth({
        user,
        token
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('loginPhoneNumber');
      
      toast.success('Login successful!');
      navigate('/dashboard');
      
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
      
      // Reset OTP inputs
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
      
      console.error('Full error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    // Reset OTP and resend
    setOtp(['', '', '', '', '', '']);
    handleSendOTP({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] items-center justify-center p-12">
        <div className="text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Streamline your print business today.</h1>
          <p className="text-xl mb-8 text-white/90">
            Manage documents securely with auto-delete, customer upload portals, and powerful analytics all in one place.
          </p>
          <div className="flex items-center gap-2 text-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span>Trusted by 2,000+ Print Shops</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white" data-testid="login-form">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Logo size="md" />
              <span className="text-2xl font-bold text-[#134252]">BharatPrint</span>
            </div>
            <h2 className="text-3xl font-bold text-[#134252] mb-2">Welcome Back</h2>
            <p className="text-[#626C71]">Log in to your dashboard using your mobile number.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
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
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="8822545981"
                    maxLength="10"
                    disabled={loading}
                    className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent dark:bg-gray-700 dark:text-white outline-none"
                    data-testid="phone-input"
                  />
                </div>
                <p className="mt-2 text-xs text-[#626C71]">
                  Testing: Use 7086230642 or 8822545981 (verified numbers)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="send-otp-btn"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[#626C71]">
                Don't have an account?{' '}
                <a href="/auth/signup" className="text-[#34BEE8] font-semibold hover:underline">
                  Sign Up
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#134252]">
                    VERIFY IDENTITY
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-sm text-[#34BEE8] hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <div className="flex gap-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      disabled={loading}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent dark:bg-gray-700 dark:text-white outline-none"
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
                  Sent to {sessionStorage.getItem('loginPhoneNumber')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-[#134252] text-white py-3 rounded-lg font-semibold hover:bg-[#0F3440] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="verify-otp-btn"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Login
                    <Lock className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-center gap-6 text-sm text-[#626C71]">
              <a href="#" className="hover:text-[#134252]">Privacy Policy</a>
              <a href="#" className="hover:text-[#134252]">Terms of Service</a>
              <a href="/contact" className="hover:text-[#134252]">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
