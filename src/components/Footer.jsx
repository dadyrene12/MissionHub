import React, { useState } from 'react';
import { Linkedin, Github, Twitter, Phone, Mail, MapPin, ArrowUp, Send, X, MailOpen } from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

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
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
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
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                <span className="text-white font-bold text-xl">MH</span>
              </div>
              <h3 className="text-2xl font-bold">MISSION HUB</h3>
            </div>
            <p className="text-slate-400 max-w-xs">
              Connecting talented professionals with their dream opportunities.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 border border-slate-700">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 border border-slate-700">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 border border-slate-700">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold border-b border-slate-700 pb-2">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('home')} 
                  className="text-slate-400 hover:text-white flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Jobs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('about')} 
                  className="text-slate-400 hover:text-white flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('contact')} 
                  className="text-slate-400 hover:text-white flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold border-b border-slate-700 pb-2">For Employers</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('postJob')} 
                  className="text-slate-400 hover:text-white flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Post a Job
                </button>
              </li>
              <li>
                <button className="text-slate-400 hover:text-white flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Browse Talent
                </button>
              </li>
              <li>
                <button className="text-slate-400 hover:text-white flex items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-3"></span>
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold border-b border-slate-700 pb-2">Newsletter</h4>
            <p className="text-slate-400">
              Get the latest job opportunities delivered to your inbox.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-white text-slate-950 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm">
            © {currentYear} Mission Hub. All rights reserved.
          </p>
          <button 
            onClick={scrollToTop}
            className="mt-4 md:mt-0 p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Subscribe to Newsletter</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MailOpen className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-bold mb-2">You're Subscribed!</h4>
                <p className="text-slate-400 mb-6">Thank you for subscribing.</p>
                <button 
                  onClick={() => { setShowModal(false); setStatus(''); }}
                  className="px-6 py-2 bg-slate-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 mb-6">
                  Join thousands of professionals getting the latest job opportunities.
                </p>
                
                <form onSubmit={handleSubscribe}>
                  <div className="mb-4">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email" 
                      required
                      className="w-full px-4 py-3 bg-gray-900 border border-slate-600 rounded-xl focus:outline-none focus:border-gray-500 text-white"
                    />
                  </div>
                  
                  {status === 'error' && (
                    <p className="text-red-400 text-sm mb-4">Something went wrong. Please try again.</p>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
                  Unsubscribe at any time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;