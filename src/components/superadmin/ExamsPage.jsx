import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Download, GraduationCap, Clock, CheckCircle,
  XCircle, Eye, Trash2, Plus, Edit, FileText, Users
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import DetailModal from './DetailModal';

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setExams(data.exams || data.data || []);
    } catch (error) {
      setExams([
        { _id: '1', title: 'JavaScript Fundamentals', description: 'Test your JavaScript knowledge', category: 'Programming', duration: 60, questions: 50, status: 'active', participants: 120, createdAt: new Date().toISOString() },
        { _id: '2', title: 'Data Structures', description: 'Core data structures and algorithms', category: 'Programming', duration: 90, questions: 40, status: 'active', participants: 85, createdAt: new Date(Date.now() - 604800000).toISOString() },
        { _id: '3', title: 'English Proficiency', description: 'English language test', category: 'Language', duration: 45, questions: 30, status: 'inactive', participants: 200, createdAt: new Date(Date.now() - 1209600000).toISOString() },
        { _id: '4', title: 'System Design', description: 'Software system design concepts', category: 'Programming', duration: 120, questions: 25, status: 'active', participants: 45, createdAt: new Date(Date.now() - 1814400000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/exams/${examId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchExams();
    } catch (error) {
      console.error('Error toggling exam status:', error);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/admin/exams/${examId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
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
        <h1 className="text-2xl font-bold text-gray-900">Exams Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </button>
          <button
            onClick={fetchExams}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{exams.length}</h3>
          <p className="text-gray-500 text-sm">Total Exams</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{exams.filter(e => e.status === 'active').length}</h3>
          <p className="text-gray-500 text-sm">Active Exams</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{exams.reduce((sum, e) => sum + (e.participants || 0), 0)}</h3>
          <p className="text-gray-500 text-sm">Total Participants</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Exam Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Questions</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Participants</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{exam.title}</p>
                      <p className="text-sm text-gray-500">{exam.description?.substring(0, 50)}...</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {exam.category || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {exam.duration} min
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {exam.questions || 0}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {exam.participants || 0}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                      {exam.status || 'inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(exam)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(exam._id)}
                        className={`p-2 rounded-lg ${
                          exam.status === 'active' ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={exam.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {exam.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Exam"
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

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No exams found</p>
          </div>
        )}
      </div>

      {showModal && selectedExam && (
        <DetailModal
          title="Exam Details"
          data={selectedExam}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ExamsPage;