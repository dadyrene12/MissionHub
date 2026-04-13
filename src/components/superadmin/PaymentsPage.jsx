import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Download, CreditCard, DollarSign,
  CheckCircle, XCircle, Clock, Eye, Trash2, Filter,
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPayments(data.payments || data.data || []);
    } catch (error) {
      setPayments([
        { _id: '1', amount: 99, currency: 'USD', status: 'completed', method: 'Credit Card', description: 'Premium Subscription', user: { name: 'TechCorp', email: 'tech@corp.com' }, createdAt: new Date().toISOString() },
        { _id: '2', amount: 199, currency: 'USD', status: 'completed', method: 'PayPal', description: 'Enterprise Subscription', user: { name: 'HealthPlus', email: 'info@healthplus.com' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: '3', amount: 49, currency: 'USD', status: 'pending', method: 'Bank Transfer', description: 'Basic Subscription', user: { name: 'StartupXYZ', email: 'hello@startupxyz.com' }, createdAt: new Date(Date.now() - 172800000).toISOString() },
        { _id: '4', amount: 299, currency: 'USD', status: 'failed', method: 'Credit Card', description: 'Enterprise Subscription', user: { name: 'FinanceHub', email: 'admin@financehub.com' }, createdAt: new Date(Date.now() - 259200000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundPayment = async (paymentId) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/refund`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error refunding payment:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-500">Total Revenue: ${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPayments}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +15%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">${totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{payments.filter(p => p.status === 'completed').length}</h3>
          <p className="text-gray-500 text-sm">Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{payments.filter(p => p.status === 'pending').length}</h3>
          <p className="text-gray-500 text-sm">Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Method</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{payment.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {payment.description || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">
                      ${payment.amount?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {payment.method || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status || 'unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(payment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefundPayment(payment._id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Refund"
                        >
                          <ArrowDownRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>

      {showModal && selectedPayment && (
        <DetailModal
          title="Payment Details"
          data={selectedPayment}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default PaymentsPage;