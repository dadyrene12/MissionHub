import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Download, BarChart3, PieChart, TrendingUp,
  Users, Briefcase, Building2, FileText, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import Cards from './Cards';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    users: { total: 0, growth: 0 },
    jobs: { total: 0, growth: 0 },
    companies: { total: 0, growth: 0 },
    applications: { total: 0, growth: 0 },
    revenue: { total: 0, growth: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [usersRes, jobsRes, companiesRes, appsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/companies`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/applications`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const usersData = await usersRes.json();
      const jobsData = await jobsRes.json();
      const companiesData = await companiesRes.json();
      const appsData = await appsRes.json();

      setAnalytics({
        users: { total: usersData.users?.length || 0, growth: 12 },
        jobs: { total: jobsData.jobs?.length || jobsData.data?.length || 0, growth: 8 },
        companies: { total: companiesData.companies?.length || companiesData.data?.length || 0, growth: 5 },
        applications: { total: appsData.applications?.length || appsData.data?.length || 0, growth: 15 },
        revenue: { total: 50000, growth: 20 }
      });

      setChartData([
        { month: 'Jan', users: 120, jobs: 45, applications: 180 },
        { month: 'Feb', users: 145, jobs: 52, applications: 210 },
        { month: 'Mar', users: 168, jobs: 61, applications: 245 },
        { month: 'Apr', users: 185, jobs: 58, applications: 280 },
        { month: 'May', users: 210, jobs: 72, applications: 320 },
        { month: 'Jun', users: 245, jobs: 85, applications: 380 }
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: analytics.users.total, growth: analytics.users.growth, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Jobs', value: analytics.jobs.total, growth: analytics.jobs.growth, icon: Briefcase, color: 'bg-green-500' },
    { title: 'Companies', value: analytics.companies.total, growth: analytics.companies.growth, icon: Building2, color: 'bg-purple-500' },
    { title: 'Applications', value: analytics.applications.total, growth: analytics.applications.growth, icon: FileText, color: 'bg-orange-500' },
    { title: 'Revenue', value: `$${analytics.revenue.total.toLocaleString()}`, growth: analytics.revenue.growth, icon: DollarSign, color: 'bg-indigo-500' }
  ];

  const maxValue = Math.max(...chartData.map(d => d.users));

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
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="year">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <Cards stats={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span className="w-12 text-sm text-gray-500">{data.month}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-lg transition-all duration-500"
                    style={{ width: `${(data.users / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{data.users}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Applications by Month</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span className="w-12 text-sm text-gray-500">{data.month}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-lg transition-all duration-500"
                    style={{ width: `${(data.applications / 400) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{data.applications}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Job Seekers</span>
              </div>
              <span className="text-sm font-medium text-gray-900">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Companies</span>
              </div>
              <span className="text-sm font-medium text-gray-900">35%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Categories</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Technology</span>
              <span className="text-sm font-medium text-gray-900">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Healthcare</span>
              <span className="text-sm font-medium text-gray-900">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Finance</span>
              <span className="text-sm font-medium text-gray-900">20%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Others</span>
              <span className="text-sm font-medium text-gray-900">15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Hiring Companies</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tech Corp</span>
              <span className="text-sm font-medium text-gray-900">45 jobs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Health Plus</span>
              <span className="text-sm font-medium text-gray-900">32 jobs</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Finance Hub</span>
              <span className="text-sm font-medium text-gray-900">28 jobs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;