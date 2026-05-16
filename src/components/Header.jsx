import React from 'react';
import {
  Home, BookmarkCheck, BarChart3, Users, Menu, Bell, Inbox,
  FilePlus, UserCircle, FileText, Settings, LogOut, X,
  ChevronDown, Building, Briefcase, Mail, MessageSquare,
  RefreshCw,
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
  onRefresh,
}) => {
  const isCompanyUser = user?.userType === 'company';
  
  const handlePostJob = () => {
    if (!user) {
      showNotification('Please log in to post a job', 'warning');
      setLoginOpen(true);
      return;
    }
    if (!user.isVerified) {
      showNotification('Please verify your email before posting jobs', 'warning');
      return;
    }
    if (user.userType !== 'company') {
      showNotification('Only company accounts can post jobs', 'warning');
      return;
    }
    setPostJobOpen(true);
  };

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => n && !n.read) : [];
  const unreadMessages = Array.isArray(messages) ? messages.filter(m => m && !m.read) : [];

  const getUserInitial = () => {
    if (!user) return 'U';
    if (user.name && typeof user.name === 'string') return user.name.charAt(0).toUpperCase();
    if (user.email && typeof user.email === 'string') return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserProfilePicture = () => {
    if (!user) return null;
    return user.profilePhoto || user.profilePicture || user.avatar || null;
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    if (user.name && typeof user.name === 'string') return user.name;
    if (user.email && typeof user.email === 'string') return user.email.split('@')[0];
    return 'User';
  };

  const getUserRoleDisplay = () => {
    if (!user) return 'guest';
    if (user.userType === 'company') return 'company';
    if (user.userType === 'jobSeeker') return 'job seeker';
    return 'user';
  };

  const safeHandleNavigation = (page) => {
    try {
      handleNavigation(page);
    } catch (error) {
      showNotification('Navigation error occurred', 'error');
    }
  };

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

  const handleProfileDropdownToggle = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access profile features', 'warning');
      return;
    }
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleProfilePanelOpen = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access profile features', 'warning');
      return;
    }
    setProfilePanelOpen(true);
    setProfileDropdownOpen(false);
  };

  const handleDocumentsPanelOpen = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access documents', 'warning');
      return;
    }
    setDocumentShareOpen(true);
    setProfileDropdownOpen(false);
  };

  const handleSettingsPanelOpen = () => {
    if (user && !user.isVerified) {
      showNotification('Please verify your email to access settings', 'warning');
      return;
    }
    setSettingsPanelOpen(true);
    setProfileDropdownOpen(false);
  };

  const getNavigationItems = () => {
    if (!user || !user.isVerified) {
      return ['home', 'jobs', 'about'];
    }
    if (isCompanyUser) {
      return ['home', 'postJob'];
    } else {
      return ['home', 'jobs', 'bookmarks', 'about'];
    }
  };

  const navigationItems = getNavigationItems();

  const getNavigationDisplayName = (page) => {
    const names = {
      'home': 'Home',
      'jobs': 'Jobs',
      'bookmarks': 'Bookmarks',
      'postJob': 'Post Job',
      'about': 'About',
    };
    return names[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-slate-200">
      <div 
        className="fixed top-0 left-0 h-1 bg-slate-600 z-50 transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress * 100}%` }}
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>

            <button 
              onClick={() => safeHandleNavigation('home')}
              className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-slate-900 hover:text-slate-600 transition-colors"
            >
              <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />
              <span>MissionHub</span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map(page => (
              <button
                key={page}
                onClick={() => {
                  if (page === 'postJob') {
                    handlePostJob();
                  } else if (page === 'profile') {
                    handleProfilePanelOpen();
                  } else {
                    safeHandleNavigation(page);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === page 
                    ? 'bg-slate-600 text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getNavigationDisplayName(page)}
              </button>
            ))}
            
            {user?.isVerified && isCompanyUser && (
              <button
                onClick={() => safeHandleNavigation('company-dashboard')}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-all"
              >
                <Building className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {user?.isVerified && isCompanyUser && (
              <button 
                onClick={handlePostJob}
                className="hidden xs:flex items-center px-4 py-2 bg-slate-600 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-slate-700 transition-all"
              >
                <FilePlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post Job</span>
              </button>
            )}
            
            {!user && (
              <button 
                onClick={() => {
                  showNotification('Please register as a company to post jobs', 'info');
                  setRegisterOpen(true);
                }}
                className="hidden xs:flex items-center px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm font-medium hover:bg-slate-300 transition-all"
              >
                <FilePlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Post a Job</span>
                <span className="sm:hidden">Post Job</span>
              </button>
            )}
            
            <div className="flex items-center border border-slate-200 rounded-full p-1">
              {onRefresh && user && (
                <button 
                  onClick={onRefresh}
                  className="p-2 rounded-full hover:bg-slate-100 transition-all"
                  title="Refresh data"
                  aria-label="Refresh"
                >
                  <RefreshCw className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <button 
                onClick={safeToggleNotificationPanel}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-all"
                title="Notifications"
                aria-label="Notifications"
                disabled={user && !user.isVerified}
              >
                <Bell className={`w-5 h-5 transition-colors ${
                  user && !user.isVerified 
                    ? 'text-slate-300' 
                    : 'text-slate-600'
                }`} />
                {user && user.isVerified && unreadNotifications.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </button>
              
              <button 
                onClick={safeToggleInboxPanel}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-all"
                title="Messages"
                aria-label="Messages"
                disabled={user && !user.isVerified}
              >
                <Inbox className={`w-5 h-5 transition-colors ${
                  user && !user.isVerified 
                    ? 'text-slate-300' 
                    : 'text-slate-600'
                }`} />
                {user && user.isVerified && unreadMessages.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                )}
              </button>

              {user && user.isVerified && (
                <button 
                  onClick={handleProfilePanelOpen}
                  className="relative p-2 rounded-full hover:bg-slate-100 transition-all"
                  title="Profile"
                  aria-label="Profile"
                >
                  <UserCircle className="w-5 h-5 text-slate-600" />
                </button>
              )}
            </div>
            
            {user ? (
              <div className="relative">
                <button
                  onClick={handleProfileDropdownToggle}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="User menu"
                  aria-expanded={profileDropdownOpen}
                  disabled={!user.isVerified}
                >
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                      user.isVerified 
                        ? 'bg-gradient-to-br from-slate-500 to-purple-600 text-white' 
                        : 'bg-slate-600 text-white'
                    }`}>
                      {getUserInitial()}
                    </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className={`text-sm font-medium ${
                      user.isVerified ? 'text-white' : 'text-slate-400'
                    }`}>
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {getUserRoleDisplay()}
                    </span>
                  </div>
                  <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform ${
                    profileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {profileDropdownOpen && user.isVerified && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-slate-100 overflow-hidden">
                    <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-50 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || 'No email'}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isCompanyUser 
                            ? 'bg-slate-100 text-slate-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {isCompanyUser ? 'Company' : 'Job Seeker'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Verified
                        </span>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={handleProfilePanelOpen}
                        className="w-full text-left flex items-center px-5 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 mr-3 text-slate-600" />
                        My Profile
                      </button>
                      
                     
                      
                      <button
                        onClick={handleSettingsPanelOpen}
                        className="w-full text-left flex items-center px-5 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3 text-slate-600" />
                        Settings
                      </button>
                      
                      {isCompanyUser && (
                        <button
                          onClick={() => {
                            setPostJobOpen(true);
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center px-5 py-2.5 text-sm text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50 transition-colors"
                        >
                          <FilePlus className="w-4 h-4 mr-3 text-green-600" />
                          Post New Job
                        </button>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setLoginOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  Login
                </button>
                <button 
                  onClick={() => setRegisterOpen(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navigationItems.map(page => (
              <button
                key={page}
                onClick={() => {
                  if (page === 'postJob') {
                    handlePostJob();
                  } else if (page === 'profile') {
                    handleProfilePanelOpen();
                  } else {
                    safeHandleNavigation(page);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-slate-600 text-white' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {getNavigationDisplayName(page)}
              </button>
            ))}
            
            {user?.isVerified && isCompanyUser && (
              <button
                onClick={() => {
                  safeHandleNavigation('company-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center px-4 py-3 rounded-xl text-base font-medium text-green-700 hover:bg-green-50"
              >
                <Building className="w-5 h-5 mr-3" />
                Dashboard
              </button>
            )}

            {user ? (
              <div className="border-t border-slate-200 pt-3 mt-3">
                <button
                  onClick={() => {
                    handleProfilePanelOpen();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  <UserCircle className="w-5 h-5 mr-3" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-200 pt-3 mt-3 space-y-2">
                <button 
                  onClick={() => {
                    setLoginOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    setRegisterOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-4 py-3 rounded-xl text-base font-medium bg-slate-900 text-white hover:bg-slate-800"
                >
                  Register
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