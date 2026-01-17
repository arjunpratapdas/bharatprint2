import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      q: 'What is BharatPrint?',
      a: 'BharatPrint is an all-in-one platform designed specifically for Indian print shops to manage documents securely with auto-delete and customer upload portals.'
    },
    {
      q: 'How does the document security work?',
      a: 'All documents uploaded to BharatPrint are encrypted. You can set custom auto-delete times (5, 10, or 15 minutes) and even one-time view links that self-destruct after viewing.'
    },
    {
      q: 'Are my documents really deleted?',
      a: 'Yes! When your chosen time period expires, documents are permanently deleted from our servers. We are fully compliant with India\'s Digital Personal Data Protection (DPDP) Act.'
    },
    {
      q: 'How does the customer upload portal work?',
      a: 'Share your unique QR code or link with customers. They can upload files directly to your dashboard with auto-delete timers. No account needed for customers.'
    },
    {
      q: 'What are the subscription plans?',
      a: 'Free plan: 20 documents/month with 5-min auto-delete. Unlimited plan: ₹250/month for unlimited documents with custom timers. New users get a 7-day free trial of the Unlimited plan.'
    },
    {
      q: 'Is my data DPDP compliant?',
      a: 'Absolutely! We are fully compliant with India\'s Digital Personal Data Protection Act. We collect minimal data, provide auto-delete functionality, and give you full control over your information.'
    },
    {
      q: 'Can I change the auto-delete time?',
      a: 'Yes! Free users get 5-minute auto-delete. Unlimited plan users can choose: 5, 10, or 15 minutes.'
    },
    {
      q: 'What file types are supported?',
      a: 'We support PDF, PNG, JPG, and JPEG files up to 50MB each. These are the most common formats used in print shops.'
    },
    {
      q: 'How do I upgrade my plan?',
      a: 'Go to Settings > Billing in your dashboard and click "Upgrade Plan". You can start a 7-day free trial anytime.'
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes! All new users get a 7-day free trial with full access to Unlimited plan features. No payment info required to start.'
    },
    {
      q: 'How do I contact support?',
      a: 'You can reach us via email at support@bharatprint.com or use the contact form on our website. Unlimited plan users get priority support.'
    },
    {
      q: 'Can I integrate with my POS system?',
      a: 'API access for custom integrations is available for enterprise customers. Contact sales for more information.'
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="faq-page">
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

      {/* FAQ Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#134252] mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-[#626C71]">
              Everything you need to know about BharatPrint. Can't find your answer? Contact us anytime.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-[#34BEE8] transition-colors group" data-testid={`faq-item-${idx}`}>
                <summary className="font-semibold text-lg text-[#134252] cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-[#626C71] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-[#626C71] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-16 text-center bg-[#F8FCFD] rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-[#134252] mb-4">Still have questions?</h3>
            <p className="text-[#626C71] mb-6">
              Our support team is here to help you get started.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-[#34BEE8] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors"
              data-testid="contact-support-btn"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#134252] text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2024 BharatPrint. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;