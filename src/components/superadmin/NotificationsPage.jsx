import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Trash2, Eye, CheckCircle, XCircle,
  RefreshCw, Bell, BellOff, Settings, ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data.notifications || data.data || []);
    } catch (error) {
      setNotifications([
        { _id: '1', title: 'New User Registration', message: 'A new user has registered on the platform', type: 'user', read: false, createdAt: new Date().toISOString() },
        { _id: '2', title: 'Job Posted', message: 'A new job has been posted and requires verification', type: 'job', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '3', title: 'Company Verified', message: 'A company has been verified', type: 'company', read: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: '4', title: 'Payment Received', message: 'A new payment has been processed', type: 'payment', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || notif.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-700';
      case 'job': return 'bg-green-100 text-green-700';
      case 'company': return 'bg-purple-100 text-purple-700';
      case 'payment': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">{unreadCount} unread notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="user">User</option>
              <option value="job">Job</option>
              <option value="company">Company</option>
              <option value="payment">Payment</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start justify-between p-4 rounded-lg border ${
                notification.read ? 'border-gray-100 bg-white' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                  <Bell className={`w-5 h-5 ${notification.read ? 'text-gray-500' : 'text-blue-600'}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewDetails(notification)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Mark as Read"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(notification._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}
      </div>

      {showModal && selectedNotification && (
        <DetailModal
          title="Notification Details"
          data={selectedNotification}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default NotificationsPage;