import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '20 documents/month',
        '5-minute auto-delete',
        'Basic analytics'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 250,
      period: 'month',
      description: 'For serious print businesses',
      features: [
        'Unlimited documents',
        'Custom auto-delete (5/10/15 min)',
        'Advanced analytics',
        'Priority support'
      ],
      cta: 'Start 7-Day Free Trial',
      popular: true,
      trialNote: 'No UPI needed for the first 7 days'
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="pricing-page">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-lg" />
              <span className="ml-2 text-xl font-bold text-[#134252]">BharatPrint</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/auth/login')} className="text-[#626C71] hover:text-[#134252] font-medium">
                Login
              </button>
              <button onClick={() => navigate('/auth/signup')} className="bg-[#34BEE8] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#134252] mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-[#626C71] max-w-2xl mx-auto">
              Choose the perfect plan for your print shop. Unlimited plan includes a 7-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? 'border-[#34BEE8] shadow-2xl scale-105'
                    : 'border-gray-200'
                }`}
                data-testid={`pricing-card-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#34BEE8] to-[#00D4FF] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#134252] mb-2">{plan.name}</h3>
                  <p className="text-[#626C71]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-[#134252]">₹{plan.price}</span>
                    <span className="text-[#626C71] ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-[#10B981] mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-[#626C71]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.id === 'unlimited' ? navigate('/dashboard/checkout') : navigate('/auth/signup')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-[#34BEE8] text-white hover:bg-[#2BAED8]'
                      : 'bg-white text-[#34BEE8] border-2 border-[#34BEE8] hover:bg-[#F8FCFD]'
                  }`}
                  data-testid={`cta-btn-${plan.id}`}
                >
                  {plan.cta}
                  <ArrowRight className="w-5 h-5" />
                </button>
                {plan.trialNote && (
                  <p className="text-center text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
                    ✓ {plan.trialNote}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-[#626C71] mb-4">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                End-to-end encryption
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                DPDP Act compliant
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                Free updates
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#10B981]" />
                24/7 uptime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#F8FCFD]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#134252] text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-6 rounded-xl border border-gray-200">
              <summary className="font-semibold text-lg text-[#134252] cursor-pointer">Can I change plans later?</summary>
              <p className="mt-4 text-[#626C71]">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </details>
            <details className="bg-white p-6 rounded-xl border border-gray-200">
              <summary className="font-semibold text-lg text-[#134252] cursor-pointer">What happens after the free trial?</summary>
              <p className="mt-4 text-[#626C71]">After your 7-day trial, you'll be automatically moved to the Free plan (20 docs/month). You'll receive an SMS notification before this happens. No payment info required during trial.</p>
            </details>
            <details className="bg-white p-6 rounded-xl border border-gray-200">
              <summary className="font-semibold text-lg text-[#134252] cursor-pointer">How does the customer portal work?</summary>
              <p className="mt-4 text-[#626C71]">Share your unique QR code with customers. They can upload files directly to your dashboard with auto-delete timers (5, 10, or 15 minutes).</p>
            </details>
            <details className="bg-white p-6 rounded-xl border border-gray-200">
              <summary className="font-semibold text-lg text-[#134252] cursor-pointer">Is there a contract?</summary>
              <p className="mt-4 text-[#626C71]">No contracts! All plans are month-to-month. Cancel anytime with one click.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#134252] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 BharatPrint. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;