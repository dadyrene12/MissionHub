import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Trash2, Eye, CheckCircle, XCircle,
  RefreshCw, Download, FileText, User, Briefcase, Clock
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setApplications(data.applications || data.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
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
        <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
        <button
          onClick={fetchApplications}
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
                placeholder="Search applications by applicant or job..."
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
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Applicant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Job Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Applied</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.applicant?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{app.job?.title || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {app.job?.company?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'accepted')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Accept"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteApplication(app._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications found</p>
          </div>
        )}
      </div>

      {showModal && selectedApplication && (
        <DetailModal
          title="Application Details"
          data={selectedApplication}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;