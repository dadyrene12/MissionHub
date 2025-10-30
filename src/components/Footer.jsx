import React from 'react';
import { Linkedin, Github, Twitter, Phone, Mail, Map, ArrowUp, Send } from 'lucide-react';

const Footer = ({ handleNavigation }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0 bg-repeat" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>
      
      {/* Wave Shape */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-slate-900"></div>
      <svg className="absolute top-0 left-0 right-0 h-12 w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 120L60 105C120 90 180 60 240 45C300 30 360 30 420 37.5C480 45 540 60 600 67.5C660 75 720 75 780 67.5C840 60 900 45 960 37.5C1020 30 1080 30 1140 45C1200 60 1260 90 1320 105L1380 120L1440 120V120H1380C1320 120 1260 120 1200 120C1140 120 1080 120 1020 120C960 120 900 120 840 120C780 120 720 120 660 120C600 120 540 120 480 120C420 120 360 120 300 120C240 120 180 120 120 120C60 120 0 120 0 120Z" fill="url(#paint0_linear)"></path>
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="1440" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e40af"></stop>
            <stop offset="1" stopColor="#1e3a8a"></stop>
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">MH</span>
              </div>
              <h3 className="text-2xl font-bold">MISSION HUB</h3>
            </div>
            <p className="text-blue-200 max-w-xs">
              Connecting talented professionals with their dream opportunities. Your career journey starts here.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('home')} 
                  className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  Jobs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('about')} 
                  className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('bookmarks')} 
                  className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  My Bookmarks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation && handleNavigation('chat')} 
                  className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  AI Chat
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  Career Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-blue-400 mr-0 group-hover:w-5 group-hover:mr-2 transition-all duration-300"></span>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-blue-200">+250 (785) 510-038</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-blue-200">josephinovation131@gmail.com</span>
              </li>
              <li className="flex items-start">
                <Map className="w-5 h-5 mr-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-blue-200">Kigali, Rwanda</span>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <h5 className="text-lg font-medium mb-3">Subscribe to our newsletter</h5>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-200"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors duration-300">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Mission Hub. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className="absolute bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;