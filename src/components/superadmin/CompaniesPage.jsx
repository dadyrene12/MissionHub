import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreVertical, Trash2, Eye, CheckCircle,
  XCircle, RefreshCw, Download, Building2, Mail, Phone,
  Globe, MapPin, Calendar, Users
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCompanies(data.companies || data.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/companies/${companyId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error verifying company:', error);
    }
  };

  const handleRejectCompany = async (companyId) => {
    if (!confirm('Are you sure you want to reject this company?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/companies/${companyId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error rejecting company:', error);
    }
  };

  const handleToggleStatus = async (companyId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/companies/${companyId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
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
        <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
        <button
          onClick={fetchCompanies}
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
                placeholder="Search companies by name or email..."
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
              <option value="verified">Verified</option>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Company</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Industry</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Jobs</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Verified</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company.name}</p>
                        <p className="text-sm text-gray-500">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {company.industry || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {company.location || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {company.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {company.jobsCount || 0}
                  </td>
                  <td className="py-3 px-4">
                    {company.isVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(company)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!company.isVerified && (
                        <button
                          onClick={() => handleVerifyCompany(company._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Verify Company"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(company._id)}
                        className={`p-2 rounded-lg ${
                          company.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={company.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {company.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Company"
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

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No companies found</p>
          </div>
        )}
      </div>

      {showModal && selectedCompany && (
        <DetailModal
          title="Company Details"
          data={selectedCompany}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CompaniesPage;