import React, { useState, useEffect } from 'react';
import {
  Plus, X, Trash2, Briefcase, Users, Search, Loader2, CheckCircle,
  Copy as CopyIcon, MessageSquare, Clock, Globe, ExternalLink, Share2,
  Edit2, Eye, PauseCircle, PlayCircle, Archive, TrendingUp, MapPin,
  DollarSign, Calendar, Flag, Star, MoreVertical, ChevronDown, Filter,
  ArrowUpRight, BarChart3, Zap, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import { apiFetch } from './CompanyDashboardUtils';

export const JobsPage = ({ token, user, showToast, onRefresh }) => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shareJob, setShareJob] = useState(null);
  const [shareMessage, setShareMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [publishingJob, setPublishingJob] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const getDefaultFormData = () => ({
    title: '', description: '', location: '', type: 'full-time',
    category: 'technology', experience: 'mid', salary: '',
    salaryMin: '', salaryMax: '', requirements: '', responsibilities: '',
    benefits: '', deadline: '', contactEmail: '', contactPhone: '',
    applicationUrl: '', companyLogo: '', companySize: '',
    workCulture: '', image: '', skills: '', status: 'draft',
    company: user?.name || '', remote: false, urgent: false, featured: false
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const res = await apiFetch('/jobs/company');
    if (res.ok) {
      setJobs(res.data?.data || res.data?.jobs || []);
    }
    setLoading(false);
  };

  const fetchApplications = async () => {
    const res = await apiFetch('/applications/company');
    if (res.ok) {
      setApplications(res.data?.data || []);
    }
  };

  const getApplicationsForJob = (jobId) => {
    return applications.filter(app => {
      const appJobId = typeof app.jobId === 'object' ? app.jobId?._id : app.jobId;
      return appJobId === jobId;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
      responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').filter(r => r.trim()) : [],
      benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : 0,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : 0,
    };

    const res = editingJob
      ? await apiFetch(`/jobs/${editingJob._id}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) });

    if (res.ok) {
      showToast(editingJob ? 'Job updated successfully' : 'Job posted successfully', 'success');
      setShowModal(false);
      setEditingJob(null);
      setFormData(getDefaultFormData());
      fetchJobs();
    } else {
      showToast(res.data?.message || 'Failed to save job', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    const res = await apiFetch(`/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Job deleted successfully', 'success');
      fetchJobs();
    }
  };

  const handleDuplicate = async (job) => {
    const dupData = {
      ...job,
      _id: undefined,
      title: `${job.title} (Copy)`,
      status: 'draft',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements,
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities,
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills,
    };
    const res = await apiFetch('/jobs', { method: 'POST', body: JSON.stringify(dupData) });
    if (res.ok) {
      showToast('Job duplicated successfully', 'success');
      fetchJobs();
    }
  };

  const handleToggleStatus = async (job) => {
    setPublishingJob(job._id);
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    const res = await apiFetch(`/jobs/${job._id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Job ${newStatus === 'active' ? 'activated' : 'paused'}`, 'success');
      fetchJobs();
    }
    setPublishingJob(null);
  };

  const handleToggleFeatured = async (job) => {
    const res = await apiFetch(`/jobs/${job._id}`, {
      method: 'PUT',
      body: JSON.stringify({ featured: !job.featured })
    });
    if (res.ok) {
      showToast(job.featured ? 'Job unfeatured' : 'Job featured!', 'success');
      fetchJobs();
    }
  };

  const handleToggleUrgent = async (job) => {
    const res = await apiFetch(`/jobs/${job._id}`, {
      method: 'PUT',
      body: JSON.stringify({ urgent: !job.urgent })
    });
    if (res.ok) {
      showToast(job.urgent ? 'Urgent tag removed' : 'Job marked as urgent!', 'success');
      fetchJobs();
    }
  };

  const handleCloseJob = async (job) => {
    if (!confirm('Close this job posting? No new applications will be accepted.')) return;
    const res = await apiFetch(`/jobs/${job._id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'closed' })
    });
    if (res.ok) {
      showToast('Job closed', 'success');
      fetchJobs();
    }
  };

  const handleShare = (job) => {
    setShareJob(job);
    setShareMessage('');
    setCopiedLink(null);
  };

  const confirmShare = () => {
    if (!shareJob) return;
    const jobLink = `${window.location.origin}/jobs/${shareJob._id}`;
    const fullMessage = shareMessage
      ? `${shareMessage}\n\n${jobLink}`
      : `Check out this job opportunity: ${jobLink}`;
    navigator.clipboard.writeText(fullMessage);
    setCopiedLink(shareJob._id);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(null), 3000);
  };

  const shareToSocial = (platform) => {
    if (!shareJob) return;
    const jobLink = `${window.location.origin}/jobs/${shareJob._id}`;
    let shareUrl = '';
    if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobLink)}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobLink)}&text=${encodeURIComponent(shareMessage || 'Check out this job!')}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobLink)}`;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false;
    if (categoryFilter !== 'all' && job.category !== categoryFilter) return false;
    if (searchTerm && !job.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.location?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.company?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalApplicants = applications.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      type: job.type || 'full-time',
      category: job.category || 'technology',
      experience: job.experience || 'mid',
      salary: job.salary || '',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities || '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      contactEmail: job.contactEmail || '',
      contactPhone: job.contactPhone || '',
      applicationUrl: job.applicationUrl || '',
      companyLogo: job.companyLogo || '',
      companySize: job.companySize || '',
      workCulture: job.workCulture || '',
      image: job.image || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      status: job.status || 'draft',
      company: job.company || user?.name || '',
      remote: job.remote || false,
      urgent: job.urgent || false,
      featured: job.featured || false
    });
    setShowModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const statusConfig = {
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Active' },
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Draft' },
    paused: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Paused' },
    closed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Closed' }
  };

  const typeConfig = {
    'full-time': { icon: Briefcase, color: 'bg-blue-50 text-blue-700' },
    'part-time': { icon: Clock, color: 'bg-purple-50 text-purple-700' },
    'contract': { icon: Calendar, color: 'bg-amber-50 text-amber-700' },
    'internship': { icon: Star, color: 'bg-cyan-50 text-cyan-700' },
    'remote': { icon: Globe, color: 'bg-emerald-50 text-emerald-700' }
  };

  const categoryConfig = {
    technology: '💻 Technology',
    marketing: '📈 Marketing',
    finance: '💰 Finance',
    healthcare: '🏥 Healthcare',
    design: '🎨 Design',
    sales: '🤝 Sales',
    education: '📚 Education',
    other: '📋 Other'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-950" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your job postings and track applications</p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
              title="Refresh all data"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          )}
          <button
            onClick={() => { setEditingJob(null); setFormData(getDefaultFormData()); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-950">{jobs.length}</p>
          <p className="text-sm text-slate-500 mt-1">Total Jobs</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-950">{activeJobs}</p>
          <p className="text-sm text-slate-500 mt-1">Active Jobs</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-950">{totalApplicants}</p>
          <p className="text-sm text-slate-500 mt-1">Applicants</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-950">{totalViews}</p>
          <p className="text-sm text-slate-500 mt-1">Total Views</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, location, or company..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider self-center mr-1">Status:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'draft', label: 'Draft' },
                { key: 'paused', label: 'Paused' },
                { key: 'closed', label: 'Closed' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider self-center mr-1">Category:</span>
              {[
                { key: 'all', label: 'All' },
                ...Object.entries(categoryConfig).map(([key, val]) => ({ key, label: val }))
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setCategoryFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === f.key ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-950 mb-1">No jobs found</h3>
          <p className="text-slate-500 text-sm mb-4">
            {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'Get started by posting your first job'}
          </p>
          <button
            onClick={() => { setEditingJob(null); setFormData(getDefaultFormData()); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Post Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => {
            const jobApplications = getApplicationsForJob(job._id);
            const appCount = jobApplications.length;
            const statusConf = statusConfig[job.status] || statusConfig.draft;
            const typeConf = typeConfig[job.type] || typeConfig['full-time'];
            const TypeIcon = typeConf.icon;
            const daysLeft = getDaysUntilDeadline(job.deadline);

            return (
              <div
                key={job._id}
                className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all group ${job.featured ? 'border-amber-300' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.featured && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                        {job.urgent && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Urgent
                          </span>
                        )}
                        {job.remote && (
                          <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" /> Remote
                          </span>
                        )}
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${statusConf.bg} ${statusConf.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-950 text-lg mb-1">{job.title}</h3>
                      <p className="text-sm text-slate-500 mb-3">{job.company}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${typeConf.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {job.type}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium capitalize">
                          {job.category}
                        </span>
                        {job.experience && (
                          <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-md text-xs font-medium capitalize">
                            {job.experience}
                          </span>
                        )}
                      </div>

                      {(job.salaryMin > 0 || job.salaryMax > 0 || job.salary) && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mb-3">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">
                            {job.salary || (job.salaryMin > 0 && job.salaryMax > 0 ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : job.salaryMin > 0 ? `From $${job.salaryMin.toLocaleString()}` : `Up to $${job.salaryMax.toLocaleString()}`)}
                          </span>
                        </div>
                      )}

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(Array.isArray(job.skills) ? job.skills : []).slice(0, 6).map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{skill}</span>
                          ))}
                          {job.skills.length > 6 && (
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-medium">+{job.skills.length - 6} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === job._id ? null : job._id); }}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                        {actionMenu === job._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
                            <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1">
                              <button onClick={() => { setViewingJob(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" /> View Details
                              </button>
                              <button onClick={() => { openEditModal(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Job
                              </button>
                              <button onClick={() => { handleShare(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Share2 className="w-4 h-4" /> Share Job
                              </button>
                              <button onClick={() => { handleDuplicate(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <CopyIcon className="w-4 h-4" /> Duplicate
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              {job.status === 'active' ? (
                                <button onClick={() => { handleToggleStatus(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                  <PauseCircle className="w-4 h-4" /> Pause Job
                                </button>
                              ) : job.status === 'paused' || job.status === 'draft' ? (
                                <button onClick={() => { handleToggleStatus(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                                  <PlayCircle className="w-4 h-4" /> Activate Job
                                </button>
                              ) : null}
                              <button onClick={() => { handleToggleFeatured(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                <Star className="w-4 h-4" /> {job.featured ? 'Unfeature' : 'Feature'}
                              </button>
                              <button onClick={() => { handleToggleUrgent(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                                <Flag className="w-4 h-4" /> {job.urgent ? 'Remove Urgent' : 'Mark Urgent'}
                              </button>
                              {job.status === 'active' && (
                                <button onClick={() => { handleCloseJob(job); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                                  <Archive className="w-4 h-4" /> Close Job
                                </button>
                              )}
                              <div className="border-t border-slate-100 my-1" />
                              <button onClick={() => { handleDelete(job._id); setActionMenu(null); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Job
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold text-slate-950">{appCount || job.applicants || 0}</span>
                        <span>applicants</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold text-slate-950">{job.views || 0}</span>
                        <span>views</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold text-slate-950">{formatDate(job.createdAt)}</span>
                        <span>posted</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.deadline && (
                        <div className={`flex items-center gap-1.5 text-xs mr-3 ${daysLeft < 0 ? 'text-red-600 bg-red-50' : daysLeft < 7 ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-50'} px-3 py-1.5 rounded-lg`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
                        </div>
                      )}
                      <button
                        onClick={() => setViewingJob(job)}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={() => openEditModal(job)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleShare(job)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        disabled={publishingJob === job._id}
                        className={`p-2 rounded-xl transition-colors ${job.status === 'active' ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}
                        title={job.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {publishingJob === job._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : job.status === 'active' ? (
                          <PauseCircle className="w-4 h-4" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post/Edit Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-950">{editingJob ? 'Edit Job' : 'Post New Job'}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{editingJob ? 'Update your job posting' : 'Fill in the details to create a new job posting'}</p>
              </div>
              <button onClick={() => { setShowModal(false); setEditingJob(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Basic Info Section */}
                <div>
                  <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Basic Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Job Title <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required maxLength={100} placeholder="e.g. Senior Frontend Developer" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Company Name <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required placeholder="Your company name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Description <span className="text-red-500">*</span></label>
                      <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} placeholder="Describe the role, responsibilities, and what makes it exciting..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none" />
                    </div>
                  </div>
                </div>

                {/* Location & Type */}
                <div>
                  <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location & Type
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Location <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required placeholder="e.g. New York, NY" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Job Type <span className="text-red-500">*</span></label>
                      <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400">
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Category <span className="text-red-500">*</span></label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400">
                        <option value="technology">Technology</option>
                        <option value="marketing">Marketing</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="design">Design</option>
                        <option value="sales">Sales</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Experience Level</label>
                      <select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400">
                        <option value="entry">Entry Level</option>
                        <option value="junior">Junior</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                        <option value="principal">Principal</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.remote} onChange={(e) => setFormData({ ...formData, remote: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950" />
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5"><Globe className="w-4 h-4" /> Remote Position</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.urgent} onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5"><Zap className="w-4 h-4" /> Urgent Hiring</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                      <span className="text-sm text-slate-700 font-medium flex items-center gap-1.5"><Star className="w-4 h-4" /> Featured Post</span>
                    </label>
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Compensation
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Salary (text)</label>
                      <input type="text" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="e.g. Competitive" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Min Salary ($)</label>
                      <input type="number" value={formData.salaryMin} onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })} placeholder="50000" min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Max Salary ($)</label>
                      <input type="number" value={formData.salaryMax} onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })} placeholder="80000" min="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Requirements & Responsibilities */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Requirements
                    </h4>
                    <textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} rows={5} placeholder="One requirement per line..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none" />
                    <p className="text-xs text-slate-400 mt-1">Enter one requirement per line</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4" /> Responsibilities
                    </h4>
                    <textarea value={formData.responsibilities} onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })} rows={5} placeholder="One responsibility per line..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none" />
                    <p className="text-xs text-slate-400 mt-1">Enter one responsibility per line</p>
                  </div>
                </div>

                {/* Benefits & Skills */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Benefits
                    </h4>
                    <textarea value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} rows={4} placeholder="e.g. Health Insurance&#10;401k Matching&#10;Flexible PTO" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none" />
                    <p className="text-xs text-slate-400 mt-1">Enter one benefit per line</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Skills
                    </h4>
                    <textarea value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} rows={4} placeholder="e.g. React, Node.js, TypeScript, MongoDB" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none" />
                    <p className="text-xs text-slate-400 mt-1">Separate skills with commas</p>
                  </div>
                </div>

                {/* Contact & Additional Info */}
                <div>
                  <h4 className="text-sm font-bold text-slate-950 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Contact & Additional Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Contact Email</label>
                      <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="hr@company.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Contact Phone</label>
                      <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Application URL</label>
                      <input type="url" value={formData.applicationUrl} onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })} placeholder="https://company.com/apply" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Application Deadline</label>
                      <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Company Size</label>
                      <select value={formData.companySize} onChange={(e) => setFormData({ ...formData, companySize: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400">
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-1.5">Company Logo URL</label>
                      <input type="url" value={formData.companyLogo} onChange={(e) => setFormData({ ...formData, companyLogo: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-950 mb-1.5">Work Culture</label>
                    <textarea value={formData.workCulture} onChange={(e) => setFormData({ ...formData, workCulture: e.target.value })} rows={2} placeholder="Describe your company culture..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 resize-none" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-950 mb-1.5">Cover Image URL</label>
                    <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button type="button" onClick={() => { setShowModal(false); setEditingJob(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={(e) => {
                e.preventDefault();
                const payload = {
                  ...formData, status: 'draft',
                  requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : [],
                  responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').filter(r => r.trim()) : [],
                  benefits: formData.benefits ? formData.benefits.split('\n').filter(b => b.trim()) : [],
                  skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
                  salaryMin: formData.salaryMin ? Number(formData.salaryMin) : 0,
                  salaryMax: formData.salaryMax ? Number(formData.salaryMax) : 0,
                };
                const res = editingJob
                  ? apiFetch(`/jobs/${editingJob._id}`, { method: 'PUT', body: JSON.stringify(payload) })
                  : apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) });
                res.then(r => { if (r.ok) { showToast('Draft saved', 'success'); setShowModal(false); setEditingJob(null); setFormData(getDefaultFormData()); fetchJobs(); } });
              }} className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-950 rounded-xl text-sm font-medium transition-colors">
                Save as Draft
              </button>
              <button onClick={(e) => handleSubmit(e)} className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors">
                {editingJob ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Job Details Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-slate-950">{viewingJob.title}</h3>
                  {viewingJob.featured && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                  {viewingJob.urgent && <Zap className="w-5 h-5 text-red-500" />}
                </div>
                <p className="text-sm text-slate-500">{viewingJob.company}</p>
              </div>
              <button onClick={() => setViewingJob(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Status & Meta */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1.5 ${statusConfig[viewingJob.status]?.bg} ${statusConfig[viewingJob.status]?.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[viewingJob.status]?.dot}`} />
                  {statusConfig[viewingJob.status]?.label}
                </span>
                {viewingJob.remote && <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1"><Globe className="w-3 h-3" /> Remote</span>}
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">{viewingJob.type}</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">{viewingJob.category}</span>
                {viewingJob.experience && <span className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full">{viewingJob.experience}</span>}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-950">{getApplicationsForJob(viewingJob._id).length || viewingJob.applicants || 0}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Applicants</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-950">{viewingJob.views || 0}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Views</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-950">{formatDate(viewingJob.createdAt)}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Posted</p>
                </div>
              </div>

              {/* Location & Salary */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-950">Location</span>
                  </div>
                  <p className="text-sm text-slate-600">{viewingJob.location}</p>
                </div>
                {(viewingJob.salaryMin > 0 || viewingJob.salaryMax > 0 || viewingJob.salary) && (
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-900">Salary</span>
                    </div>
                    <p className="text-sm text-emerald-700 font-medium">
                      {viewingJob.salary || (viewingJob.salaryMin > 0 && viewingJob.salaryMax > 0 ? `$${viewingJob.salaryMin.toLocaleString()} - $${viewingJob.salaryMax.toLocaleString()}` : viewingJob.salaryMin > 0 ? `From $${viewingJob.salaryMin.toLocaleString()}` : `Up to $${viewingJob.salaryMax.toLocaleString()}`)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-950 mb-2">Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{viewingJob.description}</p>
              </div>

              {/* Requirements */}
              {viewingJob.requirements && viewingJob.requirements.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-950 mb-2">Requirements</h4>
                  <ul className="space-y-1.5">
                    {(Array.isArray(viewingJob.requirements) ? viewingJob.requirements : []).map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {viewingJob.responsibilities && viewingJob.responsibilities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-950 mb-2">Responsibilities</h4>
                  <ul className="space-y-1.5">
                    {(Array.isArray(viewingJob.responsibilities) ? viewingJob.responsibilities : []).map((resp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <ArrowUpRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {viewingJob.benefits && viewingJob.benefits.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-950 mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(viewingJob.benefits) ? viewingJob.benefits : []).map((benefit, i) => (
                      <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg font-medium">{benefit}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {viewingJob.skills && viewingJob.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-950 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(viewingJob.skills) ? viewingJob.skills : []).map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-950 text-white text-sm rounded-lg font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Additional */}
              {(viewingJob.contactEmail || viewingJob.contactPhone || viewingJob.applicationUrl || viewingJob.deadline || viewingJob.companySize || viewingJob.workCulture) && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-bold text-slate-950 mb-3">Additional Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {viewingJob.contactEmail && (
                      <div><p className="text-xs text-slate-500 mb-0.5">Contact Email</p><p className="text-sm text-slate-950">{viewingJob.contactEmail}</p></div>
                    )}
                    {viewingJob.contactPhone && (
                      <div><p className="text-xs text-slate-500 mb-0.5">Contact Phone</p><p className="text-sm text-slate-950">{viewingJob.contactPhone}</p></div>
                    )}
                    {viewingJob.applicationUrl && (
                      <div><p className="text-xs text-slate-500 mb-0.5">Application URL</p><a href={viewingJob.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">Apply Here <ExternalLink className="w-3 h-3" /></a></div>
                    )}
                    {viewingJob.deadline && (
                      <div><p className="text-xs text-slate-500 mb-0.5">Deadline</p><p className="text-sm text-slate-950">{formatDate(viewingJob.deadline)}</p></div>
                    )}
                    {viewingJob.companySize && (
                      <div><p className="text-xs text-slate-500 mb-0.5">Company Size</p><p className="text-sm text-slate-950">{viewingJob.companySize} employees</p></div>
                    )}
                    {viewingJob.workCulture && (
                      <div className="md:col-span-2"><p className="text-xs text-slate-500 mb-0.5">Work Culture</p><p className="text-sm text-slate-600">{viewingJob.workCulture}</p></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setViewingJob(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">Close</button>
              <button onClick={() => { setViewingJob(null); openEditModal(viewingJob); }} className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Edit2 className="w-4 h-4" /> Edit Job</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Share2 className="w-5 h-5" /> Share Job
              </h3>
              <button onClick={() => setShareJob(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Job Preview */}
              <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 mb-4 border border-slate-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-950 text-sm line-clamp-1">{shareJob.title}</h4>
                    <p className="text-xs text-slate-500">{shareJob.location} · {shareJob.type}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {shareJob.remote && <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1"><Globe className="w-3 h-3" /> Remote</span>}
                  {shareJob.urgent && <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1"><Zap className="w-3 h-3" /> Urgent</span>}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-950 mb-1.5 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Add a message (optional)
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Hey! I came across this job opportunity and thought you'd be a great fit..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Link */}
              <div className="bg-slate-50 rounded-xl p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Job Link
                  </span>
                  {copiedLink === shareJob._id && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Copied!
                    </span>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 truncate font-mono">
                  {typeof window !== 'undefined' ? `${window.location.origin}/jobs/${shareJob._id}` : `/jobs/${shareJob._id}`}
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={confirmShare}
                className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors mb-4 ${copiedLink === shareJob._id ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
              >
                {copiedLink === shareJob._id ? <CheckCircle className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                {copiedLink === shareJob._id ? 'Copied to Clipboard!' : 'Copy Link'}
              </button>

              {/* Social Share */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-medium text-slate-600 mb-3 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Share on social media
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => shareToSocial('linkedin')} className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors">
                    LinkedIn
                  </button>
                  <button onClick={() => shareToSocial('twitter')} className="py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-medium transition-colors">
                    Twitter / X
                  </button>
                  <button onClick={() => shareToSocial('facebook')} className="py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-medium transition-colors">
                    Facebook
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button onClick={() => setShareJob(null)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
