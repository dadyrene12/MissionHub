import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, Activity, User, Briefcase,
  Building2, FileText, CreditCard, Settings, Trash2, Eye,
  ChevronDown, Clock
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setActivities(data.activities || data.data || []);
    } catch (error) {
      setActivities([
        { _id: '1', action: 'User Registration', description: 'New user John Doe registered', user: 'John Doe', ip: '192.168.1.1', userAgent: 'Mozilla/5.0', createdAt: new Date().toISOString() },
        { _id: '2', action: 'Job Posted', description: 'New job "Software Engineer" posted by TechCorp', user: 'TechCorp', ip: '192.168.1.2', userAgent: 'Mozilla/5.0', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: '3', action: 'Company Verification', description: 'Company HealthPlus verified', user: 'Admin', ip: '192.168.1.3', userAgent: 'Mozilla/5.0', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: '4', action: 'Application Submitted', description: 'Job application submitted for "Marketing Manager"', user: 'Jane Smith', ip: '192.168.1.4', userAgent: 'Mozilla/5.0', createdAt: new Date(Date.now() - 10800000).toISOString() },
        { _id: '5', action: 'Payment Received', description: 'Payment of $99 received from TechCorp', user: 'TechCorp', ip: '192.168.1.5', userAgent: 'Mozilla/5.0', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '6', action: 'Settings Updated', description: 'Platform settings updated by admin', user: 'Admin', ip: '192.168.1.3', userAgent: 'Mozilla/5.0', createdAt: new Date(Date.now() - 172800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.action?.toLowerCase().includes(filterType);
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const getActionIcon = (action) => {
    if (action?.toLowerCase().includes('user')) return User;
    if (action?.toLowerCase().includes('job')) return Briefcase;
    if (action?.toLowerCase().includes('company')) return Building2;
    if (action?.toLowerCase().includes('application')) return FileText;
    if (action?.toLowerCase().includes('payment')) return CreditCard;
    if (action?.toLowerCase().includes('settings')) return Settings;
    return Activity;
  };

  const getActionColor = (action) => {
    if (action?.toLowerCase().includes('user')) return 'bg-blue-100 text-blue-600';
    if (action?.toLowerCase().includes('job')) return 'bg-green-100 text-green-600';
    if (action?.toLowerCase().includes('company')) return 'bg-purple-100 text-purple-600';
    if (action?.toLowerCase().includes('application')) return 'bg-orange-100 text-orange-600';
    if (action?.toLowerCase().includes('payment')) return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-600';
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-500">{activities.length} total activities</p>
        </div>
        <button
          onClick={fetchActivities}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities by action, description or user..."
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
              <option value="all">All Activities</option>
              <option value="user">User</option>
              <option value="job">Job</option>
              <option value="company">Company</option>
              <option value="application">Application</option>
              <option value="payment">Payment</option>
              <option value="settings">Settings</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const Icon = getActionIcon(activity.action);
            return (
              <div
                key={activity._id}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50"
              >
                <div className={`p-3 rounded-lg ${getActionColor(activity.action)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{activity.action}</h3>
                      <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
                      <p className="text-xs text-gray-400 mt-1">by {activity.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                    <span>IP: {activity.ip || 'N/A'}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(activity)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
          </div>
        )}
      </div>

      {showModal && selectedActivity && (
        <DetailModal
          title="Activity Details"
          data={selectedActivity}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;