import React, { useState, useEffect } from 'react';
import {
  Building, Users, FileText, MessageSquare, CheckCircle,
  XCircle, Mail, Phone, MapPin, Calendar, Download,
  Search, Plus, Eye, Edit, Trash2, Send,
  Briefcase, DollarSign, Clock, Award, BarChart3, ChevronDown, ChevronUp,
  Star, Share2, Settings, Bell, User, Image,
  Menu, X, TrendingUp, TrendingDown, CreditCard, Activity, AlertCircle,
  Shield, UsersRound, PieChart, Filter, RefreshCw
} from 'lucide-react';
import { apiRequest } from '../utils/api';

// ==================== ENHANCED ADMIN SERVICE ====================
class AdminService {
  // Get admin dashboard stats
  async getDashboardStats() {
    try {
      const response = await apiRequest('/admin/dashboard/stats');
      return response.stats || {};
    } catch (error) {
      console.error('Failed to load admin stats:', error);
      return {};
    }
  }

  // Get companies management data
  async getCompanies(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiRequest(`/admin/companies?${queryString}`);
      return response.companies || [];
    } catch (error) {
      console.error('Failed to load companies:', error);
      return [];
    }
  }

  // Get users management data
  async getUsers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiRequest(`/admin/users?${queryString}`);
      return response.users || [];
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }

  // Get jobs management data
  async getJobs(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiRequest(`/admin/jobs?${queryString}`);
      return response.jobs || [];
    } catch (error) {
      console.error('Failed to load jobs:', error);
      return [];
    }
  }

  // Get applications management data
  async getApplications(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiRequest(`/admin/applications?${queryString}`);
      return response.applications || [];
    } catch (error) {
      console.error('Failed to load applications:', error);
      return [];
    }
  }

  // Get exams management data
  async getExams(page = 1, limit = 10) {
    try {
      const response = await apiRequest(`/admin/exams?page=${page}&limit=${limit}`);
      return response.exams || [];
    } catch (error) {
      console.error('Failed to load exams:', error);
      return [];
    }
  }

  // Get activities management data
  async getActivities(page = 1, limit = 10) {
    try {
      const response = await apiRequest(`/admin/activities?page=${page}&limit=${limit}`);
      return response.activities || [];
    } catch (error) {
      console.error('Failed to load activities:', error);
      return [];
    }
  }

  // Get payments management data
  async getPayments(page = 1, limit = 10) {
    try {
      const response = await apiRequest(`/admin/payments?page=${page}&limit=${limit}`);
      return response.payments || [];
    } catch (error) {
      console.error('Failed to load payments:', error);
      return [];
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(period = 'month') {
    try {
      const response = await apiRequest(`/admin/revenue?period=${period}`);
      return response.revenue || {};
    } catch (error) {
      console.error('Failed to load revenue analytics:', error);
      return {};
    }
  }

  // Get problem reports
  async getProblemReports(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await apiRequest(`/notifications/problem-reports?${queryString}`);
      return { reports: response.reports || [], pagination: response.pagination || {} };
    } catch (error) {
      console.error('Failed to load problem reports:', error);
      return { reports: [], pagination: {} };
    }
  }

  // Update problem report status
  async updateProblemReportStatus(reportId, status, adminResponse) {
    try {
      const response = await apiRequest(`/notifications/problem-reports/${reportId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, adminResponse })
      });
      return response;
    } catch (error) {
      console.error('Failed to update problem report:', error);
      throw error;
    }
  }

  // Company management actions
  async verifyCompany(companyId) {
    try {
      const response = await apiRequest(`/admin/companies/${companyId}/verify`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Failed to verify company:', error);
      throw error;
    }
  }

  async suspendCompany(companyId) {
    try {
      const response = await apiRequest(`/admin/companies/${companyId}/suspend`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Failed to suspend company:', error);
      throw error;
    }
  }

  // User management actions
  async updateUserRole(userId, role) {
    try {
      const response = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      return response;
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  }

  async banUser(userId) {
    try {
      const response = await apiRequest(`/admin/users/${userId}/ban`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Failed to ban user:', error);
      throw error;
    }
  }
}

const AdminDashboard = ({ user, showNotification }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Data states
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [exams, setExams] = useState([]);
  const [activities, setActivities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [problemReports, setProblemReports] = useState([]);
  const [reportPagination, setReportPagination] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const adminService = new AdminService();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, companiesData, usersData, jobsData, applicationsData, examsData, activitiesData, paymentsData, revenueData, problemReportsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getCompanies(),
          adminService.getUsers(),
          adminService.getJobs(),
          adminService.getApplications(),
          adminService.getExams(),
          adminService.getActivities(),
          adminService.getPayments(),
          adminService.getRevenueAnalytics(),
          adminService.getProblemReports()
        ]);

        setStats(statsData);
        setCompanies(companiesData);
        setUsers(usersData);
        setJobs(jobsData);
        setApplications(applicationsData);
        setExams(examsData);
        setActivities(activitiesData);
        setPayments(paymentsData);
        setRevenue(revenueData);
        setProblemReports(problemReportsData.reports || []);
        setReportPagination(problemReportsData.pagination || {});
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [refreshKey]);

  // Handle company verification
  const handleVerifyCompany = async (companyId) => {
    try {
      await adminService.verifyCompany(companyId);
      showNotification('Company verified successfully', 'success');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showNotification('Failed to verify company', 'error');
    }
  };

  // Handle user role update
  const handleUpdateUserRole = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, role);
      showNotification('User role updated successfully', 'success');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showNotification('Failed to update user role', 'error');
    }
  };

  // Handle user ban
  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return;
    
    try {
      await adminService.banUser(userId);
      showNotification('User banned successfully', 'success');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showNotification('Failed to ban user', 'error');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle problem report status update
  const handleUpdateReportStatus = async (reportId, status) => {
    const adminResponse = window.prompt(`Enter response for this report (optional):`);
    try {
      await adminService.updateProblemReportStatus(reportId, status, adminResponse);
      showNotification(`Report marked as ${status}`, 'success');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      showNotification('Failed to update report', 'error');
    }
  };

  // Fetch more problem reports for pagination
  const loadMoreReports = async (page) => {
    try {
      const data = await adminService.getProblemReports({ page, limit: 20 });
      setProblemReports(data.reports || []);
      setReportPagination(data.pagination || {});
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load more reports:', error);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'companies', label: 'Companies', icon: Building },
    { id: 'users', label: 'Users', icon: UsersRound },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'problemReports', label: 'Problem Reports', icon: AlertCircle },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(a => 
    a.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExams = exams.filter(e => 
    e.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivities = activities.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(p => 
    p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-200">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-700 font-medium">Loading...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-900 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage platform users and content</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchTerm(''); }}
                  className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            revenue={revenue}
            onViewCompanies={() => setActiveTab('companies')}
            onViewPayments={() => setActiveTab('payments')}
          />
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <CompaniesTab
            companies={filteredCompanies}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={(status) => { setStatusFilter(status); setCurrentPage(1); }}
            onApprove={handleApproveCompany}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UsersTab
            users={filteredUsers}
            searchTerm={searchTerm}
            userTypeFilter={userTypeFilter}
            onSearchChange={setSearchTerm}
            onUserTypeFilterChange={(type) => { setUserTypeFilter(type); setCurrentPage(1); }}
            onDelete={handleDeleteUser}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <JobsTab
            jobs={filteredJobs}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onDelete={handleDeleteJob}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <ApplicationsTab
            applications={filteredApplications}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={(status) => { setStatusFilter(status); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Problem Reports Tab */}
        {activeTab === 'problemReports' && (
          <ProblemReportsTab
            reports={problemReports}
            pagination={reportPagination}
            onUpdateStatus={handleUpdateReportStatus}
            onPageChange={loadMoreReports}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <ExamsTab
            exams={filteredExams}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={(status) => { setStatusFilter(status); setCurrentPage(1); }}
            onApprove={handleApproveExam}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <ActivitiesTab
            activities={filteredActivities}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={(status) => { setStatusFilter(status); setCurrentPage(1); }}
            onApprove={handleApproveActivity}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <PaymentsTab
            payments={filteredPayments}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            revenue={revenue}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

// ============ Sub-Components ============

// Overview Tab Component
const OverviewTab = ({ stats, revenue, onViewCompanies, onViewPayments }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats.users?.total || 0} 
          subtext={`${stats.users?.jobSeekers || 0} job seekers`}
          color="blue" 
        />
        <StatCard 
          icon={Building} 
          label="Companies" 
          value={stats.users?.companies?.total || 0} 
          subtext={`${stats.users?.companies?.pending || 0} pending approval`}
          color="green" 
        />
        <StatCard 
          icon={Briefcase} 
          label="Total Jobs" 
          value={stats.jobs?.total || 0} 
          subtext={`${stats.jobs?.activeThisMonth || 0} this month`}
          color="purple" 
        />
        <StatCard 
          icon={FileText} 
          label="Applications" 
          value={stats.applications?.total || 0} 
          subtext={`${stats.applications?.pending || 0} pending`}
          color="yellow" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Award} 
          label="Exams" 
          value={stats.exams?.total || 0} 
          subtext={`${stats.exams?.pending || 0} pending`}
          color="indigo" 
        />
        <StatCard 
          icon={Activity} 
          label="Activities" 
          value={stats.activities?.total || 0} 
          subtext={`${stats.activities?.promoted || 0} promoted`}
          color="pink" 
        />
        <StatCard 
          icon={CreditCard} 
          label="Total Payments" 
          value={stats.payments?.total || 0} 
          subtext={`${stats.payments?.completed || 0} completed`}
          color="teal" 
        />
        <StatCard 
          icon={DollarSign} 
          label="Revenue" 
          value={`$${revenue?.totalRevenue?.toLocaleString() || 0}`} 
          subtext="This month"
          color="green" 
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={onViewCompanies}
            className="flex items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Pending Companies</p>
              <p className="text-sm text-gray-600">{stats.users?.companies?.pending || 0} awaiting</p>
            </div>
          </button>
          
          <button 
            onClick={onViewPayments}
            className="flex items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Revenue</p>
              <p className="text-sm text-gray-600">${revenue?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </button>

          <div className="flex items-center p-4 bg-purple-50 rounded-xl">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Pending Exams</p>
              <p className="text-sm text-gray-600">{stats.exams?.pending || 0} awaiting</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-yellow-50 rounded-xl">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Pending Applications</p>
              <p className="text-sm text-gray-600">{stats.applications?.pending || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {revenue?.revenueByType && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenue.revenueByType.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 capitalize">{item._id || 'Unknown'}</p>
                <p className="text-2xl font-bold text-gray-900">${item.total?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">{item.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// StatCard Component
const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-50' },
    green: { bg: 'bg-green-100', text: 'text-green-600', iconBg: 'bg-green-50' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-50' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', iconBg: 'bg-yellow-50' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-600', iconBg: 'bg-pink-50' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-600', iconBg: 'bg-teal-50' },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className={`p-3 ${colors.iconBg} rounded-xl`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 border rounded-lg ${
            currentPage === page
              ? 'bg-gray-900 text-white border-gray-900'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
};

// Companies Tab Component
const CompaniesTab = ({ 
  companies, 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange,
  onApprove,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Companies</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-semibold">
                          {company.name?.charAt(0) || 'C'}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{company.name || 'Unnamed Company'}</p>
                          <p className="text-sm text-gray-500">{company.companyDetails?.industry || 'No industry'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{company.email}</p>
                      <p className="text-sm text-gray-500">{company.companyDetails?.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        company.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {company.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {!company.isApproved && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onApprove(company._id, true)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onApprove(company._id, false)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ 
  users, 
  searchTerm, 
  userTypeFilter, 
  onSearchChange, 
  onUserTypeFilterChange,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
            />
          </div>
          <select
            value={userTypeFilter}
            onChange={(e) => onUserTypeFilterChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Users</option>
            <option value="company">Companies</option>
            <option value="jobSeeker">Job Seekers</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.userType === 'company' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.userType === 'company' ? 'Company' : 'Job Seeker'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.userType === 'company' ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete(user._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

// Jobs Tab Component
const JobsTab = ({ 
  jobs, 
  searchTerm, 
  onSearchChange, 
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{job.description?.substring(0, 50)}...</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.postedBy?.name || job.company || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {job.location}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {job.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete(job._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

// Applications Tab Component
const ApplicationsTab = ({ 
  applications, 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                          {app.applicantName?.charAt(0) || 'A'}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{app.applicantName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{app.applicantEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{app.jobTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : app.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

// Exams Tab Component
const ExamsTab = ({ 
  exams, 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange,
  onApprove,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No exams found
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{exam.title}</p>
                      <p className="text-sm text-gray-500">{exam.type || 'Technical'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {exam.applicantName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        exam.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {exam.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {exam.status !== 'approved' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onApprove(exam._id, true)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onApprove(exam._id, false)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
};

// Activities Tab Component
const ActivitiesTab = ({ 
  activities, 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange,
  onApprove,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No activities found</td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{activity.title || 'Activity'}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{activity.description || activity.message}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.type || 'system'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.userId?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {activity.date ? new Date(activity.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onApprove(activity._id)}
                        className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Problem Reports Tab Component
const ProblemReportsTab = ({ reports, pagination, onUpdateStatus, onPageChange, searchTerm, onSearchChange }) => {
  const [expandedReport, setExpandedReport] = useState(null);

  const filteredReports = reports.filter(r => 
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.problemDetails?.reporterEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.problemDetails?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusColors = {
      submitted: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.submitted}`}>
        {status || 'Submitted'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search problem reports..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {pagination.total || 0} reports
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Problem Reports</h3>
            <p className="text-gray-500">There are no problem reports to display.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      {getStatusBadge(report.problemDetails?.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {report.problemDetails?.reporterEmail || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                        {report.problemDetails?.category || 'General'}
                      </span>
                    </div>
                    <p className="text-gray-600">{report.problemDetails?.description || report.message}</p>
                  </div>
                </div>

                {expandedReport === report._id && report.problemDetails?.screenshots?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Screenshots:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.problemDetails.screenshots.map((screenshot, idx) => (
                        <img 
                          key={idx} 
                          src={screenshot} 
                          alt={`Screenshot ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                          onClick={() => window.open(screenshot, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {expandedReport === report._id && report.problemDetails?.adminResponse && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{report.problemDetails.adminResponse}</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  {expandedReport === report._id ? 'Hide Details' : 'View Details'}
                  {expandedReport === report._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className="flex items-center gap-2">
                  {report.problemDetails?.status !== 'in_progress' && (
                    <button
                      onClick={() => onUpdateStatus(report._id, 'in_progress')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {report.problemDetails?.status !== 'resolved' && (
                    <button
                      onClick={() => onUpdateStatus(report._id, 'resolved')}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {report.problemDetails?.status !== 'closed' && (
                    <button
                      onClick={() => onUpdateStatus(report._id, 'closed')}
                      className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg ${
                page === pagination.page 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
