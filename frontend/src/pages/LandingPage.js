import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, DollarSign, CheckCircle, FileText, TrendingUp, Users } from 'lucide-react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: <Shield className="w-8 h-8" />, title: 'Smart Document Queue', desc: 'Secure auto-delete after sharing' },
    { icon: <TrendingUp className="w-8 h-8" />, title: 'Real-time Analytics', desc: 'Track views and engagement' },
    { icon: <FileText className="w-8 h-8" />, title: 'Customer Portal', desc: 'Easy upload for customers' },
    { icon: <Users className="w-8 h-8" />, title: 'Customer CRM', desc: 'Manage all customer orders' },
    { icon: <DollarSign className="w-8 h-8" />, title: 'Automated Invoicing', desc: 'Generate invoices instantly' },
    { icon: <Zap className="w-8 h-8" />, title: 'Quick Processing', desc: 'Fast document handling' },
  ];

  const faqs = [
    { q: 'What is BharatPrint?', a: 'BharatPrint is an all-in-one platform for print shops to manage documents securely with auto-delete and customer portals.' },
    { q: 'How does document security work?', a: 'All documents are encrypted and auto-delete after your chosen time period (5, 10, or 15 minutes).' },
    { q: 'How does the customer upload portal work?', a: 'Your customers can upload files directly to your portal using a QR code. Files auto-delete after the timer you set.' },
    { q: 'Is there a free trial?', a: 'Yes! Get a 7-day free trial with unlimited documents. No payment info required.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo size="md" data-testid="logo" />
              <span className="text-xl font-bold text-[#134252] dark:text-white">BharatPrint</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-[#626C71] dark:text-gray-300 hover:text-[#134252] dark:hover:text-white font-medium">Features</a>
              <a href="/pricing" className="text-[#626C71] dark:text-gray-300 hover:text-[#134252] dark:hover:text-white font-medium">Pricing</a>
              <a href="#faq" className="text-[#626C71] dark:text-gray-300 hover:text-[#134252] dark:hover:text-white font-medium">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button onClick={() => navigate('/auth/login')} className="text-[#626C71] dark:text-gray-300 hover:text-[#134252] dark:hover:text-white font-medium" data-testid="login-btn">
                Login
              </button>
              <button onClick={() => navigate('/auth/signup')} className="bg-[#34BEE8] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors" data-testid="signup-btn">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4" data-testid="hero-section">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#134252] dark:text-white mb-6 leading-tight">
            Secure Document Sharing<br />for Print Shops
          </h1>
          <p className="text-xl md:text-2xl text-[#626C71] dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamline document management with auto-delete, customer portals, and detailed analytics. The all-in-one OS for modern print businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => navigate('/auth/signup')} className="bg-[#34BEE8] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#2BAED8] transition-all transform hover:scale-105 flex items-center justify-center gap-2" data-testid="get-started-btn">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/pricing')} className="bg-white dark:bg-gray-800 text-[#134252] dark:text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-[#34BEE8] hover:bg-[#F8FCFD] dark:hover:bg-gray-700 transition-all" data-testid="learn-more-btn">
              Learn More
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-[#626C71] dark:text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span>Only ₹250/month</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span>1000+ Print Shops</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-100 dark:bg-gray-800/50" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#134252] dark:text-white mb-4">Everything you need to run your shop</h2>
            <p className="text-xl text-[#626C71] dark:text-gray-300 max-w-3xl mx-auto">
              Replace your disconnected tools with one unified operating system designed specifically for the print industry.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105 cursor-pointer" data-testid={`feature-card-${idx}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#134252] dark:text-white mb-2">{feature.title}</h3>
                <p className="text-[#626C71] dark:text-gray-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20" data-testid="faq-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#134252] mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="bg-white p-6 rounded-xl border border-gray-200" data-testid={`faq-${idx}`}>
                <summary className="font-semibold text-lg text-[#134252] cursor-pointer">{faq.q}</summary>
                <p className="mt-4 text-[#626C71]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to organize your print shop?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join 1000+ shop owners who have streamlined their business with BharatPrint.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/auth/signup')} className="bg-white text-[#34BEE8] px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all" data-testid="start-trial-btn">
              Start Free Trial
            </button>
            <button onClick={() => navigate('/contact')} className="bg-transparent text-white px-8 py-4 rounded-lg font-bold text-lg border-2 border-white hover:bg-white/10 transition-all" data-testid="book-demo-btn">
              Book Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#134252] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo size="md" />
                <span className="text-xl font-bold">BharatPrint</span>
              </div>
              <p className="text-white/70">The all-in-one platform for print shops across India.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>© 2024 BharatPrint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;