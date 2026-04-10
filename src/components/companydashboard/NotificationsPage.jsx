import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Users, MessageSquare, Mail, Megaphone, AlertCircle,
  Trash2, Check, CheckCheck, Clock, Settings, Loader2,
  Search, EyeIcon, Volume2, UserCheck, BriefcaseBusiness, 
  AlertTriangle, CheckCircle2, Inbox, FileWarning, RefreshCw, X,
  Filter, Calendar, CheckCircle, XCircle, Building2, Send
} from 'lucide-react';
import { apiFetch, LoadingSpinner, Badge } from './CompanyDashboardUtils';

const NOTIFICATION_TYPES = {
  application: { icon: Users, label: 'New Applicants', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', description: 'New applications for your jobs' },
  application_cancelled: { icon: UserCheck, label: 'Cancelled', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', description: 'User cancelled their application' },
  message: { icon: MessageSquare, label: 'Messages', color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200', description: 'New messages from users' },
  announcement: { icon: Megaphone, label: 'Announcements', color: 'bg-pink-500', bgColor: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'border-pink-200', description: 'Super admin announcements' },
  admin_notify: { icon: AlertCircle, label: 'Admin Notify', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200', description: 'Notifications from admin' },
  problem_report: { icon: FileWarning, label: 'Problem Reports', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200', description: 'Reported problems status' },
  job: { icon: BriefcaseBusiness, label: 'Jobs', color: 'bg-emerald-500', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', description: 'Job related notifications' },
  interview: { icon: Calendar, label: 'Interviews', color: 'bg-violet-500', bgColor: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'border-violet-200', description: 'Interview schedules and updates' },
  interview_scheduled: { icon: CheckCircle, label: 'Interview Scheduled', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', description: 'Interview has been scheduled' },
  interview_cancelled: { icon: XCircle, label: 'Interview Cancelled', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', description: 'Interview has been cancelled' },
  interview_reminder: { icon: Clock, label: 'Interview Reminder', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', description: 'Interview reminder notifications' },
  job_posted: { icon: Building2, label: 'Job Posted', color: 'bg-teal-500', bgColor: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'border-teal-200', description: 'Job posted successfully' },
  job_application: { icon: Send, label: 'Job Application', color: 'bg-cyan-500', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', description: 'Job application received' },
  verified: { icon: CheckCircle2, label: 'Verified', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', description: 'Account verification status' },
  system: { icon: AlertCircle, label: 'System', color: 'bg-slate-500', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200', description: 'System notifications' },
};

const NOTIFICATION_TYPES_DB = [
  { type: 'application', label: 'New Applicants', color: 'bg-blue-500' },
  { type: 'application_update', label: 'Application Update', color: 'bg-blue-500' },
  { type: 'application_cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { type: 'message', label: 'Messages', color: 'bg-purple-500' },
  { type: 'announcement', label: 'Announcements', color: 'bg-pink-500' },
  { type: 'admin_notify', label: 'Admin Notify', color: 'bg-orange-500' },
  { type: 'problem_report', label: 'Problem Reports', color: 'bg-yellow-500' },
  { type: 'interview', label: 'Interviews', color: 'bg-violet-500' },
  { type: 'interview_scheduled', label: 'Interview Scheduled', color: 'bg-green-500' },
  { type: 'interview_reminder', label: 'Interview Reminder', color: 'bg-amber-500' },
  { type: 'interview_cancelled', label: 'Interview Cancelled', color: 'bg-red-500' },
  { type: 'interview_completed', label: 'Interview Completed', color: 'bg-green-500' },
  { type: 'payment', label: 'Payments', color: 'bg-emerald-500' },
  { type: 'system', label: 'System', color: 'bg-slate-500' },
  { type: 'job', label: 'Jobs', color: 'bg-emerald-500' },
  { type: 'job_posted', label: 'Job Posted', color: 'bg-teal-500' },
  { type: 'job_application', label: 'Job Application', color: 'bg-cyan-500' },
  { type: 'verified', label: 'Verified', color: 'bg-green-500' },
  { type: 'user', label: 'User', color: 'bg-blue-500' },
  { type: 'company', label: 'Company', color: 'bg-indigo-500' }
];

const getNotificationIcon = (type, priority) => {
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.system;
  const Icon = config.icon;
  return (
    <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  );
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

export const NotificationsPage = ({ token, user, showToast, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, byType: [] });
  const [dbNotificationTypes, setDbNotificationTypes] = useState(null);
  const [preferences, setPreferences] = useState({
    application: true,
    application_cancelled: true,
    message: true,
    announcement: true,
    admin_notify: true,
    problem_report: true,
    job: true,
    interview: true,
    interview_scheduled: true,
    interview_cancelled: true,
    interview_reminder: true,
    job_posted: true,
    job_application: true,
    verified: true,
    system: true,
    emailNotifications: true,
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => { 
    fetchNotificationTypes();
    fetchNotifications(); 
    fetchStats();
  }, []);

  const fetchNotificationTypes = async () => {
    try {
      const res = await apiFetch('/notifications/types');
      if (res.ok && res.data?.success) {
        setDbNotificationTypes(res.data.types);
        localStorage.setItem('notificationTypes', JSON.stringify(res.data.types));
      }
    } catch (err) {
      console.error('Error fetching notification types:', err);
    }
  };

  const getNotificationTypeConfig = (type) => {
    if (dbNotificationTypes) {
      const found = dbNotificationTypes.find(t => t.type === type);
      if (found) return found;
    }
    return NOTIFICATION_TYPES_DB.find(t => t.type === type) || { type, label: type, color: 'bg-slate-500' };
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/notifications');
      if (res.ok && res.data) {
        const data = res.data.notifications || res.data.data || [];
        const types = getFilterTypes();
        const typeSet = new Set(types.map(t => t.type));
        const filtered = data.filter(n => typeSet.has(n.type));
        setNotifications(filtered);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch('/notifications/stats');
      if (res.ok && res.data?.success) {
        const statsData = res.data.stats || { total: 0, unread: 0, read: 0, byType: [] };
        const allTypes = new Set(getFilterTypes().map(t => t.type));
        statsData.byType = statsData.byType?.filter(t => allTypes.has(t._id)) || [];
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getFilterCounts = () => {
    const counts = { all: notifications.length };
    const types = getFilterTypes();
    notifications.forEach(n => {
      if (n.type) {
        counts[n.type] = (counts[n.type] || 0) + 1;
      }
    });
    return counts;
  };

  const savePreferences = (newPrefs) => {
    localStorage.setItem('notificationPreferences', JSON.stringify(newPrefs));
    setPreferences(newPrefs);
    showToast('Notification preferences saved!', 'success');
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const markAsRead = async (id) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    fetchStats();
    if (selectedNotification?._id === id) {
      setSelectedNotification({ ...selectedNotification, read: true });
    }
  };

  const markAllAsRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    fetchStats();
    showToast('All notifications marked as read', 'success');
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const deleteNotification = async (id) => {
    await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    setNotifications(notifications.filter(n => n._id !== id));
    fetchStats();
    showToast('Notification deleted', 'success');
    if (selectedNotification?._id === id) {
      setShowDetailModal(false);
      setSelectedNotification(null);
    }
  };

  const deleteSelected = async () => {
    for (const id of selectedNotifications) {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    }
    setNotifications(notifications.filter(n => !selectedNotifications.includes(n._id)));
    fetchStats();
    showToast(`${selectedNotifications.length} notifications deleted`, 'success');
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const markSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    }
    setNotifications(notifications.map(n => 
      selectedNotifications.includes(n._id) ? { ...n, read: true } : n
    ));
    fetchStats();
    showToast(`${selectedNotifications.length} notifications marked as read`, 'success');
    setSelectedNotifications([]);
    setShowBulkActions(false);
  };

  const toggleSelect = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setShowBulkActions(true);
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
      setShowBulkActions(false);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
      setShowBulkActions(true);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const getTimeUntil = (date) => {
    const now = new Date();
    const future = new Date(date);
    const diffMs = future - now;
    if (diffMs < 0) return 'Passed';
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `In ${diffMins}m`;
    if (diffHours < 24) return `In ${diffHours}h`;
    return `In ${diffDays}d`;
  };

  const getNotificationConfig = (type) => {
    if (NOTIFICATION_TYPES[type]) {
      return NOTIFICATION_TYPES[type];
    }
    if (dbNotificationTypes) {
      const dbType = dbNotificationTypes.find(t => t.type === type);
      if (dbType) {
        return {
          icon: Bell,
          label: dbType.label,
          color: 'bg-slate-500',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          description: dbType.description
        };
      }
    }
    return NOTIFICATION_TYPES.system;
  };

  const getFilterTypes = () => {
    if (dbNotificationTypes) {
      return dbNotificationTypes;
    }
    return NOTIFICATION_TYPES_DB;
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || n.type === filter;
    const matchesSearch = !searchQuery || 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = stats.unread || notifications.filter(n => !n.read).length;
  const hasSelected = selectedNotifications.length > 0;

  const typeCounts = stats.byType?.reduce((acc, t) => {
    acc[t._id] = t.count;
    return acc;
  }, {}) || notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  const typeUnreadCounts = stats.byType?.reduce((acc, t) => {
    if (t.unread > 0) {
      acc[t._id] = t.unread;
    }
    return acc;
  }, {}) || notifications.reduce((acc, n) => {
    if (!n.read) {
      acc[n.type] = (acc[n.type] || 0) + 1;
    }
    return acc;
  }, {});

  const openNotificationDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  const handleNotificationAction = (notification, action) => {
    switch (action) {
      case 'view':
        if (notification.relatedType === 'application' && onNavigate) {
          setShowDetailModal(false);
          onNavigate('applicants');
        }
        break;
      case 'viewJob':
        if (onNavigate) {
          setShowDetailModal(false);
          onNavigate('jobs');
        }
        break;
      case 'viewMessage':
        if (onNavigate) {
          setShowDetailModal(false);
          onNavigate('messages');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: 'Total', value: stats.total || notifications.length, icon: Inbox, color: 'slate' },
          { label: 'Read', value: stats.read || (notifications.length - unreadCount), icon: CheckCircle2, color: 'green' },
          { label: 'Unread', value: stats.unread || unreadCount, icon: AlertCircle, color: 'orange' },
          { label: 'Applicants', value: stats.byType?.find(t => t._id === 'application')?.count || 0, icon: Users, color: 'blue' },
          { label: 'Jobs', value: stats.byType?.find(t => t._id === 'job')?.count || (notifications.filter(n => n.type === 'job' || n.type === 'job_posted').length), icon: BriefcaseBusiness, color: 'emerald' },
          { label: 'Interviews', value: stats.byType?.find(t => t._id === 'interview')?.count || (notifications.filter(n => n.type?.includes('interview')).length), icon: Calendar, color: 'violet' }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 hover:border-slate-950 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-950 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950">Notifications</h1>
              <p className="text-slate-500 text-sm">Stay updated with your account</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-slate-400" />
              Notification Preferences
            </h3>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                    <config.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-slate-300 text-sm block font-medium">{config.label}</span>
                    <span className="text-xs text-slate-500">{config.description}</span>
                  </div>
                </div>
                <button
                  onClick={() => savePreferences({ ...preferences, [key]: !preferences[key] })}
                  className={`w-12 h-6 rounded-full transition-all ${preferences[key] ? 'bg-slate-700' : 'bg-slate-800'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-slate-300 text-sm block font-medium">Email Notifications</span>
                  <span className="text-xs text-slate-500">Receive updates via email</span>
                </div>
              </div>
              <button
                onClick={() => savePreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                className={`w-12 h-6 rounded-full transition-all ${preferences.emailNotifications ? 'bg-slate-700' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <button 
            onClick={fetchNotifications} 
            className="px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap overflow-x-auto pb-2 mb-4 sm:mb-6">
        {(() => {
          const filterCounts = getFilterCounts();
          return (
            <>
              <button 
                onClick={() => setFilter('all')} 
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                  filter === 'all' 
                    ? 'bg-slate-950 text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-950 hover:text-slate-950'
                }`}
              >
                <Bell className="w-4 h-4" />
                All
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {filterCounts.all}
                </span>
              </button>
              
              {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => {
                const count = filterCounts[key] || 0;
                const unread = typeUnreadCounts[key] || 0;
                
                return (
                  <button 
                    key={key}
                    onClick={() => setFilter(key)} 
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      filter === key 
                        ? `${config.color} text-white` 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-950 hover:text-slate-950'
                    }`}
                  >
                    <config.icon className="w-4 h-4" />
                    {config.label}
                    {unread > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${filter === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          );
        })()}
      </div>

      {hasSelected && (
        <div className="flex gap-2 p-4 bg-slate-100 rounded-2xl items-center border border-slate-200 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-950 rounded-full"></div>
            <span className="text-sm font-semibold text-slate-950">{selectedNotifications.length} selected</span>
          </div>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button 
              onClick={markSelectedAsRead} 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all text-sm"
            >
              <Check className="w-4 h-4" /> Mark as Read
            </button>
            <button 
              onClick={deleteSelected} 
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button 
              onClick={selectAll} 
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all text-sm"
            >
              {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              onClick={() => { setSelectedNotifications([]); setShowBulkActions(false); }} 
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Loader2 className="w-6 h-6 text-slate-950 animate-spin" />
            </div>
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-950 mb-2">
            {searchQuery ? 'No results found' : 'All caught up!'}
          </h3>
          <p className="text-slate-500 text-sm">
            {searchQuery ? 'Try a different search term' : "You don't have any notifications yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification, idx) => {
            const config = getNotificationConfig(notification.type);
            const Icon = config.icon;
            const isSelected = selectedNotifications.includes(notification._id);
            const timeAgo = getTimeAgo(notification.createdAt);
            
            return (
              <div 
                key={notification._id} 
                className={`bg-white border rounded-2xl transition-all duration-300 hover:border-slate-950 overflow-hidden ${
                  !notification.read 
                    ? `${config.borderColor} ${config.bgColor}` 
                    : 'border-slate-200 hover:border-slate-950'
                } ${isSelected ? 'border-slate-950 bg-slate-50' : ''}`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button 
                      onClick={() => toggleSelect(notification._id)} 
                      className={`p-1.5 rounded-lg transition-all mt-1 flex-shrink-0 ${
                        isSelected 
                          ? 'bg-slate-200 text-slate-950' 
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 
                        <Check className="w-4 h-4" /> : 
                        <div className="w-4 h-4 border-2 border-slate-400 rounded" />
                      }
                    </button>

                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${config.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-slate-950 text-sm sm:text-base">
                              {notification.title || config.label}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-slate-950 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{notification.message}</p>
                          
                          {notification.applicationDetails && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {notification.applicationDetails.jobTitle && (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200">
                                  <BriefcaseBusiness className="w-3 h-3" />
                                  {notification.applicationDetails.jobTitle}
                                </span>
                              )}
                              {notification.applicationDetails.applicantName && (
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-xs flex items-center gap-1.5 border border-blue-200">
                                  <Users className="w-3 h-3" />
                                  {notification.applicationDetails.applicantName}
                                </span>
                              )}
                              {notification.applicationDetails.status && (
                                <span className={`px-3 py-1.5 rounded-xl text-xs ${
                                  notification.applicationDetails.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                  notification.applicationDetails.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                  notification.applicationDetails.status === 'cancelled' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  {notification.applicationDetails.status}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400">{timeAgo}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openNotificationDetail(notification)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 rounded-xl transition-all"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-950">Notification Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
                  <div>
                    <h3 className="font-semibold text-slate-950">{selectedNotification.title}</h3>
                    <p className="text-slate-500 text-sm">{formatTimeAgo(selectedNotification.createdAt)}</p>
                  </div>
                </div>

                {selectedNotification.message && (
                  <div>
                    <span className="text-slate-500 text-sm block mb-1">Message</span>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-xl">{selectedNotification.message}</p>
                  </div>
                )}

                {selectedNotification.type === 'application' && selectedNotification.applicationDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Application Details</h4>
                    <div className="space-y-2">
                      {selectedNotification.applicationDetails.applicantName && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Applicant</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.applicationDetails.applicantName}</span>
                        </div>
                      )}
                      {selectedNotification.applicationDetails.jobTitle && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Job</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.applicationDetails.jobTitle}</span>
                        </div>
                      )}
                      {selectedNotification.applicationDetails.status && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedNotification.applicationDetails.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                            selectedNotification.applicationDetails.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 
                            selectedNotification.applicationDetails.status === 'cancelled' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {selectedNotification.applicationDetails.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedNotification.jobDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Job Details</h4>
                    <div className="space-y-2">
                      {selectedNotification.jobDetails.title && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Job Title</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.jobDetails.title}</span>
                        </div>
                      )}
                      {selectedNotification.jobDetails.company && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Company</span>
                          <span className="text-emerald-600 text-sm">{selectedNotification.jobDetails.company}</span>
                        </div>
                      )}
                      {selectedNotification.jobDetails.status && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Status</span>
                          <Badge 
                            color={
                              selectedNotification.jobDetails.status === 'active' ? 'green' : 
                              selectedNotification.jobDetails.status === 'closed' ? 'red' : 
                              selectedNotification.jobDetails.status === 'interview_scheduled' ? 'violet' :
                              selectedNotification.jobDetails.status === 'scheduled' ? 'blue' :
                              selectedNotification.jobDetails.status === 'completed' ? 'green' :
                              'gray'
                            }
                          >
                            {selectedNotification.jobDetails.status}
                          </Badge>
                        </div>
                      )}
                      {selectedNotification.jobDetails.salary && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Salary</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.jobDetails.salary}</span>
                        </div>
                      )}
                      {selectedNotification.jobDetails.location && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Location</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.jobDetails.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedNotification.problemDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Problem Report Details</h4>
                    <div className="space-y-2">
                      {selectedNotification.problemDetails.category && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Category</span>
                          <span className="text-orange-600 text-sm">{selectedNotification.problemDetails.category}</span>
                        </div>
                      )}
                      {selectedNotification.problemDetails.description && (
                        <div>
                          <span className="text-slate-500 text-sm block mb-1">Description</span>
                          <p className="text-slate-700 text-sm bg-white p-2 rounded-lg border border-slate-200">
                            {selectedNotification.problemDetails.description}
                          </p>
                        </div>
                      )}
                      {selectedNotification.problemDetails.status && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Status</span>
                          <Badge 
                            color={
                              selectedNotification.problemDetails.status === 'resolved' ? 'green' : 
                              selectedNotification.problemDetails.status === 'in_progress' ? 'blue' : 'orange'
                            }
                          >
                            {selectedNotification.problemDetails.status}
                          </Badge>
                        </div>
                      )}
                      {selectedNotification.problemDetails.adminResponse && (
                        <div>
                          <span className="text-slate-500 text-sm block mb-1">Admin Response</span>
                          <p className="text-slate-700 text-sm bg-white p-2 rounded-lg border border-slate-200">
                            {selectedNotification.problemDetails.adminResponse}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedNotification.announcementDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Announcement Details</h4>
                    <div className="space-y-2">
                      {selectedNotification.announcementDetails.priority && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Priority</span>
                          <Badge color={selectedNotification.announcementDetails.priority === 'high' ? 'red' : 'gray'}>
                            {selectedNotification.announcementDetails.priority}
                          </Badge>
                        </div>
                      )}
                      {selectedNotification.announcementDetails.postedBy && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">Posted By</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.announcementDetails.postedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedNotification.messageDetails && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Message Details</h4>
                    <div className="space-y-2">
                      {selectedNotification.messageDetails.sender && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-sm">From</span>
                          <span className="text-slate-950 text-sm">{selectedNotification.messageDetails.sender}</span>
                        </div>
                      )}
                      {selectedNotification.messageDetails.preview && (
                        <div>
                          <span className="text-slate-500 text-sm block mb-1">Preview</span>
                          <p className="text-slate-700 text-sm bg-white p-2 rounded-lg border border-slate-200">
                            {selectedNotification.messageDetails.preview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 flex-wrap pt-4 border-t border-slate-200">
                  {selectedNotification.type === 'application' && onNavigate && (
                    <button 
                      onClick={() => {
                        setShowDetailModal(false);
                        onNavigate('applicants');
                      }}
                      className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Users className="w-4 h-4" />
                      View Applicants
                    </button>
                  )}
                  {(selectedNotification.type === 'job' || selectedNotification.type === 'job_posted') && onNavigate && (
                    <button 
                      onClick={() => {
                        setShowDetailModal(false);
                        onNavigate('jobs');
                      }}
                      className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <BriefcaseBusiness className="w-4 h-4" />
                      View Jobs
                    </button>
                  )}
                  {(selectedNotification.type === 'interview' || selectedNotification.type === 'interview_scheduled' || selectedNotification.type === 'interview_cancelled' || selectedNotification.type === 'interview_reminder') && onNavigate && (
                    <button 
                      onClick={() => {
                        setShowDetailModal(false);
                        onNavigate('interviews');
                      }}
                      className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      View Interviews
                    </button>
                  )}
                  {selectedNotification.type === 'message' && onNavigate && (
                    <button 
                      onClick={() => {
                        setShowDetailModal(false);
                        onNavigate('messages');
                      }}
                      className="flex-1 py-2.5 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      View Messages
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(selectedNotification._id)}
                    className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-all border border-red-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
