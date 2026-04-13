import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Download, CheckCircle, XCircle, Clock,
  Eye, Trash2, Plus, CreditCard, DollarSign, Users, Building2
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSubscriptions(data.subscriptions || data.data || []);
    } catch (error) {
      setSubscriptions([
        { _id: '1', user: { name: 'TechCorp', email: 'tech@corp.com' }, plan: 'Enterprise', price: 199, status: 'active', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 86400000).toISOString(), features: ['Unlimited Jobs', 'Priority Support', 'Analytics'] },
        { _id: '2', user: { name: 'HealthPlus', email: 'info@healthplus.com' }, plan: 'Premium', price: 99, status: 'active', startDate: new Date(Date.now() - 15 * 86400000).toISOString(), endDate: new Date(Date.now() + 15 * 86400000).toISOString(), features: ['10 Jobs', 'Email Support'] },
        { _id: '3', user: { name: 'StartupXYZ', email: 'hello@startupxyz.com' }, plan: 'Basic', price: 49, status: 'expired', startDate: new Date(Date.now() - 60 * 86400000).toISOString(), endDate: new Date(Date.now() - 30 * 86400000).toISOString(), features: ['5 Jobs', 'Basic Support'] },
        { _id: '4', user: { name: 'FinanceHub', email: 'admin@financehub.com' }, plan: 'Enterprise', price: 199, status: 'active', startDate: new Date(Date.now() - 45 * 86400000).toISOString(), endDate: new Date(Date.now() + 20 * 86400000).toISOString(), features: ['Unlimited Jobs', 'Priority Support', 'Analytics'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const handleExtendSubscription = async (subscriptionId) => {
    const days = prompt('Enter number of days to extend:');
    if (!days) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/subscriptions/${subscriptionId}/extend`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days: parseInt(days) })
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error extending subscription:', error);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.price || 0), 0);

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'Enterprise': return 'bg-purple-100 text-purple-700';
      case 'Premium': return 'bg-blue-100 text-blue-700';
      case 'Basic': return 'bg-green-100 text-green-700';
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
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions Management</h1>
          <p className="text-gray-500">Monthly Revenue: ${totalRevenue.toLocaleString()}</p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{subscriptions.length}</h3>
          <p className="text-gray-500 text-sm">Total Subscriptions</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{subscriptions.filter(s => s.status === 'active').length}</h3>
          <p className="text-gray-500 text-sm">Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{subscriptions.filter(s => s.status === 'expired').length}</h3>
          <p className="text-gray-500 text-sm">Expired</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">${totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm">Monthly Revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Premium">Premium</option>
              <option value="Basic">Basic</option>
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Start Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">End Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{sub.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{sub.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlanColor(sub.plan)}`}>
                      {sub.plan || 'Basic'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">${sub.price || 0}/mo</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(sub)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {sub.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleExtendSubscription(sub._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Extend"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelSubscription(sub._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No subscriptions found</p>
          </div>
        )}
      </div>

      {showModal && selectedSubscription && (
        <DetailModal
          title="Subscription Details"
          data={selectedSubscription}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;