import React, { useState, useEffect } from 'react';
import { 
  Plus, X, MapPin, Trash2, CheckCircle, Briefcase, Edit2, Eye, 
  Users, Copy, Share2, Pause, Play, Clock, Search, Calendar, Tag,
  Loader2, Grid, List, ChevronDown, ChevronUp, FileText,
  ExternalLink, RefreshCw, Globe, Rocket, DollarSign, Building2,
  Filter, ArrowRight, Mail, Check, XCircle, AlertCircle, MoreVertical
} from 'lucide-react';
import { apiFetch, Badge } from './CompanyDashboardUtils';

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
  const [viewMode, setViewMode] = useState('grid');
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
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const stats = jobStats[job._id] || { total: 0, pending: 0, approved: 0, reviewed: 0 };
            const statusConfig = getStatusConfig(job.status);
            
            return (
              <div 
                key={job._id}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-slate-300 transition-all duration-300"
              >
                {/* Header with gradient */}
                <div className="relative p-5 pb-4">
                  {/* Status Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${job.status === 'active' ? 'bg-slate-950' : job.status === 'paused' ? 'bg-amber-500' : job.status === 'draft' ? 'bg-slate-400' : 'bg-red-500'}`} />
                  
                  <div className="flex items-start justify-between gap-3 mt-2">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                          {getTypeConfig(job.type).label}
                        </span>
                        {job.remote && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">Remote</span>}
                        {job.urgent && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg animate-pulse">Urgent</span>}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-950 line-clamp-1">{job.title}</h3>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {job.category}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openEdit(job)} className="p-2 bg-slate-100 hover:bg-slate-950 text-slate-600 hover:text-white rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)} className={`p-2 rounded-lg transition-all ${expandedJob === job._id ? 'bg-slate-950 text-white' : 'bg-slate-100 hover:bg-slate-950 text-slate-600 hover:text-white'}`}>
                        {expandedJob === job._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="px-5 pb-4">
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl">
                    <button onClick={() => openApplicantsModal(job)} className="text-center p-2 hover:bg-white rounded-lg transition-all group cursor-pointer">
                      <Users className="w-5 h-5 text-slate-950 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="text-xl font-bold text-slate-950">{stats.total}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Applicants</p>
                    </button>
                    <div className="text-center p-2">
                      <Eye className="w-5 h-5 text-slate-950 mx-auto mb-1.5" />
                      <p className="text-xl font-bold text-slate-950">{job.views || 0}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Views</p>
                    </div>
                    <div className="text-center p-2">
                      <Clock className="w-5 h-5 text-slate-950 mx-auto mb-1.5" />
                      <p className="text-xl font-bold text-slate-950">{stats.pending}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openApplicantsModal(job)} className="px-3 py-1.5 bg-slate-950 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Applicants
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Section */}
                {expandedJob === job._id && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
                    {job.description && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                        <p className="text-sm text-slate-700 line-clamp-3">{job.description}</p>
                      </div>
                    )}

                    {job.skills?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-950 text-white text-xs rounded-lg font-medium">{skill}</span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">+{job.skills.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleShare(job)} className="px-3 py-2 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button onClick={() => handleDuplicate(job)} className="px-3 py-2 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </button>
                      {job.status === 'active' ? (
                        <button onClick={() => handleStatusChange(job._id, 'paused')} className="px-3 py-2 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </button>
                      ) : job.status === 'paused' ? (
                        <button onClick={() => handleStatusChange(job._id, 'active')} className="px-3 py-2 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                          <Play className="w-3.5 h-3.5" /> Resume
                        </button>
                      ) : null}
                      <button onClick={() => handleDelete(job._id)} className="px-3 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg text-xs font-medium flex items-center gap-1.5 ml-auto transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const stats = jobStats[job._id] || { total: 0, pending: 0, approved: 0, reviewed: 0 };
            const statusConfig = getStatusConfig(job.status);
            
            return (
              <div key={job._id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-slate-400 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${job.status === 'active' ? 'bg-slate-950' : job.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'}`}>
                    <Briefcase className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                        {getTypeConfig(job.type).label}
                      </span>
                      {job.remote && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">Remote</span>}
                      {job.urgent && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg animate-pulse">Urgent</span>}
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-950">{job.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {job.category}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 lg:mr-4">
                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-lg font-bold text-slate-950">{stats.total}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Applicants</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-lg font-bold text-slate-950">{job.views || 0}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Views</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-lg font-bold text-slate-950">{stats.pending}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Pending</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openApplicantsModal(job)} className="px-4 py-2 bg-slate-950 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors">
                      <Users className="w-4 h-4" /> Applicants
                    </button>
                    <button onClick={() => openEdit(job)} className="p-2.5 bg-slate-100 hover:bg-slate-950 text-slate-600 hover:text-white rounded-xl transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)} className={`p-2.5 rounded-xl transition-all ${expandedJob === job._id ? 'bg-slate-950 text-white' : 'bg-slate-100 hover:bg-slate-950 text-slate-600 hover:text-white'}`}>
                      {expandedJob === job._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {expandedJob === job._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    {job.description && <p className="text-sm text-slate-700 mb-3">{job.description}</p>}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-950 text-white text-xs rounded-lg font-medium">{skill}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => handleShare(job)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <Share2 className="w-3 h-3" /> Share
                      </button>
                      <button onClick={() => handleDuplicate(job)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <Copy className="w-3 h-3" /> Duplicate
                      </button>
                      {job.status === 'active' ? (
                        <button onClick={() => handleStatusChange(job._id, 'paused')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium transition-colors">
                          <Pause className="w-3 h-3 inline mr-1" /> Pause
                        </button>
                      ) : job.status === 'paused' ? (
                        <button onClick={() => handleStatusChange(job._id, 'active')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-950 hover:text-white text-slate-700 rounded-lg text-xs font-medium transition-colors">
                          <Play className="w-3 h-3 inline mr-1" /> Resume
                        </button>
                      ) : null}
                      <button onClick={() => handleDelete(job._id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-lg text-xs font-medium ml-auto transition-colors">
                        <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                )}
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
                <div className="space-y-3">
                  {jobApplicants.map((applicant) => {
                    const badge = getStatusBadge(applicant.status);
                    return (
                      <div key={applicant._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {getInitials(applicant.userId?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-950">{applicant.userId?.name || 'Applicant'}</p>
                          <p className="text-sm text-slate-500 truncate">{applicant.userId?.email || 'No email'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${badge.bg} ${badge.text}`}>
                            {applicant.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(applicant.createdAt).toLocaleDateString()}
                          </p>
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
