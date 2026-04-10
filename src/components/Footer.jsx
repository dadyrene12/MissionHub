import React, { useState } from 'react';
import { Linkedin, Github, Twitter, Phone, Mail, Map, ArrowUp, Send, X, MailOpen } from 'lucide-react';

const Footer = ({ handleNavigation }) => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setStatus('');
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0 bg-repeat" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                <span className="text-white font-bold text-xl">MH</span>
              </div>
              <h3 className="text-2xl font-bold">MISSION HUB</h3>
            </div>
            <p className="text-slate-400 max-w-xs">
              Connecting talented professionals with their dream opportunities. Your career journey starts here.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all duration-300 hover:scale-110 border border-slate-700">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all duration-300 hover:scale-110 border border-slate-700">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all duration-300 hover:scale-110 border border-slate-700">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold border-b border-slate-700 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('home')} 
                  className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Jobs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('about')} 
                  className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('bookmarks')} 
                  className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  My Bookmarks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('chat')} 
                  className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  AI Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold border-b border-slate-700 pb-2">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Career Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter CTA */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold border-b border-slate-700 pb-2">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-400">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>+250795232735</span>
              </li>
              <li className="flex items-center text-slate-400">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>reneniyi@gmail.com</span>
              </li>
              <li className="flex items-center text-slate-400">
                <Map className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
            
            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-slate-600 hover:border-gray-500 group"
            >
              <MailOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Subscribe to Newsletter</span>
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Mission Hub. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 border border-slate-700"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Newsletter Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 overflow-hidden shadow-2xl">
            <div className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"></div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
                    <MailOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Stay Updated</h3>
                    <p className="text-slate-400 text-sm">Get jobs delivered to your inbox</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowModal(false); setStatus(''); }} 
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              {status === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MailOpen className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">You're Subscribed!</h4>
                  <p className="text-slate-400 mb-6">Thank you for subscribing to our newsletter.</p>
                  <button 
                    onClick={() => { setShowModal(false); setStatus(''); }}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 mb-6">
                    Join thousands of professionals getting the latest job opportunities and career tips.
                  </p>
                  
                  <form onSubmit={handleSubscribe}>
                    <div className="mb-4">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address" 
                        required
                        className="w-full px-4 py-3 bg-gray-900 border border-slate-600 rounded-xl focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-500"
                      />
                    </div>
                    
                    {status === 'error' && (
                      <p className="text-red-400 text-sm mb-4">Something went wrong. Please try again.</p>
                    )}
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Subscribing...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Subscribe Now</span>
                        </>
                      )}
                    </button>
                  </form>
                  
                  <p className="text-slate-500 text-xs text-center mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
