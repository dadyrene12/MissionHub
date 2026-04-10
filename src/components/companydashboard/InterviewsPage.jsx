import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Clock, Video, MapPin, Users, CheckCircle, 
  XCircle, Loader2, User, Briefcase, Phone, Mail, ChevronDown,
  ChevronUp, Trash2, Edit2, X, Eye, Send, Bell, BellRing, AlertCircle,
  Save, RefreshCw, ExternalLink, Star, MessageSquare, ClipboardCheck,
  CheckSquare, Square
} from 'lucide-react';
import { apiFetch } from './CompanyDashboardUtils';

export default function InterviewsPage({ token, user, showToast }) {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [expandedInterview, setExpandedInterview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [jobApplicants, setJobApplicants] = useState([]);
  const [selectedInterviews, setSelectedInterviews] = useState([]);
  const [formData, setFormData] = useState({
    candidateId: '', jobId: '', scheduledDate: '', scheduledTime: '',
    type: 'video', location: '', notes: '', status: 'scheduled',
    duration: 60, meetingLink: '', title: '', reminder: '30',
    scheduleType: 'single', scheduleForAll: false
  });
  const [sendingReminder, setSendingReminder] = useState(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [intRes, candRes, jobsRes] = await Promise.all([
        apiFetch('/interview/company'),
        apiFetch('/interview/candidates'),
        apiFetch('/jobs/company')
      ]);
      if (intRes.ok) setInterviews(intRes.data?.interviews || []);
      if (candRes.ok) setCandidates(candRes.data?.data || candRes.data?.candidates || candRes.data || []);
      if (jobsRes.ok) setJobs(jobsRes.data?.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filteredInterviews = interviews.filter(i => {
    if (filter === 'all') return true;
    return i.status === filter;
  });

  const upcomingInterviews = interviews.filter(i => {
    if (i.status !== 'scheduled') return false;
    const interviewTime = new Date(i.scheduledDate).getTime();
    const now = new Date().getTime();
    const diff = interviewTime - now;
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  });

  const openCreateModal = () => {
    resetForm();
    setEditingInterview(null);
    setShowModal(true);
  };

  const openEditModal = (interview) => {
    const dateTime = new Date(interview.scheduledDate);
    setFormData({
      candidateId: interview.candidateId?._id || interview.candidateId || '',
      jobId: interview.jobId?._id || interview.jobId || '',
      scheduledDate: dateTime.toISOString().split('T')[0],
      scheduledTime: dateTime.toTimeString().slice(0, 5),
      type: interview.type || 'video',
      location: interview.location || '',
      notes: interview.notes || '',
      status: interview.status || 'scheduled',
      duration: interview.duration || 60,
      meetingLink: interview.meetingLink || '',
      title: interview.title || '',
      reminder: interview.reminder?.beforeMinutes?.toString() || '30',
      scheduleType: 'single',
      scheduleForAll: false
    });
    setEditingInterview(interview);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    if (formData.scheduleType === 'batch' && formData.scheduleForAll && formData.jobId) {
      const batchData = {
        jobId: formData.jobId,
        scheduledDate: dateTime,
        type: formData.type,
        location: formData.location || undefined,
        meetingLink: formData.meetingLink || undefined,
        notes: formData.notes || undefined,
        title: formData.title || `Interview`,
        duration: formData.duration || 60,
        reminder: { enabled: true, beforeMinutes: parseInt(formData.reminder) }
      };
      
      const res = await apiFetch('/interview/schedule-batch', { method: 'POST', body: JSON.stringify(batchData) });
      if (res.ok && res.data.success) {
        showToast(`Scheduled interviews for all approved applicants!`, 'success');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        showToast(res.data?.message || 'Failed to schedule interviews', 'error');
      }
      setSubmitting(false);
      return;
    }

    const interviewData = {
      candidateId: formData.candidateId,
      jobId: formData.jobId || undefined,
      scheduledDate: dateTime,
      type: formData.type,
      location: formData.location || undefined,
      meetingLink: formData.meetingLink || undefined,
      notes: formData.notes || undefined,
      status: formData.status,
      title: formData.title || `Interview`,
      duration: formData.duration || 60,
      reminder: { enabled: true, beforeMinutes: parseInt(formData.reminder) }
    };

    let res;
    if (editingInterview) {
      res = await apiFetch(`/interview/${editingInterview._id}`, { method: 'PUT', body: JSON.stringify(interviewData) });
      if (res.ok && res.data.success) {
        showToast('Interview updated successfully!', 'success');
      } else {
        showToast(res.data?.message || 'Failed to update interview', 'error');
      }
    } else {
      res = await apiFetch('/interview/schedule', { method: 'POST', body: JSON.stringify(interviewData) });
      if (res.ok && res.data.success) {
        showToast('Interview scheduled successfully!', 'success');
      } else {
        showToast(res.data?.message || 'Failed to schedule interview', 'error');
      }
    }
    
    if (res.ok && res.data.success) {
      setShowModal(false);
      resetForm();
      fetchData();
    }
    setSubmitting(false);
  };

  const fetchJobApplicants = async (jobId) => {
    if (!jobId) {
      setJobApplicants([]);
      return;
    }
    setLoadingApplicants(true);
    setJobApplicants([]);
    try {
      const res = await apiFetch('/applications/for-my-jobs');
      if (res.ok && res.data) {
        let allApps = res.data.data || res.data || [];
        if (!Array.isArray(allApps)) allApps = [];
        const jobApps = allApps.filter(app => {
          const appJobId = app.jobId?._id || app.jobId;
          return appJobId === jobId;
        });
        const approved = jobApps.filter(a => a.status === 'approved');
        setJobApplicants(approved);
      }
    } catch (e) {
      console.error(e);
      setJobApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleJobChange = (jobId) => {
    setFormData({ ...formData, jobId, candidateId: '', scheduleType: 'single', scheduleForAll: false });
    if (jobId) {
      fetchJobApplicants(jobId);
    } else {
      setJobApplicants([]);
    }
  };

  const handleStatusChange = async (interviewId, status) => {
    setUpdatingStatus(prev => ({ ...prev, [interviewId]: true }));
    const res = await apiFetch(`/interview/${interviewId}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (res.ok && res.data.success) {
      showToast(`Interview ${status} successfully!`, 'success');
      fetchData();
    } else {
      showToast(res.data?.message || 'Failed to update interview', 'error');
    }
    setUpdatingStatus(prev => {
      const { [interviewId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleDelete = async (interviewId) => {
    if (!confirm('Delete this interview?')) return;
    const res = await apiFetch(`/interview/${interviewId}`, { method: 'DELETE' });
    if (res.ok && res.data.success) {
      showToast('Interview deleted', 'success');
      fetchData();
    }
  };

  const handleSendReminder = async (interviewId) => {
    setSendingReminder(interviewId);
    try {
      const res = await apiFetch(`/interview/${interviewId}/reminder`, { method: 'POST' });
      if (res.ok && res.data.success) showToast('Reminder sent to candidate', 'success');
      else showToast(res.data?.message || 'Failed to send reminder', 'error');
    } catch (err) {
      showToast('Error sending reminder', 'error');
    } finally {
      setSendingReminder(null);
    }
  };

  const resetForm = () => {
    setFormData({ candidateId: '', jobId: '', scheduledDate: '', scheduledTime: '', type: 'video', location: '', notes: '', status: 'scheduled', duration: 60, meetingLink: '', title: '', reminder: '30', scheduleType: 'single', scheduleForAll: false });
    setJobApplicants([]);
  };

  const toggleSelectInterview = (interviewId) => {
    setSelectedInterviews(prev => 
      prev.includes(interviewId) 
        ? prev.filter(id => id !== interviewId)
        : [...prev, interviewId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInterviews.length === filteredInterviews.length) {
      setSelectedInterviews([]);
    } else {
      setSelectedInterviews(filteredInterviews.map(i => i._id));
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      scheduled: { label: 'Scheduled', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-blue-500', border: 'border-l-blue-500' },
      completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-l-emerald-500' },
      cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-l-red-500' },
    };
    return configs[status] || configs.scheduled;
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C';

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    cancelled: interviews.filter(i => i.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-slate-950 animate-spin" />
          </div>
          <p className="text-slate-500">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 sm:py-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950">Interviews</h1>
              <p className="text-slate-500 text-sm">Manage your interview schedule</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm font-medium">
              <Plus className="w-4 h-4" /> Schedule Interview
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.total}</p>
              <p className="text-xs sm:text-sm text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.scheduled}</p>
              <p className="text-xs sm:text-sm text-slate-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.completed}</p>
              <p className="text-xs sm:text-sm text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.cancelled}</p>
              <p className="text-xs sm:text-sm text-slate-500">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews Banner */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <BellRing className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Upcoming Today</h3>
              <p className="text-xs text-slate-400">{upcomingInterviews.length} interview{upcomingInterviews.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upcomingInterviews.slice(0, 5).map(int => (
              <div key={int._id} className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 flex-shrink-0 min-w-[200px]">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-950 font-bold text-sm">{getInitials(int.candidateId?.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{int.candidateId?.name}</p>
                  <p className="text-slate-400 text-xs">{formatTime(int.scheduledDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f 
                    ? 'bg-slate-950 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          {interviews.length > 0 && (
            <span className="text-sm text-slate-500">{filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Interviews List */}
      {filteredInterviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-950 mb-2">No interviews found</h3>
          <p className="text-slate-500 mb-6">Schedule your first interview to get started</p>
          <button onClick={openCreateModal} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> Schedule Interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInterviews.map((interview) => {
            const isExpanded = expandedInterview === interview._id;
            const isUpcoming = interview.status === 'scheduled' && new Date(interview.scheduledDate).getTime() > Date.now();
            const statusConfig = getStatusConfig(interview.status);
            const isSelected = selectedInterviews.includes(interview._id);
            
            return (
              <div 
                key={interview._id} 
                className={`group bg-white border-l-4 ${statusConfig.border} rounded-xl transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border border-slate-950 shadow-md' 
                    : 'border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Selection */}
                    <button
                      onClick={() => toggleSelectInterview(interview._id)}
                      className={`mt-1 p-1.5 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-200 text-slate-950'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    {/* Avatar */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${statusConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className={`${statusConfig.text} font-bold text-base sm:text-lg`}>{getInitials(interview.candidateId?.name)}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-950 text-base sm:text-lg">{interview.candidateId?.name || 'Candidate'}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </span>
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                            <Bell className="w-3 h-3" /> Soon
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          {interview.jobId?.title || 'Position'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {formatDate(interview.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatTime(interview.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {interview.type === 'video' ? <Video className="w-4 h-4 text-slate-400" /> : 
                           interview.type === 'phone' ? <Phone className="w-4 h-4 text-slate-400" /> : 
                           <MapPin className="w-4 h-4 text-slate-400" />}
                          <span className="capitalize">{interview.type || 'Video'}</span>
                        </span>
                        {interview.duration && (
                          <span className="text-slate-400">{interview.duration} min</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {interview.status === 'scheduled' && (
                        <button 
                          onClick={() => handleSendReminder(interview._id)} 
                          disabled={sendingReminder === interview._id} 
                          className="p-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-600 text-slate-500 rounded-lg transition-all"
                          title="Send Reminder"
                        >
                          {sendingReminder === interview._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
                        </button>
                      )}
                      {interview.meetingLink && interview.status === 'scheduled' && (
                        <a 
                          href={interview.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                          title="Join Meeting"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => openEditModal(interview)} 
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(interview._id)} 
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setExpandedInterview(isExpanded ? null : interview._id)} 
                        className={`p-2 rounded-lg transition-all ${
                          isExpanded ? 'bg-slate-950 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                      {interview.notes && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                            <p className="text-sm font-medium text-slate-700">Notes</p>
                          </div>
                          <p className="text-sm text-slate-600">{interview.notes}</p>
                        </div>
                      )}
                      
                      {interview.meetingLink && (
                        <a 
                          href={interview.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all"
                        >
                          <Video className="w-4 h-4" /> Join Meeting
                        </a>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {interview.status === 'scheduled' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(interview._id, 'completed')} 
                              disabled={updatingStatus[interview._id]}
                              className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                              {updatingStatus[interview._id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" /> Mark Complete
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => handleStatusChange(interview._id, 'cancelled')} 
                              disabled={updatingStatus[interview._id]}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                              {updatingStatus[interview._id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" /> Cancel
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{editingInterview ? 'Edit Interview' : 'Schedule Interview'}</h3>
                    <p className="text-sm text-slate-500">{editingInterview ? editingInterview.candidateId?.name : 'Set up a new interview'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Job Selection */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-700">Select Position</p>
                </div>
                <select 
                  value={formData.jobId} 
                  onChange={(e) => handleJobChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">Select position</option>
                  {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                </select>
              </div>

              {/* Schedule Type */}
              {formData.jobId && !editingInterview && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-700">Schedule Type</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <label className={`relative cursor-pointer p-3 rounded-xl border-2 transition-all ${formData.scheduleType === 'single' ? 'border-slate-950 bg-slate-100' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="scheduleType" value="single" checked={formData.scheduleType === 'single'} onChange={(e) => setFormData({...formData, scheduleType: e.target.value, scheduleForAll: false})} className="sr-only" />
                      <p className="font-medium text-slate-950 text-sm">Single</p>
                      <p className="text-xs text-slate-500">One candidate</p>
                    </label>
                    
                    <label className={`relative cursor-pointer p-3 rounded-xl border-2 transition-all ${formData.scheduleType === 'batch' ? 'border-slate-950 bg-slate-100' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="scheduleType" value="batch" checked={formData.scheduleType === 'batch'} onChange={(e) => setFormData({...formData, scheduleType: e.target.value, scheduleForAll: false})} className="sr-only" />
                      <p className="font-medium text-slate-950 text-sm">Batch</p>
                      <p className="text-xs text-slate-500">Multiple candidates</p>
                    </label>
                  </div>

                  {formData.scheduleType === 'batch' && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-950 text-sm">All Approved</p>
                        <p className="text-xs text-slate-500">
                          {loadingApplicants ? 'Loading...' : jobApplicants.length > 0 ? `${jobApplicants.length} candidates` : 'No approved'}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, scheduleForAll: !formData.scheduleForAll})}
                        disabled={loadingApplicants || jobApplicants.length === 0}
                        className={`w-10 h-6 rounded-full transition-all ${formData.scheduleForAll ? 'bg-slate-950' : 'bg-slate-200'} ${loadingApplicants || jobApplicants.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.scheduleForAll ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  )}

                  {formData.scheduleType === 'single' && (
                    <select 
                      value={formData.candidateId} 
                      onChange={(e) => setFormData({...formData, candidateId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="">Select candidate</option>
                      {loadingApplicants ? (
                        <option disabled>Loading...</option>
                      ) : jobApplicants.length > 0 ? (
                        jobApplicants.map(c => <option key={c._id} value={c.candidateId?._id || c.candidateId}>{c.candidateId?.name || 'Candidate'}</option>)
                      ) : candidates.length > 0 ? (
                        candidates.map(c => <option key={c._id} value={c._id}>{c.name || c.userId?.name}</option>)
                      ) : (
                        <option disabled>No candidates</option>
                      )}
                    </select>
                  )}
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={formData.scheduledDate} 
                    onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} 
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Time <span className="text-red-500">*</span></label>
                  <input 
                    type="time" 
                    value={formData.scheduledTime} 
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})} 
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              {/* Type & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
                  <select 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
              </div>

              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Meeting Link</label>
                  <input 
                    type="url" 
                    value={formData.meetingLink} 
                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                    placeholder="Zoom, Google Meet..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              )}

              {formData.type === 'onsite' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Office address"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Interview topics..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                />
              </div>

              {editingInterview && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:bg-emerald-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> 
                      {editingInterview ? 'Updating...' : 'Scheduling...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> 
                      {editingInterview ? 'Update' : formData.scheduleType === 'batch' && formData.scheduleForAll ? `Schedule (${jobApplicants.length})` : 'Schedule'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
