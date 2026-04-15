import React, { useState, useEffect } from 'react';
import { 
  Plus, X, MapPin, Trash2, CheckCircle, Briefcase, Edit2, Eye, 
  Users, Copy, Share2, Pause, Play, Clock, Search, Calendar, Tag,
  Loader2, Grid, List, ChevronDown, ChevronUp, FileText,
  ExternalLink, RefreshCw, Globe, Rocket, DollarSign, Building2,
  Filter, ArrowRight, Mail, Check, XCircle, AlertCircle, MoreVertical,
  Wifi, AlertCircle as AlertCircleIcon, BookmarkCheck, Bookmark, Send
} from 'lucide-react';
import { apiFetch, Badge } from './CompanyDashboardUtils';
import JobCard from '../JobCard';

export const JobsPage = ({ token, user, showToast, onViewApplicants }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobStats, setJobStats] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('newest');

  const getDefaultFormData = () => ({
    title: '', description: '', location: '', type: 'full-time',
    salaryMin: '', salaryMax: '', requirements: '',
    benefits: '', deadline: '', category: 'technology', skills: '',
    status: 'draft', company: user?.name || '',
    remote: false, urgent: false
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const res = await apiFetch('/jobs/company');
    if (res.ok) {
      const fetchedJobs = res.data?.data || res.data?.jobs || [];
      setJobs(fetchedJobs);
      fetchedJobs.forEach(job => fetchJobStats(job._id));
    }
    setLoading(false);
  };

  const fetchJobStats = async (jobId) => {
    const appsRes = await apiFetch('/applications/for-my-jobs');
    const allApps = appsRes.ok ? (appsRes.data?.data || []) : [];
    const jobApps = allApps.filter(a => a.jobId?._id === jobId || a.jobId === jobId);
    setJobStats(prev => ({
      ...prev, [jobId]: {
        total: jobApps.length,
        pending: jobApps.filter(a => a.status === 'pending').length,
        approved: jobApps.filter(a => a.status === 'approved').length,
        reviewed: jobApps.filter(a => a.status === 'reviewed').length,
        rejected: jobApps.filter(a => a.status === 'rejected').length,
        applicants: jobApps
      }
    }));
  };

  const openApplicantsModal = async (job) => {
    setShowApplicantsModal(job);
    setLoadingApplicants(true);
    const appsRes = await apiFetch('/applications/for-my-jobs');
    const allApps = appsRes.ok ? (appsRes.data?.data || []) : [];
    const jobApps = allApps.filter(a => a.jobId?._id === job._id || a.jobId === job._id);
    setJobApplicants(jobApps);
    setLoadingApplicants(false);
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    if (!formData.title.trim()) { showToast('Job title is required', 'error'); return; }
    if (!formData.description.trim()) { showToast('Description is required', 'error'); return; }
    if (!formData.location.trim()) { showToast('Location is required', 'error'); return; }

    const jobData = {
      title: formData.title.trim(), 
      description: formData.description.trim(),
      location: formData.location.trim(), 
      type: formData.type || 'full-time',
      category: formData.category || 'technology',
      company: formData.company || user?.name || '',
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : 0,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : 0,
      requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
      benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      status: publish ? 'active' : (formData.status || 'draft'),
      remote: formData.remote || false, 
      urgent: formData.urgent || false,
      ...(formData.deadline && { deadline: formData.deadline })
    };

    const res = editingJob
      ? await apiFetch(`/jobs/${editingJob._id}`, { method: 'PUT', body: JSON.stringify(jobData) })
      : await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(jobData) });

    if (res.ok && res.data.success) {
      showToast(editingJob ? 'Job updated!' : publish ? 'Job published!' : 'Job saved as draft!', 'success');
      setShowModal(false); setEditingJob(null); setFormData(getDefaultFormData()); fetchJobs();
    } else {
      showToast(res.data?.message || 'Failed to save job', 'error');
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job?')) return;
    const res = await apiFetch(`/jobs/${jobId}`, { method: 'DELETE' });
    if (res.ok && res.data.success) { showToast('Job deleted', 'success'); fetchJobs(); }
    else showToast(res.data?.message || 'Failed to delete', 'error');
  };

  const handleStatusChange = async (jobId, status) => {
    const res = await apiFetch(`/jobs/${jobId}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (res.ok && res.data.success) { showToast(`Job ${status}!`, 'success'); fetchJobs(); }
  };

  const handleDuplicate = async (job) => {
    const dupData = {
      title: `${job.title} (Copy)`, description: job.description, location: job.location,
      type: job.type || 'full-time',
      salaryMin: job.salaryMin || 0, salaryMax: job.salaryMax || 0,
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      category: job.category || 'technology',
      company: job.company || '', status: 'draft'
    };
    const res = await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(dupData) });
    if (res.ok && res.data.success) { showToast('Job duplicated!', 'success'); fetchJobs(); }
  };

  const handleShare = (job) => {
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${job._id}`);
    showToast('Link copied!', 'success');
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title, description: job.description, location: job.location,
      type: job.type || 'full-time',
      salaryMin: job.salaryMin || '', salaryMax: job.salaryMax || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      category: job.category || 'technology',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
      status: job.status || 'draft',
      company: job.company || '', remote: job.remote || false, urgent: job.urgent || false
    });
    setShowModal(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: 'Active', bg: 'bg-slate-950', text: 'text-white', dot: 'bg-emerald-400', border: 'border-emerald-500' },
      draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400', border: 'border-slate-300' },
      closed: { label: 'Closed', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400', border: 'border-red-300' },
      paused: { label: 'Paused', bg: 'bg-amber-100', text: 'amber-700', dot: 'bg-amber-400', border: 'border-amber-300' },
    };
    return configs[status] || configs.draft;
  };

  const getTypeConfig = (type) => {
    const configs = {
      'full-time': { label: 'Full-time' },
      'part-time': { label: 'Part-time' },
      'contract': { label: 'Contract' },
      'internship': { label: 'Internship' },
    };
    return configs[type] || configs['full-time'];
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-slate-950', text: 'text-white' },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-700' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return configs[status] || configs.pending;
  };

  const totalStats = {
    active: jobs.filter(j => j.status === 'active').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    totalViews: jobs.reduce((sum, j) => sum + (j.views || 0), 0),
    totalApplicants: Object.values(jobStats).reduce((sum, s) => sum + s.total, 0)
  };

  const statCards = [
    { label: 'Active Jobs', value: totalStats.active, icon: Briefcase },
    { label: 'Total Views', value: totalStats.totalViews.toLocaleString(), icon: Eye },
    { label: 'Applicants', value: totalStats.totalApplicants, icon: Users },
    { label: 'Drafts', value: totalStats.draft, icon: FileText }
  ];

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-slate-950 mx-auto mb-3" />
          <p className="text-slate-700 text-sm font-medium">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your job postings and track applicants</p>
        </div>
        <button 
          onClick={() => { setEditingJob(null); setFormData(getDefaultFormData()); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center shadow-lg">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-950">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors" 
            />
          </div>
          
          <div className="flex gap-1 flex-wrap">
            {['all', 'active', 'draft', 'paused', 'closed'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A-Z</option>
            </select>
            
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-950 text-white' : 'text-slate-500'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-950 mb-1">No jobs found</h3>
          <p className="text-slate-600 text-sm mb-4">Post your first job to get started</p>
          <button onClick={() => { setEditingJob(null); setFormData(getDefaultFormData()); setShowModal(true); }} className="px-4 py-2 bg-slate-950 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4 inline mr-1" /> Post Job
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredJobs.map((job) => {
            const stats = jobStats[job._id] || { total: 0, pending: 0, approved: 0, reviewed: 0 };
            const statusConfig = getStatusConfig(job.status);
            
            const formatSalary = () => {
              if (job.salaryMin && job.salaryMax) return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`;
              if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
              if (job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`;
              return 'Competitive';
            };

            return (
              <div key={job._id} className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden transition-all hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 group">
                <div className="relative p-5 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {job.remote && (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <Wifi className="w-3 h-3" /> Remote
                        </span>
                      )}
                      {job.urgent && (
                        <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <AlertCircleIcon className="w-3 h-3" /> Urgent
                        </span>
                      )}
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openApplicantsModal(job)} className="w-8 h-8 bg-white hover:bg-indigo-50 rounded-lg flex items-center justify-center border border-slate-200 transition-colors" title="Applicants">
                        <Users className="w-4 h-4 text-slate-600" />
                      </button>
                      <button onClick={() => openEdit(job)} className="w-8 h-8 bg-white hover:bg-indigo-50 rounded-lg flex items-center justify-center border border-slate-200 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job.status === 'active' ? 'bg-slate-950' : job.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`}>
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-950 font-semibold text-xs truncate">{job.company}</p>
                      <p className="text-slate-500 text-[10px]">{job.location}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-950 text-sm leading-tight mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md">{job.category}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{getTypeConfig(job.type).label}</span>
                  </div>

                  <p className="text-slate-600 text-xs mb-3 line-clamp-2">
                    {job.description || 'No description'}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(Array.isArray(job.skills) ? job.skills : []).slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-500"><Users className="w-3.5 h-3.5" />{stats.total}</span>
                      <span className="flex items-center gap-1 text-slate-500"><Eye className="w-3.5 h-3.5" />{job.views || 0}</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-xs">{formatSalary()}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {job.status === 'active' ? (
                      <button onClick={() => handleStatusChange(job._id, 'paused')} className="flex-1 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-amber-200 transition-colors">
                        <Pause className="w-3 h-3" /> Pause
                      </button>
                    ) : (
                      <button onClick={() => handleStatusChange(job._id, 'active')} className="flex-1 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-emerald-200 transition-colors">
                        <Play className="w-3 h-3" /> Activate
                      </button>
                    )}
                    <button onClick={() => handleShare(job)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Share">
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => handleDuplicate(job)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Duplicate">
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => handleDelete(job._id)} className="p-1.5 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const stats = jobStats[job._id] || { total: 0, pending: 0, approved: 0, reviewed: 0 };
            const statusConfig = getStatusConfig(job.status);
            const isExpanded = expandedJob === job._id;
            
            const formatSalary = () => {
              if (job.salaryMin && job.salaryMax) return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`;
              if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
              if (job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`;
              return 'Competitive';
            };

            const getCategoryColor = (cat) => {
              const colors = { technology: 'bg-blue-100 text-blue-700', marketing: 'bg-purple-100 text-purple-700', sales: 'bg-emerald-100 text-emerald-700', finance: 'bg-amber-100 text-amber-700', design: 'bg-pink-100 text-pink-700', engineering: 'bg-cyan-100 text-cyan-700' };
              return colors[cat] || 'bg-slate-100 text-slate-700';
            };

            return (
              <div key={job._id} className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <div className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${job.status === 'active' ? 'bg-slate-950' : job.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`}>
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-slate-950 truncate">{job.title}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${getCategoryColor(job.category)}`}>{job.category}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                        {job.remote && <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700">Remote</span>}
                        {job.urgent && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">Urgent</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-medium">{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{getTypeConfig(job.type).label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                      <div className="flex items-center gap-1"><Users className="w-4 h-4 text-slate-500" /><span className="font-bold text-slate-950">{stats.total}</span></div>
                      <div className="flex items-center gap-1"><Eye className="w-4 h-4 text-slate-500" /><span className="font-bold text-slate-950">{job.views || 0}</span></div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-500" /><span className="font-bold text-amber-600">{stats.pending}</span></div>
                      <span className="font-bold text-emerald-600">{formatSalary()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 ml-16">{job.description || 'No description'}</p>
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button onClick={() => openApplicantsModal(job)} className="px-3 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-800 transition-colors">
                    <Users className="w-3.5 h-3.5" /> Applicants
                  </button>
                  <button onClick={() => openEdit(job)} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  {job.status === 'active' ? (
                    <button onClick={() => handleStatusChange(job._id, 'paused')} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-amber-200 transition-colors">
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                  ) : (
                    <button onClick={() => handleStatusChange(job._id, 'active')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-emerald-200 transition-colors">
                      <Play className="w-3.5 h-3.5" /> Activate
                    </button>
                  )}
                  <button onClick={() => handleShare(job)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Share">
                    <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button onClick={() => handleDuplicate(job)} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors" title="Duplicate">
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button onClick={() => handleDelete(job._id)} className="p-1.5 bg-red-50 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl my-8 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Applicants</h3>
                    <p className="text-slate-400 text-sm">{showApplicantsModal.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowApplicantsModal(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-2xl font-bold text-slate-950">{jobApplicants.length}</p>
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-2xl font-bold text-slate-950">{jobApplicants.filter(a => a.status === 'pending').length}</p>
                  <p className="text-xs text-slate-500 font-medium">Pending</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-2xl font-bold text-slate-950">{jobApplicants.filter(a => a.status === 'approved').length}</p>
                  <p className="text-xs text-slate-500 font-medium">Approved</p>
                </div>
                <div className="text-center p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-2xl font-bold text-slate-950">{jobApplicants.filter(a => a.status === 'rejected').length}</p>
                  <p className="text-xs text-slate-500 font-medium">Rejected</p>
                </div>
              </div>
            </div>
            
            {/* Applicants List */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loadingApplicants ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                </div>
              ) : jobApplicants.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No applicants yet</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {jobApplicants.map((applicant) => {
                    const badge = getStatusBadge(applicant.status);
                    return (
                      <div key={applicant._id} className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all">
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getInitials(applicant.userId?.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-950 truncate">{applicant.userId?.name || 'Applicant'}</p>
                              <p className="text-xs text-slate-500 truncate">{applicant.userId?.email || 'No email'}</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                                {applicant.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">
                            Applied: {new Date(applicant.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button className="flex-1 px-3 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-slate-800 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button className="flex-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-emerald-200 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:bg-red-500 hover:text-white transition-colors">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-8 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{editingJob ? 'Edit Job' : 'Post New Job'}</h3>
                    <p className="text-slate-400 text-sm">{editingJob ? 'Update job details' : 'Fill in the details to post your job'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Job title" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Location <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="Location" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400 transition-colors" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400">
                    <option value="technology">Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="design">Design</option>
                    <option value="engineering">Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Min Salary ($)</label>
                  <input type="number" value={formData.salaryMin} onChange={(e) => setFormData({...formData, salaryMin: e.target.value})} placeholder="50000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Max Salary ($)</label>
                  <input type="number" value={formData.salaryMax} onChange={(e) => setFormData({...formData, salaryMax: e.target.value})} placeholder="100000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-950 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Job description..." rows={4} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 resize-none focus:outline-none focus:border-slate-400" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Requirements</label>
                  <textarea value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})} placeholder="Requirements..." rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 resize-none focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Benefits</label>
                  <textarea value={formData.benefits} onChange={(e) => setFormData({...formData, benefits: e.target.value})} placeholder="Benefits..." rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 resize-none focus:outline-none focus:border-slate-400" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Skills</label>
                  <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="JavaScript, React" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Deadline</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.remote} onChange={(e) => setFormData({...formData, remote: e.target.checked})} className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Remote</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.urgent} onChange={(e) => setFormData({...formData, urgent: e.target.checked})} className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Urgent</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium transition-colors">Save Draft</button>
                <button type="button" onClick={(e) => handleSubmit(e, true)} className="flex-1 py-3 bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
