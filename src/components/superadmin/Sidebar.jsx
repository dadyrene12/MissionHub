import React from 'react';
import {
  LayoutDashboard, Users, Briefcase, Building2, FileText,
  BarChart3, Bell, CreditCard, Settings, HelpCircle, ChevronRight,
  Activity, Mail, GraduationCap, Tag, MessageSquare, Megaphone,
  Shield, Eye, CheckCircle, XCircle, Clock, PieChart
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CheckCircle },
  { id: 'exams', label: 'Exams', icon: GraduationCap },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'advertising', label: 'Advertising', icon: Megaphone },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SuperAdminSidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="w-64 bg-gray-900 h-screen overflow-y-auto fixed left-0 top-0 pt-4">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-white">MissionHub</h1>
        <p className="text-xs text-gray-400">Super Admin</p>
      </div>

      <nav className="space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Super Admin</p>
            <p className="text-xs text-gray-400 truncate">admin@missionhub.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
