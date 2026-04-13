import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Building2, FileText, DollarSign, TrendingUp,
  Activity, Bell, Eye, CheckCircle, XCircle, Clock, BarChart3,
  PieChart, ArrowUpRight, ArrowDownRight, Search, Filter,
  MoreVertical, ChevronDown, RefreshCw, Download, Mail, Shield
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const SuperAdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [usersRes, jobsRes, companiesRes, applicationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/companies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const jobsData = await jobsRes.json();
      const companiesData = await companiesRes.json();
      const applicationsData = await applicationsRes.json();

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalJobs: jobsData.jobs?.length || jobsData.data?.length || 0,
        totalCompanies: companiesData.companies?.length || companiesData.data?.length || 0,
        totalApplications: applicationsData.applications?.length || applicationsData.data?.length || 0,
        totalRevenue: 0,
        activeUsers: usersData.users?.filter(u => u.isActive)?.length || 0
      });

      setRecentActivity([
        { type: 'user', message: 'New user registered', time: '2 mins ago' },
        { type: 'job', message: 'New job posted', time: '15 mins ago' },
        { type: 'application', message: 'New application submitted', time: '1 hour ago' },
        { type: 'company', message: 'Company verified', time: '2 hours ago' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'Active Jobs', value: stats.totalJobs, icon: Briefcase, color: 'bg-green-500', change: '+8%' },
    { title: 'Companies', value: stats.totalCompanies, icon: Building2, color: 'bg-purple-500', change: '+5%' },
    { title: 'Applications', value: stats.totalApplications, icon: FileText, color: 'bg-orange-500', change: '+15%' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-4">{stat.value.toLocaleString()}</h3>
            <p className="text-gray-500 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-900">Manage Users</span>
            </button>
            <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Briefcase className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-900">Manage Jobs</span>
            </button>
            <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Building2 className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-900">Companies</span>
            </button>
            <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Shield className="w-5 h-5 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-orange-900">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
