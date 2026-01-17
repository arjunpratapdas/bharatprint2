import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import { authAPI } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import Logo from '../../components/Logo';
import { formatPhoneNumber, getErrorMessage, logAuthStep } from '../../lib/clerk';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { signIn, setActive } = useSignIn();
  
  // Log initialization
  useEffect(() => {
    console.log('Login component mounted');
    console.log('Clerk signIn object:', signIn);
    console.log('Clerk setActive object:', setActive);
  }, [signIn, setActive]);
  
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
      toast.error('Please enter a valid 10-digit phone number');
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      logAuthStep('🔥', 'Clerk Phone Authentication: Sending OTP', { phoneNumber });
      
      // Format phone with +91 country code
      const formattedPhone = formatPhoneNumber(phoneNumber);
      logAuthStep('📱', 'Formatted phone number', { formattedPhone });
      
      if (!signIn) {
        throw new Error('Clerk SignIn not initialized');
      }

      // Create phone number identifier sign in flow
      const result = await signIn.create({
        identifier: formattedPhone
      });

      logAuthStep('✅', 'OTP sent successfully', { result });
      
      // Store phone for verification
      sessionStorage.setItem('loginPhoneNumber', phoneNumber);
      
      toast.success(`OTP sent to ${formattedPhone}`);
      setStep(2);
      setCountdown(300); // 5 minutes for OTP verification
      
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
      
      console.error('Full error object:', err);
      console.error('Error code:', err?.code);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      console.error('Error details:', JSON.stringify(err, null, 2));
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

    setLoading(true);
    setError('');

    try {
      logAuthStep('📝', 'Verifying OTP code', { otpCode: '****' });
      
      if (!signIn) {
        throw new Error('Clerk SignIn not initialized');
      }

      // Prepare the phone code attempt
      const verificationResult = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code: otpCode
      });

      logAuthStep('✅', 'OTP verified successfully', { verificationResult });
      
      if (verificationResult.status === 'complete') {
        // Set active session
        await setActive({ session: verificationResult.createdSessionId });
        logAuthStep('✅', 'Clerk session created', { sessionId: verificationResult.createdSessionId });

        // Get the session token
        const session = verificationResult;
        
        logAuthStep('🔑', 'Retrieved session', { sessionId: session.createdSessionId });
        
        // Verify with backend
        try {
          const response = await authAPI.post('/auth/verify-clerk-token', { 
            phoneNumber: phoneNumber,
            clerkUserId: session.userId
          });

          logAuthStep('✅', 'Backend verified token', response.data);
          
          const { user, jwt_token } = response.data;
          
          // Store auth data
          setAuth({
            user,
            token: jwt_token
          });
          
          localStorage.setItem('auth_token', jwt_token);
          sessionStorage.removeItem('loginPhoneNumber');
          
          toast.success('Login successful!');
          navigate('/dashboard');
        } catch (backendError) {
          logAuthStep('❌', 'Backend verification failed', backendError);
          
          const errorMsg = backendError.response?.data?.detail || 
                         'Backend verification failed';
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

  const handleOTPChange = (index, value) => {
    if (isNaN(value)) return;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
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
                    placeholder="9876543210"
                    maxLength="10"
                    disabled={loading}
                    className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent dark:bg-gray-700 dark:text-white outline-none"
                    data-testid="phone-input"
                  />
                </div>
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
                      onChange={(e) => handleOtpChange(index, e.target.value)}
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
                <p className="text-sm text-[#626C71] mt-2">Sent to +91 {phoneNumber}</p>
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