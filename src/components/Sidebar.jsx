import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, Users, FileText, BarChart3, Settings,
  Bell, MessageSquare, LogOut, Menu, X, ChevronLeft, ChevronRight,
  User, Building2, Shield, Home, ChevronDown, Search, Moon, Sun,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ user, currentPage, onNavigate, onLogout, darkMode, onToggleDarkMode, onBackToHome }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getMenuItems = () => {
    if (!user) return [];

    const commonItems = [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    ];

    if (user.userType === 'super_admin' || user.role === 'super_admin' || user.role === 'admin') {
      return [
        ...commonItems,
        { id: 'users', label: 'Users', icon: Users },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'exam', label: 'Exam', icon: ClipboardList },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (user.userType === 'company') {
      return [
        ...commonItems,
        { id: 'jobs', label: 'My Jobs', icon: Briefcase },
        { id: 'applications', label: 'Applicants', icon: FileText },
        { id: 'exam', label: 'Exam', icon: ClipboardList },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    return [
      ...commonItems,
      { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
      { id: 'applications', label: 'My Applications', icon: FileText },
      { id: 'exam', label: 'Exam', icon: ClipboardList },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-900' : 'bg-gray-900'} text-white`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">MissionHub</h1>
                <p className="text-xs text-gray-400 capitalize">{user?.userType || 'Dashboard'}</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-700">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center px-4 py-2 mb-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          {darkMode ? (
            <>
              <Sun className="w-5 h-5 mr-3" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 mr-3" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* User Info */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center mt-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className={`w-full flex items-center mt-2 px-4 py-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Home className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && <span>Back to Home</span>}
          </button>
        )}
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute top-20 -right-3 w-6 h-6 bg-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header */}
        <header className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center lg:hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 font-bold text-gray-900">MissionHub</span>
            </div>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`min-h-[calc(100vh-64px)] ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Content will be rendered by parent component */}
        </main>
      </div>
    </>
  );
};

export default Sidebar;
