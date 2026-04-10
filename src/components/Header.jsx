import React from 'react';
import {
  Home, BookmarkCheck, BarChart3, Users, Menu, Bell, Inbox,
  FilePlus, UserCircle, FileText, Settings, LogOut, X,
  ChevronDown, Building, Briefcase, Mail, MessageSquare,
} from 'lucide-react';

const Header = ({
  currentPage,
  handleNavigation,
  user,
  notifications = [],
  messages = [],
  setLoginOpen,
  setRegisterOpen,
  setPostJobOpen,
  showNotification,
  setNotificationPanelOpen,
  setInboxPanelOpen,
  setProfileDropdownOpen,
  profileDropdownOpen,
  setProfilePanelOpen,
  setDocumentShareOpen,
  setSettingsPanelOpen,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  scrollProgress = 0,
  notificationPanelOpen = false,
  inboxPanelOpen = false,
  handlePostJobClick,
}) => {
  
  // ✅ FIXED: Determine if user is a company based on userType with safe access
  const isCompanyUser = user?.userType === 'company';
  
  // ✅ FIXED: Handle post job click with proper backend user checks
  const handlePostJob = () => {
    if (!user) {
      showNotification('Please log in to post a job', 'warning');
      setLoginOpen(true);
      return;
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      showNotification('Please verify your email before posting jobs', 'warning');
      return;
    }
    
    if (user.userType !== 'company') {
      showNotification('Only company accounts can post jobs. Please switch to a company account.', 'warning');
      return;
    }
    
    setPostJobOpen(true);
  };

  // ✅ FIXED: Filter unread notifications and messages with safe access
  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => n && !n.read) : [];
  const unreadMessages = Array.isArray(messages) ? messages.filter(m => m && !m.read) : [];

  // ✅ FIXED: Get user initial for avatar with safe access
  const getUserInitial = () => {
    if (!user) return 'U';
    if (user.name && typeof user.name === 'string') return user.name.charAt(0).toUpperCase();
    if (user.email && typeof user.email === 'string') return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // ✅ FIXED: Get user display name with safe access
  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    if (user.name && typeof user.name === 'string') return user.name;
    if (user.email && typeof user.email === 'string') return user.email.split('@')[0];
    return 'User';
  };

  // ✅ FIXED: Get user role display text with safe access
  const getUserRoleDisplay = () => {
    if (!user) return 'guest';
    if (user.userType === 'company') return 'company';
    if (user.userType === 'jobSeeker') return 'job seeker';
    return 'user';
  };

  // ✅ FIXED: Get verification status
  const getVerificationStatus = () => {
    if (!user) return 'unverified';
    return user.isVerified ? 'verified' : 'unverified';
  };

  // ✅ FIXED: Handle navigation with error boundary
  const safeHandleNavigation = (page) => {
    try {
      handleNavigation(page);
    } catch (error) {
      console.error('Navigation error:', error);
      showNotification('Navigation error occurred', 'error');
    }
  };

  // ✅ FIXED: Safe notification toggle with backend integration
  const safeToggleNotificationPanel = () => {
    if (user) {
      if (!user.isVerified) {
        showNotification('Please verify your email to access notifications', 'warning');
        return;
      }
      setNotificationPanelOpen(!notificationPanelOpen);
    } else {
      showNotification('Please log in to view notifications', 'warning');
      setLoginOpen(true);
    }
  };

  // ✅ FIXED: Safe inbox toggle with backend integration
  const safeToggleInboxPanel = () => {
    if (user) {
      if (!user.isVerified) {
        showNotification('Please verify your email to access messages', 'warning');
        return;
      }
      setInboxPanelOpen(!inboxPanelOpen);
    } else {
      showNotification('Please log in to view messages', 'warning');
      setLoginOpen(true);
    }
  };

  // ✅ FIXED: Handle profile dropdown with backend checks
  const handleProfileDropdownToggle = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access profile features', 'warning');
      return;
    }
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // ✅ FIXED: Handle profile panel with backend checks
  const handleProfilePanelOpen = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access profile features', 'warning');
      return;
    }
    setProfilePanelOpen(true);
    setProfileDropdownOpen(false);
  };

  // ✅ FIXED: Handle documents panel with backend checks
  const handleDocumentsPanelOpen = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access documents', 'warning');
      return;
    }
    setDocumentShareOpen(true);
    setProfileDropdownOpen(false);
  };

  // ✅ FIXED: Handle settings panel with backend checks
  const handleSettingsPanelOpen = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access settings', 'warning');
      return;
    }
    setSettingsPanelOpen(true);
    setProfileDropdownOpen(false);
  };

  // ✅ FIXED: Navigation items based on user type and verification
  const getNavigationItems = () => {
    if (!user || !user.isVerified) {
      // Basic navigation for unverified or logged out users
      return ['home', 'jobs', 'about'];
    }

    if (isCompanyUser) {
      // Company user navigation
      return ['home'];
    } else {
      // Job seeker navigation
      return ['home', 'jobs', 'bookmarks', 'comparison', 'about'];
    }
  };

  const navigationItems = getNavigationItems();

  // ✅ FIXED: Get icon for navigation item
  const getNavigationIcon = (page) => {
    const icons = {
      'home': <Home className="w-4 h-4 mr-1" />,
      'jobs': <Briefcase className="w-4 h-4 mr-1" />,
      'bookmarks': <BookmarkCheck className="w-4 h-4 mr-1" />,
      'comparison': <BarChart3 className="w-4 h-4 mr-1" />,
      'about': <Users className="w-4 h-4 mr-1" />,
    };
    return icons[page] || <Home className="w-4 h-4 mr-1" />;
  };

  // ✅ FIXED: Get display name for navigation item
  const getNavigationDisplayName = (page) => {
    const names = {
      'home': 'Home',
      'jobs': 'Jobs',
      'bookmarks': 'Bookmarks',
      'comparison': 'Compare',
      'about': 'About',
    };
    return names[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gray-900 z-50 transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress * 100}%` }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Logo */}
            <button 
              onClick={() => safeHandleNavigation('home')}
              className="flex items-center space-x-1 sm:space-x-2 text-xl sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
              <span className="hidden xs:inline">Mission Hub</span>
              <span className="xs:hidden">MH</span>
            </button>
          </div>

          {/* Desktop Navigation - Conditionally show based on user type */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            {navigationItems.map(page => (
              <button
                key={page}
                onClick={() => safeHandleNavigation(page)}
                className={`text-sm font-medium transition-colors duration-200 flex items-center ${
                  currentPage === page 
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getNavigationIcon(page)}
                {getNavigationDisplayName(page)}
              </button>
            ))}
            
            {/* Company Badge for verified company users */}
            {user?.isVerified && isCompanyUser && (
              <button
                onClick={() => safeHandleNavigation('company-dashboard')}
                className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
              >
                <Building className="w-4 h-4" />
                <span>Company Dashboard</span>
              </button>
            )}
          </nav>

          {/* User/Actions Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Post Job Button - Show for verified company users */}
            {user?.isVerified && isCompanyUser && (
              <button 
                onClick={handlePostJob}
                className="hidden xs:flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-full text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <FilePlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post Job</span>
              </button>
            )}
            
            {/* Post Job Button for non-company users (prompts registration) */}
            {!user && (
              <button 
                onClick={() => {
                  showNotification('Please register as a company to post jobs', 'info');
                  setRegisterOpen(true);
                }}
                className="hidden xs:flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-300 transition-colors shadow-sm whitespace-nowrap"
              >
                <FilePlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Post a Job</span>
                <span className="sm:hidden">Post Job</span>
              </button>
            )}
            
            {/* Action Buttons Container */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Notifications */}
              <button 
                onClick={safeToggleNotificationPanel}
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Notifications"
                aria-label="Notifications"
                disabled={user && !user.isVerified}
              >
                <Bell className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  user && !user.isVerified 
                    ? 'text-gray-300' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                {user && user.isVerified && unreadNotifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse border border-white"></span>
                )}
                {user && !user.isVerified && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></span>
                )}
              </button>
              
              {/* Inbox */}
              <button 
                onClick={safeToggleInboxPanel}
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Messages"
                aria-label="Messages"
                disabled={user && !user.isVerified}
              >
                <Inbox className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                  user && !user.isVerified 
                    ? 'text-gray-300' 
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                {user && user.isVerified && unreadMessages.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse border border-white"></span>
                )}
                {user && !user.isVerified && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></span>
                )}
              </button>
            </div>
            
            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleProfileDropdownToggle}
                  className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors group"
                  aria-label="User menu"
                  aria-expanded={profileDropdownOpen}
                  disabled={!user.isVerified}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm shadow-sm ${
                    user.isVerified 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}>
                    {getUserInitial()}
                    {!user.isVerified && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className={`text-sm font-medium group-hover:text-gray-900 ${
                      user.isVerified ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                      {getUserDisplayName()}
                      {!user.isVerified && ' (Unverified)'}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {getUserRoleDisplay()}
                    </span>
                  </div>
                  <ChevronDown className={`hidden sm:block w-4 h-4 transition-transform ${
                    user.isVerified ? 'text-gray-500' : 'text-gray-300'
                  } ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && user.isVerified && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompanyUser 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isCompanyUser ? 'Company Account' : 'Job Seeker'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfilePanelOpen}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 mr-3" />
                        My Profile
                      </button>
                      
                      <button
                        onClick={handleDocumentsPanelOpen}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-3" />
                        My Documents
                      </button>
                      
                      <button
                        onClick={handleSettingsPanelOpen}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      
                      {/* Company-specific options */}
                      {isCompanyUser && (
                        <button
                          onClick={() => {
                            setPostJobOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FilePlus className="w-4 h-4 mr-3" />
                          Post New Job
                        </button>
                      )}
                    </div>
                    
                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}

                {/* Unverified User Dropdown */}
                {profileDropdownOpen && !user.isVerified && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">Email verification required</p>
                      <div className="flex items-center mt-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified Account
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-600 mb-2">
                        Please check your email and verify your account to access all features.
                      </p>
                      <button
                        onClick={() => {
                          showNotification('Please check your email for the verification link', 'info');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-center px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Resend Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Auth Buttons for non-logged in users
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button 
                  onClick={() => setLoginOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  Login
                </button>
                <button 
                  onClick={() => setRegisterOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Navigation Links */}
            {navigationItems.map(page => (
              <button
                key={page}
                onClick={() => {
                  safeHandleNavigation(page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-gray-50 text-gray-900 border-l-4 border-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {getNavigationIcon(page)}
                {getNavigationDisplayName(page)}
              </button>
            ))}
            
            {/* Company Badge for mobile */}
            {user?.isVerified && isCompanyUser && (
              <div className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                <Building className="w-4 h-4 mr-2" />
                Company Dashboard
              </div>
            )}

           
           

            {/* Mobile User Actions for logged in users */}
            {user && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                {/* Verification Notice */}
                {!user.isVerified && (
                  <div className="px-4 py-3 mb-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Account Not Verified</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Please check your email to verify your account and access all features.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (user.isVerified) {
                      setProfilePanelOpen(true);
                      setMobileMenuOpen(false);
                    } else {
                      showNotification('Please verify your email to access profile features', 'warning');
                    }
                  }}
                  className={`w-full text-left flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    user.isVerified 
                      ? 'text-gray-600 hover:bg-gray-50' 
                      : 'text-gray-400'
                  }`}
                  disabled={!user.isVerified}
                >
                  <UserCircle className="w-5 h-5 mr-3" />
                  My Profile
                  {!user.isVerified && <span className="ml-2 text-xs text-yellow-600">(Verify Required)</span>}
                </button>

                

                <button
                  onClick={() => {
                    if (user.isVerified) {
                      setSettingsPanelOpen(true);
                      setMobileMenuOpen(false);
                    } else {
                      showNotification('Please verify your email to access settings', 'warning');
                    }
                  }}
                  className={`w-full text-left flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    user.isVerified 
                      ? 'text-gray-600 hover:bg-gray-50' 
                      : 'text-gray-400'
                  }`}
                  disabled={!user.isVerified}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                  {!user.isVerified && <span className="ml-2 text-xs text-yellow-600">(Verify Required)</span>}
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;