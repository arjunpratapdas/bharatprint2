import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Phone, MessageCircle, Send } from 'lucide-react';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending message
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white" data-testid="contact-page">
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

      {/* Contact Content */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-[#134252] mb-4">Get in Touch</h1>
            <p className="text-xl text-[#626C71] max-w-2xl mx-auto">
              Have questions? We're here to help. Reach out to us through any of these channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#134252] mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#134252] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    placeholder="Your name"
                    required
                    data-testid="name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134252] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent"
                    placeholder="your@email.com"
                    required
                    data-testid="email-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134252] mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34BEE8] focus:border-transparent h-32 resize-none"
                    placeholder="How can we help?"
                    required
                    data-testid="message-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#34BEE8] text-white py-3 rounded-lg font-semibold hover:bg-[#2BAED8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="submit-btn"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#134252] mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#34BEE8] transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#134252] mb-1">Email</h3>
                      <p className="text-[#626C71]">support@bharatprint.com</p>
                      <p className="text-sm text-[#626C71] mt-1">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#34BEE8] transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#134252] mb-1">Phone</h3>
                      <p className="text-[#626C71]">+91-XXXXXXXXXX</p>
                      <p className="text-sm text-[#626C71] mt-1">Mon-Fri, 9AM-6PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#34BEE8] transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#34BEE8] to-[#00D4FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#134252] mb-1">Live Chat</h3>
                      <p className="text-[#626C71]">Available in dashboard</p>
                      <p className="text-sm text-[#626C71] mt-1">Quick support for logged-in users</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F8FCFD] rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-[#134252] mb-4">Support Hours</h3>
                <div className="space-y-2 text-[#626C71]">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
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

export default Contact;