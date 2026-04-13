import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, Users, Eye, CheckCircle, TrendingUp, Activity, Star, Download, 
  Calendar, Filter, ArrowUp, ArrowDown, Clock, BarChart3, PieChart, RefreshCw, 
  Loader2, TrendingDown, Zap, Target, Award, Users2, Clock3, FileText,
  GitBranch, ArrowRight, UserCheck, UserPlus, ClipboardList, User
} from 'lucide-react';
import { apiFetch, LoadingSpinner, Badge } from './CompanyDashboardUtils';

const LineChart = ({ data, color = '#475569', height = 200 }) => {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-500">No data</div>;
  
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const padding = 20;
  const width = 400;
  
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - ((d.value - min) / range) * (height - padding * 2),
    value: d.value,
    label: d.label
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#gradient-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={color} />
        </g>
      ))}
      {points.map((p, i) => (
        <text key={`label-${i}`} x={p.x} y={height - 5} textAnchor="middle" className="fill-slate-500 text-[10px]">
          {p.label}
        </text>
      ))}
    </svg>
  );
};

const DonutChart = ({ data, size = 200 }) => {
  if (!data || data.length === 0) return <div className="flex items-center justify-center text-slate-500">No data</div>;
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;
  
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" style={{ maxWidth: size, maxHeight: size }}>
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const dashLength = (percentage / 100) * circumference;
          const dashOffset = -currentOffset;
          currentOffset += dashLength;
          
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="24"
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-1000"
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 10} textAnchor="middle" className="fill-slate-950 text-2xl font-bold">
          {total}
        </text>
        <text x={size / 2} y={size / 2 + 15} textAnchor="middle" className="fill-slate-500 text-xs">
          Total
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-slate-950">{total}</p>
          <p className="text-xs text-slate-500">Applications</p>
        </div>
      </div>
    </div>
  );
};

const BarChart = ({ data, height = 200 }) => {
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-500">No data</div>;
  
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = 32;
  const gap = 16;
  const chartHeight = height - 60;
  
  return (
    <svg viewBox={`0 0 ${data.length * (barWidth + gap) + gap} ${height}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {data.map((item, i) => {
        const barHeight = (item.value / max) * chartHeight;
        const x = gap + i * (barWidth + gap);
        const y = chartHeight - barHeight + 10;
        
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill="url(#barGradient)"
              className="transition-all duration-500"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(99, 102, 241, 0.3))' }}
            />
            <text x={x + barWidth / 2} y={height - 5} textAnchor="middle" className="fill-gray-500 text-[10px]">
              {item.label}
            </text>
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="fill-white text-xs font-bold">
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const AreaSparkline = ({ data, color = '#6366f1', width = 80, height = 30 }) => {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height
  }));
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const PipelineFunnel = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-80 flex items-center justify-center text-slate-500">
      <div className="text-center">
        <GitBranch className="w-16 h-16 mx-auto mb-3 opacity-30" />
        <p>No pipeline data available</p>
      </div>
    </div>
  );

  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const stages = [
    { 
      label: 'Applications', 
      icon: ClipboardList, 
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50',
      borderLight: 'border-blue-200',
      textColor: 'text-blue-700'
    },
    { 
      label: 'Reviewed', 
      icon: Eye, 
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50',
      borderLight: 'border-indigo-200',
      textColor: 'text-indigo-700'
    },
    { 
      label: 'Interviews', 
      icon: Users2, 
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      borderLight: 'border-purple-200',
      textColor: 'text-purple-700'
    },
    { 
      label: 'Hired', 
      icon: UserCheck, 
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200',
      textColor: 'text-emerald-700'
    }
  ];

  const conversionRates = data.map((item, i) => {
    if (i === 0) return 100;
    return data[0].value > 0 ? Math.round((item.value / data[0].value) * 100) : 0;
  });

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />
      
      <div className="space-y-4 relative z-10">
        {data.map((item, i) => {
          const widthPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const stage = stages[i] || stages[0];
          const IconComp = stage.icon;
          const isLast = i === data.length - 1;
          
          return (
            <div key={i} className="relative">
              <div className={`relative bg-white rounded-2xl p-5 border ${stage.borderLight} transition-all duration-300 hover:border-slate-950 group`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stage.color} rounded-xl flex items-center justify-center`}>
                    <IconComp className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-950">{stage.label}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-950">{item.value}</span>
                        <span className="text-sm text-slate-500">candidates</span>
                      </div>
                    </div>
                    
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 ${stage.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-slate-500">{Math.round(widthPercent)}% of top</span>
                      {!isLast && (
                        <span className={`flex items-center gap-1 ${stage.textColor}`}>
                          <TrendingDown className="w-3 h-3" />
                          {100 - conversionRates[i + 1]}% dropped
                        </span>
                      )}
                      {isLast && (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Final stage
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!isLast && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-20">
                  <div className={`w-8 h-8 ${stage.color} rounded-full flex items-center justify-center border-2 border-white`}>
                    <TrendingDown className="w-4 h-4 text-white transform rotate-180" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Overall Conversion</p>
              <p className="text-lg font-bold text-slate-950">
                {data[0].value > 0 ? Math.round((data[data.length - 1].value / data[0].value) * 100) : 0}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {data[data.length - 1].value}/{data[0].value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsPage = ({ token, user, showToast }) => {
  const [stats, setStats] = useState({
    jobs: 0, applicants: 0, views: 0, hires: 0, interviews: 0, 
    pending: 0, reviewed: 0, rejected: 0, totalViews: 0
  });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => { fetchStats(); }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes, intRes] = await Promise.all([
        apiFetch('/jobs/company'),
        apiFetch('/applications/for-my-jobs'),
        apiFetch('/interview/company')
      ]);
      
      const jobsData = jobsRes.data?.data || [];
      const appsData = appsRes.data?.data || [];
      const intData = intRes.data?.interviews || intRes.data?.data || [];
      
      setJobs(jobsData);
      setApplications(appsData);
      setInterviews(intData);
      
      const totalViews = jobsData.reduce((sum, j) => sum + (j.views || 0), 0);
      
      setStats({
        jobs: jobsData.length,
        applicants: appsData.length,
        views: totalViews,
        hires: appsData.filter(a => a.status === 'approved').length,
        interviews: intData.length,
        pending: appsData.filter(a => a.status === 'pending').length,
        reviewed: appsData.filter(a => a.status === 'reviewed').length,
        rejected: appsData.filter(a => a.status === 'rejected').length,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      showToast('Failed to load analytics', 'error');
    }
    setLoading(false);
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: stats,
      jobs: jobs.map(j => ({ title: j.title, applicants: j.applicants || 0, views: j.views || 0 })),
      applications: applications.map(a => ({ name: a.applicantName, job: a.jobTitle, status: a.status, date: a.createdAt }))
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported successfully!', 'success');
  };

  const topJobs = [...jobs].sort((a, b) => (b.applicants || 0) - (a.applicants || 0)).slice(0, 5);
  const recentApplications = [...applications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  
  const conversionRate = stats.applicants > 0 ? ((stats.hires / stats.applicants) * 100).toFixed(1) : 0;
  const interviewRate = stats.applicants > 0 ? ((stats.interviews / stats.applicants) * 100).toFixed(1) : 0;
  const approvalRate = stats.pending > 0 ? ((stats.hires / stats.pending) * 100).toFixed(1) : 0;
  const viewToApplicationRate = stats.views > 0 ? ((stats.applicants / stats.views) * 100).toFixed(1) : 0;

  const applicationsByJob = applications.reduce((acc, app) => {
    const jobTitle = app.jobTitle || 'Unknown';
    acc[jobTitle] = (acc[jobTitle] || 0) + 1;
    return acc;
  }, {});

  const topJobChart = Object.entries(applicationsByJob)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxJobApplications = Math.max(...topJobChart.map(j => j[1]), 1);

  const statusDistribution = [
    { status: 'Pending', count: stats.pending, color: '#f59e0b', value: stats.pending },
    { status: 'Reviewed', count: stats.reviewed, color: '#3b82f6', value: stats.reviewed },
    { status: 'Approved', count: stats.hires, color: '#10b981', value: stats.hires },
    { status: 'Rejected', count: stats.rejected, color: '#ef4444', value: stats.rejected }
  ].filter(s => s.count > 0);

  const pipelineData = [
    { label: 'Applications', value: stats.applicants },
    { label: 'Reviewed', value: stats.reviewed },
    { label: 'Interviews', value: stats.interviews },
    { label: 'Hired', value: stats.hires }
  ];

  const generateTrendData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 12 : 12;
    const labels = dateRange === '7d' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : dateRange === '30d'
      ? Array.from({length: 30}, (_, i) => i + 1)
      : dateRange === '90d'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const data = labels.map((_, i) => ({
      value: Math.floor(Math.random() * 50) + 10 + (i * 2),
      label: labels[i]
    }));
    return data;
  };

  const trendData = generateTrendData();
  const viewsTrend = trendData.map(d => d.value * 3);
  const applicationsTrend = trendData.map(d => d.value);

  const kpiCards = [
    { 
      title: 'Total Jobs', 
      value: stats.jobs, 
      icon: Briefcase, 
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Total Applicants', 
      value: stats.applicants, 
      icon: Users, 
      trend: '+8%',
      trendUp: true
    },
    { 
      title: 'Job Views', 
      value: stats.views.toLocaleString(), 
      icon: Eye, 
      trend: '+23%',
      trendUp: true
    },
    { 
      title: 'Hires Made', 
      value: stats.hires, 
      icon: CheckCircle, 
      trend: '+5%',
      trendUp: true
    }
  ];

  const performanceMetrics = [
    { label: 'View to Application Rate', value: viewToApplicationRate, suffix: '%', icon: Target, color: 'text-slate-700' },
    { label: 'Interview Rate', value: interviewRate, suffix: '%', icon: Users2, color: 'text-slate-700' },
    { label: 'Approval Rate', value: approvalRate, suffix: '%', icon: Award, color: 'text-slate-700' },
    { label: 'Conversion Rate', value: conversionRate, suffix: '%', icon: Zap, color: 'text-slate-700' }
  ];

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 sm:py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
              Analytics & Insights
            </h1>
            <p className="text-slate-500 text-sm">Track your hiring performance and growth</p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
          <div className="relative">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)} 
              className="px-3 sm:px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none cursor-pointer pr-10 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          <button 
            onClick={fetchStats} 
            className="p-2 sm:p-2.5 bg-white hover:bg-slate-800 border border-slate-200 rounded-xl transition-all hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-slate-600 hover:text-white" />
          </button>
          <button 
            onClick={exportReport} 
            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all text-sm"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 sm:py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-12 sm:w-12 text-slate-950 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {kpiCards.map((kpi, i) => {
              const IconComp = kpi.icon;
              return (
                <div 
                  key={i} 
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 overflow-hidden group hover:border-slate-950 transition-all"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center`}>
                      <IconComp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      kpi.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {kpi.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {kpi.trend}
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-950 mb-1">{kpi.value}</p>
                  <p className="text-sm text-slate-500">{kpi.title}</p>
                </div>
              );
            })}
          </div>

          {/* Main Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applications Trend */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                    Applications Trend
                  </h3>
                  <p className="text-sm text-slate-500">Track your application growth over time</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <span className="text-slate-600">Applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    <span className="text-slate-600">Views</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <LineChart data={trendData} color="#475569" height={220} />
              </div>
            </div>

            {/* Status Distribution Donut */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-slate-600" />
                Status Distribution
              </h3>
              <div className="h-48">
                <DonutChart data={statusDistribution} size={200} />
              </div>
              <div className="mt-4 space-y-2">
                {statusDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600">{item.status}</span>
                    </div>
                    <span className="font-semibold text-slate-950">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-slate-600" />
              Performance Metrics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.map((metric, i) => {
                const IconComp = metric.icon;
                return (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                        <IconComp className={`w-5 h-5 text-slate-700`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-950">{metric.value}{metric.suffix}</p>
                    <p className="text-xs text-slate-500 mt-1">{metric.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hiring Pipeline - Full Width Beautiful Funnel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-950 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-slate-950" />
                  </div>
                  Hiring Pipeline
                </h3>
                <p className="text-sm text-slate-500 mt-1">Visualize your candidate journey from application to hire</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-xs text-green-700 font-medium">Live</span>
              </div>
            </div>
            <PipelineFunnel data={pipelineData} />
          </div>

          {/* Horizontal Pipeline Visual */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-slate-600" />
              Pipeline Overview
            </h3>
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 rounded-full -translate-y-1/2" />
              
              <div className="grid grid-cols-4 gap-4 relative">
                {[
                  { 
                    stage: 'Applied', 
                    count: stats.applicants, 
                    icon: UserPlus, 
                    color: 'bg-blue-500',
                    description: 'Candidates applied'
                  },
                  { 
                    stage: 'Screening', 
                    count: stats.reviewed, 
                    icon: ClipboardList, 
                    color: 'bg-indigo-500',
                    description: 'Under review'
                  },
                  { 
                    stage: 'Interviewing', 
                    count: stats.interviews, 
                    icon: Users2, 
                    color: 'bg-purple-500',
                    description: 'In interview process'
                  },
                  { 
                    stage: 'Hired', 
                    count: stats.hires, 
                    icon: UserCheck, 
                    color: 'bg-emerald-500',
                    description: 'Successfully hired'
                  }
                ].map((item, i) => {
                  const IconComp = item.icon;
                  const dropRate = i > 0 && stats.applicants > 0 
                    ? Math.round(((stats.applicants - item.count) / stats.applicants) * 100) 
                    : 0;
                  
                  return (
                    <div key={i} className="relative">
                      {i < 3 && (
                        <div className="absolute top-6 left-full w-full h-0.5 bg-slate-300 -translate-x-1/2 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                      )}
                      
                      <div className="relative bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-950 transition-all duration-300 group">
                        <div className={`w-12 h-12 mx-auto ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                          <IconComp className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="text-center mb-2">
                          <p className="text-3xl font-bold text-slate-950">{item.count}</p>
                          <p className="text-sm font-medium text-slate-700">{item.stage}</p>
                        </div>
                        
                        <p className="text-xs text-slate-500 text-center">{item.description}</p>
                        
                        {i > 0 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-100 border border-red-200 rounded-full">
                            <span className="text-xs text-red-700">-{dropRate}%</span>
                          </div>
                        )}
                        
                        <div className="flex justify-center gap-1 mt-3">
                          {Array.from({ length: Math.min(item.count, 5) }).map((_, j) => (
                            <div 
                              key={j} 
                              className={`w-2 h-2 rounded-full ${item.color} opacity-60`}
                            />
                          ))}
                          {item.count > 5 && (
                            <span className="text-xs text-slate-500 ml-1">+{item.count - 5}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hiring Pipeline & Applications by Job */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-slate-600" />
                Pipeline Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Active Pipeline', value: stats.applicants, icon: Users, color: 'bg-blue-100 text-blue-700 border-blue-200' },
                  { label: 'In Review', value: stats.reviewed, icon: Eye, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                  { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'bg-purple-100 text-purple-700 border-purple-200' },
                  { label: 'Hired', value: stats.hires, icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200' }
                ].map((stat, i) => {
                  const IconComp = stat.icon;
                  return (
                    <div key={i} className={`p-4 rounded-xl border ${stat.color} bg-opacity-10`}>
                      <IconComp className={`w-6 h-6 mb-2 ${stat.color.split(' ')[1]}`} />
                      <p className="text-2xl font-bold text-slate-950">{stat.value}</p>
                      <p className="text-xs text-slate-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applications by Job */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                Applications by Job
              </h3>
              {topJobChart.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No applications yet</p>
                  </div>
                </div>
              ) : (
                <div className="h-48">
                  <BarChart data={topJobChart.map(([label, value]) => ({ label: label.slice(0, 10), value }))} height={180} />
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Performing Jobs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-slate-600" />
                Top Performing Jobs
              </h3>
              {topJobs.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No jobs posted yet</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {topJobs.map((job, i) => (
                    <div key={job._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-950 transition-all group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        i === 0 ? 'bg-amber-100 text-amber-700' :
                        i === 1 ? 'bg-slate-200 text-slate-600' :
                        i === 2 ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-950 truncate group-hover:text-slate-700 transition-colors">{job.title}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {job.applicants || 0} applicants
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {job.views || 0} views
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-950">{(job.applicants || 0)}</p>
                        <p className="text-xs text-slate-500">apps</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-slate-600" />
                Upcoming Interviews
              </h3>
              {interviews.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No interviews scheduled</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.slice(0, 5).map((int, i) => (
                    <div key={int._id} className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:border-purple-400 transition-all">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Clock3 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-950">{int.candidateName || 'Candidate'}</p>
                        <p className="text-sm text-slate-600">{int.jobTitle || 'Position'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-purple-700">{int.date ? new Date(int.date).toLocaleDateString() : 'TBD'}</p>
                        <p className="text-xs text-slate-500">{int.time || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-600" />
              Recent Applications
            </h3>
            {recentApplications.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-500 border-b border-slate-200">
                      <th className="pb-4 font-medium">Candidate</th>
                      <th className="pb-4 font-medium">Position</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-950 font-medium">
                              {(app.applicantName || app.userId?.name || 'U').charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-950">{app.applicantName || app.userId?.name}</p>
                              <p className="text-xs text-slate-500">{app.applicantEmail || app.userId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">{app.jobId?.title || app.jobTitle}</td>
                        <td className="py-4">
                          <Badge color={
                            app.status === 'pending' ? 'yellow' : 
                            app.status === 'approved' ? 'green' : 
                            app.status === 'rejected' ? 'red' : 
                            app.status === 'reviewed' ? 'blue' : 'gray'
                          }>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
