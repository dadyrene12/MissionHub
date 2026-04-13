// src/components/MobileMenu.jsx
import React from 'react';
import { Home, BookmarkCheck, BarChart3, Users, FilePlus, LogOut, X, Briefcase } from 'lucide-react';

const MobileMenu = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  currentPage,
  handleNavigation,
  user,
  setPostJobOpen,
  setLoginOpen,
  setRegisterOpen,
  handleLogout,
  handlePostJobClick
}) => (
  <div className={`fixed inset-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out bg-white`}>
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <span className="text-2xl font-extrabold text-gray-900">Menu</span>
        <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
          <X className="w-8 h-8 text-gray-500" />
        </button>
      </div>
      <nav className="flex flex-col space-y-4 text-xl flex-1">
        {['home', 'jobs', 'bookmarks', 'comparison', 'about'].map(page => (
          <button
            key={page}
            onClick={() => handleNavigation(page)}
            className={`text-left py-3 font-semibold flex items-center ${
              currentPage === page 
                ? 'text-blue-600 border-l-4 border-blue-600 pl-4' 
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            {page === 'home' && <Home className="w-6 h-6 mr-3" />}
            {page === 'jobs' && <Briefcase className="w-6 h-6 mr-3" />}
            {page === 'bookmarks' && <BookmarkCheck className="w-6 h-6 mr-3" />}
            {page === 'comparison' && <BarChart3 className="w-6 h-6 mr-3" />}
            {page === 'about' && <Users className="w-6 h-6 mr-3" />}
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </button>
        ))}
        {user?.userType === 'company' && (
          <button
            onClick={() => {
              if (handlePostJobClick) handlePostJobClick();
              setMobileMenuOpen(false);
            }}
            className="text-left py-3 font-semibold flex items-center text-green-600"
          >
            <FilePlus className="w-6 h-6 mr-3" />
            Post a Job
          </button>
        )}
      </nav>
      <div className="pt-6 border-t border-gray-200">
        {user ? (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => { setMobileMenuOpen(false); setLoginOpen(true); }}
              className="w-full flex items-center justify-center py-3 px-4 border border-blue-600 rounded-lg shadow-sm text-lg font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); setRegisterOpen(true); }}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MobileMenu;