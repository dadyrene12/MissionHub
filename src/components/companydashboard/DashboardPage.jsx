import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Briefcase, Users, Calendar, Eye,
  PieChart, PlusCircle, CalendarPlus,
  TrendingUp, Clock, ArrowRight, ArrowUpRight,
  CheckCircle, XCircle, AlertCircle, Inbox,
  UserCheck, Sparkles, Building2, FileText
} from 'lucide-react';
import { apiFetch } from './CompanyDashboardUtils';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler, ArcElement
);

export default function DashboardPage({ user, showToast, isPremium, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0, totalApplications: 0, totalInterviews: 0,
    totalViews: 0, pendingApplications: 0, approvedApplications: 0,
    rejectedApplications: 0, scheduledInterviews: 0,
    completedInterviews: 0, todayInterviews: 0, upcomingInterviews: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [chartData, setChartData] = useState({ months: [], jobs: [], applications: [] });

  const fetchDashboardData = async (showLoader = true) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    
    if (showLoader) setLoading(true);
    
    try {
      const [jobsRes, appsRes, intRes] = await Promise.all([
        apiFetch('/jobs/company'),
        apiFetch('/applications/for-my-jobs'),
        apiFetch('/interview/company')
      ]);

      const jobs = jobsRes.ok ? (jobsRes.data?.data || []) : [];
      const applications = appsRes.ok ? (appsRes.data?.data || []) : [];
      const interviews = intRes.ok ? (intRes.data?.interviews || []) : [];

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

      setStats({
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalInterviews: interviews.length,
        totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        approvedApplications: applications.filter(a => a.status === 'approved').length,
        rejectedApplications: applications.filter(a => a.status === 'rejected').length,
        scheduledInterviews: interviews.filter(i => i.status === 'scheduled').length,
        completedInterviews: interviews.filter(i => i.status === 'completed').length,
        todayInterviews: interviews.filter(i => {
          const d = new Date(i.scheduledDate);
          return d >= today && d < tomorrow;
        }).length,
        upcomingInterviews: interviews.filter(i => {
          return new Date(i.scheduledDate) > new Date() && i.status === 'scheduled';
        }).length
      });

      setRecentApplications(applications.slice(0, 4));
      setRecentInterviews(interviews.filter(i => i.status === 'scheduled').slice(0, 4));

      const last6Months = [], jobsPerMonth = [], appsPerMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        last6Months.push(date.toLocaleString('default', { month: 'short' }));
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        jobsPerMonth.push(jobs.filter(j => {
          const d = new Date(j.createdAt);
          return d >= monthStart && d <= monthEnd;
        }).length);
        
        appsPerMonth.push(applications.filter(a => {
          const d = new Date(a.createdAt);
          return d >= monthStart && d <= monthEnd;
        }).length);
      }
      setChartData({ months: last6Months, jobs: jobsPerMonth, applications: appsPerMonth });

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showToast?.('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) fetchDashboardData();
    else setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-950 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-700 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Active Jobs', value: stats.totalJobs, icon: Briefcase, color: 'emerald', page: 'jobs' },
    { title: 'Applications', value: stats.totalApplications, icon: Users, color: 'blue', page: 'applicants' },
    { title: 'Interviews', value: stats.scheduledInterviews, icon: Calendar, color: 'purple', page: 'interviews' },
    { title: 'Total Views', value: stats.totalViews, icon: Eye, color: 'cyan', page: null }
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200' },
    cyan: { bg: 'bg-cyan-50', icon: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
  };

  const lineChartData = {
    labels: chartData.months,
    datasets: [
      {
        label: 'Applications',
        data: chartData.applications,
        borderColor: '#020617',
        backgroundColor: 'rgba(2, 6, 23, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#020617',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Jobs Posted',
        data: chartData.jobs,
        borderColor: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#64748b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const doughnutData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      data: [stats.pendingApplications || 1, stats.approvedApplications || 1, stats.rejectedApplications || 1],
      backgroundColor: ['#020617', '#64748b', '#e2e8f0'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: '#64748b', 
          usePointStyle: true, 
          padding: 16,
          font: { size: 11 }
        } 
      }
    },
    scales: {
      y: { 
        grid: { color: '#f1f5f9' }, 
        ticks: { color: '#94a3b8', font: { size: 10 } }, 
        beginAtZero: true 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#94a3b8', font: { size: 10 } } 
      }
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back! Here's what's happening.</p>
        </div>
        <button 
          onClick={() => onNavigate?.('jobs')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const colors = colorMap[stat.color];
          return (
            <div 
              key={idx}
              onClick={() => stat.page && onNavigate?.(stat.page)}
              className={`
                relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200 
                hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer
                ${stat.page ? '' : 'pointer-events-none'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.page && (
                  <ArrowUpRight className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-950">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Interview Alert */}
      {stats.todayInterviews > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{stats.todayInterviews} interview{stats.todayInterviews > 1 ? 's' : ''} scheduled today</h3>
                <p className="text-slate-400 text-sm">{stats.upcomingInterviews} more coming up this week</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('interviews')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              View Schedule <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950">Hiring Trends</h3>
              <p className="text-xs text-slate-500">Last 6 months overview</p>
            </div>
          </div>
          <div className="h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Pipeline Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950">Pipeline</h3>
              <p className="text-xs text-slate-500">Application breakdown</p>
            </div>
          </div>
          <div className="h-48 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ ...chartOptions, cutout: '65%' }} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-slate-950 rounded-xl">
              <p className="text-xl font-bold text-white">{stats.pendingApplications}</p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
            <div className="text-center p-3 bg-slate-700 rounded-xl">
              <p className="text-xl font-bold text-white">{stats.approvedApplications}</p>
              <p className="text-xs text-slate-300">Approved</p>
            </div>
            <div className="text-center p-3 bg-slate-200 rounded-xl">
              <p className="text-xl font-bold text-slate-700">{stats.rejectedApplications}</p>
              <p className="text-xs text-slate-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950">Recent Applications</h3>
                <p className="text-xs text-slate-500">Latest candidates</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('applicants')} 
              className="text-sm text-slate-500 hover:text-slate-950 flex items-center gap-1 font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No applications yet</p>
              <button 
                onClick={() => onNavigate?.('jobs')}
                className="mt-3 text-sm text-slate-950 font-medium hover:underline"
              >
                Post a job to get started
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app, idx) => (
                <div 
                  key={app._id || idx} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onNavigate?.('applicants')}
                >
                  <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getInitials(app.userId?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 font-semibold text-sm truncate">{app.userId?.name || 'Applicant'}</p>
                    <p className="text-slate-500 text-xs truncate">{app.jobId?.title || 'Position'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    app.status === 'pending' ? 'bg-slate-950 text-white' :
                    app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950">Upcoming Interviews</h3>
                <p className="text-xs text-slate-500">Scheduled sessions</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate?.('interviews')} 
              className="text-sm text-slate-500 hover:text-slate-950 flex items-center gap-1 font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {recentInterviews.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No upcoming interviews</p>
              <button 
                onClick={() => onNavigate?.('applicants')}
                className="mt-3 text-sm text-slate-950 font-medium hover:underline"
              >
                Review applicants to schedule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInterviews.map((interview, idx) => (
                <div 
                  key={interview._id || idx} 
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onNavigate?.('interviews')}
                >
                  <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {getInitials(interview.candidateId?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-950 font-semibold text-sm truncate">{interview.candidateId?.name || 'Candidate'}</p>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(interview.scheduledDate).toLocaleDateString()} at {new Date(interview.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-950 text-white rounded-lg text-xs font-bold capitalize">
                    {interview.type || 'Video'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-950 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: PlusCircle, label: 'Post Job', page: 'jobs', desc: 'Create new listing' },
            { icon: CalendarPlus, label: 'Schedule', page: 'interviews', desc: 'Plan interview' },
            { icon: Users, label: 'Applicants', page: 'applicants', desc: 'View candidates' },
            { icon: FileText, label: 'Analytics', page: 'analytics', desc: 'View reports' }
          ].map((action, idx) => (
            <button 
              key={idx} 
              onClick={() => onNavigate?.(action.page)}
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-100 transition-all text-left group"
            >
              <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-950 block">{action.label}</span>
                <span className="text-xs text-slate-500">{action.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
