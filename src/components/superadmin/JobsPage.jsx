import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreVertical, Trash2, Eye, CheckCircle,
  XCircle, RefreshCw, Download, AlertTriangle, Clock, Briefcase,
  MapPin, DollarSign, Users
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showActions, setShowActions] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setJobs(data.jobs || data.data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/jobs/${jobId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error('Error verifying job:', error);
    }
  };

  const handleRejectJob = async (jobId) => {
    if (!confirm('Are you sure you want to reject this job?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/jobs/${jobId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
        <button
          onClick={fetchJobs}
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
                placeholder="Search jobs by title or company..."
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
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Job Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Applications</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Posted</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.category}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{job.company?.name || 'Unknown'}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {job.location || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {job.jobType || 'Full-time'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {job.applicationsCount || 0}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(job)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerifyJob(job._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Verify Job"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectJob(job._id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Reject Job"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Job"
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

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found</p>
          </div>
        )}
      </div>

      {showModal && selectedJob && (
        <DetailModal
          title="Job Details"
          data={selectedJob}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default JobsPage;