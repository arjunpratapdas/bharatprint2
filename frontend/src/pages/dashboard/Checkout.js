import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { subscriptionsAPI } from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { toast } from 'sonner';
import { Check, Shield, Zap, Clock, FileText, Crown, ArrowRight } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const response = await subscriptionsAPI.startTrial();
      updateUser({ 
        ...user, 
        subscriptionStatus: 'trial',
        monthlyUploadLimit: 999999,
        trialEndsAt: response.data.trialEndsAt
      });
      toast.success('7-day free trial activated!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start trial');
    }
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system loading. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const formData = new FormData();
      formData.append('plan_id', 'plan_unlimited');
      const orderResponse = await subscriptionsAPI.createOrder(formData);
      const order = orderResponse.data.order;

      // Check if test mode
      if (orderResponse.data.testMode) {
        toast.info('Payment is in test mode. Activating subscription...');
        // Simulate payment verification
        const verifyForm = new FormData();
        verifyForm.append('razorpay_order_id', order.orderId);
        verifyForm.append('razorpay_payment_id', 'pay_test_' + Date.now());
        verifyForm.append('razorpay_signature', 'test_signature');
        
        await subscriptionsAPI.verifyPayment(verifyForm);
        updateUser({ ...user, subscriptionStatus: 'unlimited', monthlyUploadLimit: 999999 });
        toast.success('Subscription activated!');
        navigate('/dashboard');
        setLoading(false);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'BharatPrint',
        description: 'Unlimited Plan - Monthly Subscription',
        order_id: order.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyForm = new FormData();
            verifyForm.append('razorpay_order_id', response.razorpay_order_id);
            verifyForm.append('razorpay_payment_id', response.razorpay_payment_id);
            verifyForm.append('razorpay_signature', response.razorpay_signature);
            
            await subscriptionsAPI.verifyPayment(verifyForm);
            updateUser({ ...user, subscriptionStatus: 'unlimited', monthlyUploadLimit: 999999 });
            toast.success('Payment successful! Subscription activated.');
            navigate('/dashboard');
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.shopName || '',
          contact: user?.phoneNumber?.replace('+91', '') || ''
        },
        theme: {
          color: '#34BEE8'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const features = [
    { icon: <FileText className="w-5 h-5" />, text: 'Unlimited documents per month' },
    { icon: <Clock className="w-5 h-5" />, text: 'Custom auto-delete (5/10/15 min)' },
    { icon: <Zap className="w-5 h-5" />, text: 'Advanced analytics dashboard' },
    { icon: <Shield className="w-5 h-5" />, text: 'Priority customer support' },
  ];

  // Check if user already has unlimited plan
  if (user?.subscriptionStatus === 'unlimited') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#134252] dark:text-white mb-4">You're on Unlimited!</h2>
          <p className="text-[#626C71] dark:text-gray-400 mb-8">
            You already have the Unlimited plan with unlimited documents and all premium features.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#34BEE8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8" data-testid="checkout-page">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#134252] dark:text-white mb-4">
            Upgrade to Unlimited
          </h1>
          <p className="text-lg text-[#626C71] dark:text-gray-400">
            Get unlimited documents and premium features
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Plan Header */}
          <div className="bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] p-8 text-white text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-4">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">UNLIMITED PLAN</span>
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold">₹250</span>
              <span className="text-xl text-white/80">/month</span>
            </div>
            <p className="mt-2 text-white/90">Cancel anytime</p>
          </div>

          {/* Features */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-[#134252] dark:text-white mb-6">What's included:</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-[#F8FCFD] dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-[#34BEE8]/10 rounded-lg flex items-center justify-center text-[#34BEE8]">
                    {feature.icon}
                  </div>
                  <span className="text-[#134252] dark:text-white font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Trial Option */}
            {!user?.trialStartedAt && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#134252] dark:text-white mb-1">🎉 Try Free for 7 Days!</h4>
                    <p className="text-sm text-[#626C71] dark:text-gray-400">
                      No payment required. Automatically downgrades to Free plan after trial.
                    </p>
                  </div>
                  <button
                    onClick={handleStartTrial}
                    disabled={loading}
                    className="bg-white dark:bg-gray-800 border-2 border-[#34BEE8] text-[#34BEE8] px-6 py-3 rounded-lg font-semibold hover:bg-[#34BEE8] hover:text-white transition-all disabled:opacity-50"
                    data-testid="start-trial-btn"
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              data-testid="pay-now-btn"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  Pay ₹250 Now
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-[#626C71] dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Secured by Razorpay. Your payment is 100% safe.</span>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-xl font-bold text-[#134252] dark:text-white mb-6 text-center">Plan Comparison</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h4 className="font-bold text-[#134252] dark:text-white mb-2">Free Plan</h4>
              <p className="text-2xl font-bold text-[#134252] dark:text-white mb-4">₹0</p>
              <ul className="space-y-2 text-sm text-[#626C71] dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> 20 documents/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> 5-minute auto-delete only
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" /> Basic analytics
                </li>
              </ul>
            </div>
            
            {/* Unlimited Plan */}
            <div className="border-2 border-[#34BEE8] rounded-xl p-6 bg-[#34BEE8]/5">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-[#134252] dark:text-white">Unlimited Plan</h4>
                <span className="bg-[#34BEE8] text-white text-xs px-2 py-1 rounded-full">RECOMMENDED</span>
              </div>
              <p className="text-2xl font-bold text-[#134252] dark:text-white mb-4">₹250/mo</p>
              <ul className="space-y-2 text-sm text-[#134252] dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#34BEE8]" /> <strong>Unlimited</strong> documents
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#34BEE8]" /> Custom auto-delete (5/10/15 min)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#34BEE8]" /> Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#34BEE8]" /> Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Checkout;
