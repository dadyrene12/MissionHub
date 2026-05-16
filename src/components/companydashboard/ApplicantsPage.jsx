import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle, XCircle, Users, Mail, FileText,
  Calendar, ThumbsUp, ThumbsDown, Star, Clock, Briefcase,
  MapPin, DollarSign, GraduationCap, Phone, MessageCircle, Send,
  ChevronDown, ChevronUp, Loader2, CheckCheck, X, Download,
  User, RefreshCw, SlidersHorizontal, UserPlus, Heart, Award,
  MoreHorizontal, Brain, Sparkles, Bell, Plus, ExternalLink,
  TrendingUp, AlertCircle, Target, Zap, ArrowRight, Inbox, BellRing
} from 'lucide-react';
import { apiFetch } from './CompanyDashboardUtils';

export const ApplicantsPage = ({ token, user, showToast, talentPool, setTalentPool, setShowApplicant, setShowMessage, setShowAIMatching, jobs, filterJob }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [jobFilter, setJobFilter] = useState(filterJob?._id || 'all');
  const [expandedApp, setExpandedApp] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingApplicant, setSchedulingApplicant] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [showAIMatchModal, setShowAIMatchModal] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [notifyType, setNotifyType] = useState(null);
  const [loadingActions, setLoadingActions] = useState({});
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => { fetchApplications(); }, []);
  useEffect(() => { if (filterJob?._id) setJobFilter(filterJob._id); }, [filterJob]);

  const fetchApplications = async () => {
    setLoading(true);
    const res = await apiFetch('/applications/for-my-jobs');
    if (res.ok) {
      const apps = res.data?.data || [];
      const appsWithAI = apps.map(app => ({
        ...app,
        aiScore: app.aiScreening?.overallScore || 0,
        aiData: app.aiScreening || null
      }));
      setApplications(appsWithAI);
    }
    setLoading(false);
  };

  const normalizeText = (text) => String(text || '').toLowerCase().replace(/[^\w\s]/g, '');
  
  const calculateMatchScore = (app, job) => {
    if (!job) {
      return {
        score: 0,
        skillScore: 0,
        matchedSkills: [],
        missingSkills: [],
        yearsExp: 0,
        requiredExp: 0,
        eduScore: 0,
        education: app.education || 'Not specified',
        cvKeywords: []
      };
    }
    
    const jobSkills = job.skills || job.requirements?.skills || [];
    const requiredExp = parseInt(job.experience) || parseInt(job.requirements?.minExperience) || 0;
    const requiredEdu = job.requirements?.education || '';
    
    const normalizedJobSkills = (jobSkills || []).map(s => normalizeText(s));
    const normalizedAppSkills = Array.isArray(app.skills) 
      ? app.skills.map(s => normalizeText(s))
      : [];
    
    let skillScore = 50;
    let matchedSkills = [];
    let missingSkills = [];
    if (normalizedJobSkills.length > 0) {
      matchedSkills = normalizedJobSkills.filter(js => 
        normalizedAppSkills.some(as => as.includes(js) || js.includes(as))
      );
      missingSkills = normalizedJobSkills.filter(js => 
        !normalizedAppSkills.some(as => as.includes(js) || js.includes(as))
      );
      skillScore = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
    }
    
    const appYears = parseInt(app.experience?.years || app.experience || '0') || 0;
    let expScore = 100;
    if (requiredExp > 0) {
      expScore = appYears >= requiredExp 
        ? Math.min(100 + (appYears - requiredExp) * 2, 100) 
        : Math.round((appYears / requiredExp) * 100);
    }
    
    const levels = { 'high school': 1, 'associate': 2, 'bachelor': 3, 'bachelors': 3, 'masters': 4, 'master': 4, 'mba': 4, 'phd': 5, 'doctoral': 5, 'doctorate': 5 };
    const appLevel = levels[normalizeText(app.education)] || 2;
    const requiredLevel = levels[normalizeText(requiredEdu)] || 2;
    const eduScore = appLevel >= requiredLevel ? 100 : Math.round((appLevel / requiredLevel) * 100);
    
    const cvText = app.resume || app.coverLetter || '';
    const normalizedCV = normalizeText(cvText);
    const cvKeywords = normalizedJobSkills.filter(skill => normalizedCV.includes(skill));
    
    let overallScore = Math.round(
      (skillScore * 0.40) +
      (expScore * 0.30) +
      (eduScore * 0.15) +
      (cvKeywords.length > 0 ? Math.round((cvKeywords.length / normalizedJobSkills.length) * 100) * 0.15 : 0)
    );
    overallScore = Number(overallScore) || 0;
    
    return {
      score: Math.max(0, Math.min(100, overallScore)),
      skillScore: Math.max(0, Math.min(100, skillScore)),
      matchedSkills,
      missingSkills,
      yearsExp: appYears,
      requiredExp,
      eduScore: Math.max(0, Math.min(100, eduScore)),
      education: app.education || 'Not specified',
      cvKeywords
    };
  };
  
  const getJobForApp = (app) => {
    return jobs.find(j => j._id === (app.jobId?._id || app.jobId));
  };
  
  const filteredApps = applications.map(app => ({
    ...app,
    matchScore: calculateMatchScore(app, getJobForApp(app))
  })).filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesJob = jobFilter === 'all' || app.jobId?._id === jobFilter || app.jobId === jobFilter;
    const matchesSearch = !search || 
      app.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      app.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesJob && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'match') {
      return (b.matchScore?.score ?? 0) - (a.matchScore?.score ?? 0);
    } else if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'name') {
      return (a.userId?.name || '').localeCompare(b.userId?.name || '');
    } else if (sortBy === 'experience') {
      return (b.experience?.years || b.experience || 0) - (a.experience?.years || a.experience || 0);
    }
    return 0;
  });

  const handleStatusChange = async (appId, status, notifyOptions = {}) => {
    const app = applications.find(a => a._id === appId);
    if (!app) {
      showToast('Application not found', 'error');
      return;
    }
    
    setLoadingActions(prev => ({ ...prev, [appId]: status }));
    showToast(`Updating application...`, 'info');
    
    const res = await apiFetch(`/applications/${appId}/status`, {
      method: 'PUT', 
      body: JSON.stringify({ 
        status,
        sendEmail: notifyOptions.sendEmail !== undefined ? notifyOptions.sendEmail : true,
        sendInApp: notifyOptions.sendInApp !== undefined ? notifyOptions.sendInApp : true,
        customMessage: notifyOptions.customMessage || null,
        subject: notifyOptions.subject || null
      })
    });
    
    if (res.ok && res.data.success) {
      // Build detailed feedback message
      const result = res.data.notificationResult || {};
      const parts = [];
      
      // Application status
      parts.push(`Application ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'}`);
      
      // Notification results
      if (result.inAppNotificationSent) {
        parts.push('In-app notification sent');
      }
      if (result.emailSent) {
        parts.push('Email sent');
      }
      if (result.inAppNotificationError) {
        parts.push('In-app notification failed');
      }
      if (result.emailError) {
        parts.push('Email failed');
      }
      
      // Show success with details
      if (result.emailSent && result.inAppNotificationSent) {
        showToast(`${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}! Email & notification sent to applicant.`, 'success');
      } else if (result.emailSent) {
        showToast(`${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}! Email sent to applicant.`, 'success');
      } else if (result.inAppNotificationSent) {
        showToast(`${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}! Notification sent to applicant.`, 'success');
      } else if (result.emailError || result.inAppNotificationError) {
        showToast(`${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Updated'}! But notification had issues.`, 'warning');
      } else {
        showToast(`Application ${status}!`, 'success');
      }
      
      console.log('Application update result:', res.data);
      fetchApplications();
      setLoadingActions(prev => {
        const { [appId]: _, ...rest } = prev;
        return rest;
      });
    } else {
      console.error('Application update failed:', res.data);
      showToast(res.data?.message || 'Failed to update application', 'error');
      setLoadingActions(prev => {
        const { [appId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleBulkStatus = async (status, notifyOptions = {}) => {
    if (selectedApps.length === 0) return;
    
    setLoadingActions(prev => ({ ...prev, bulk: status }));
    showToast(`Processing ${selectedApps.length} applications...`, 'info');
    
    let successCount = 0;
    let emailSentCount = 0;
    let notificationSentCount = 0;
    let failedCount = 0;
    
    for (const appId of selectedApps) {
      const res = await apiFetch(`/applications/${appId}/status`, {
        method: 'PUT', 
        body: JSON.stringify({ 
          status,
          sendEmail: notifyOptions.sendEmail !== undefined ? notifyOptions.sendEmail : true,
          sendInApp: notifyOptions.sendInApp !== undefined ? notifyOptions.sendInApp : true,
          customMessage: notifyOptions.customMessage || null,
          subject: notifyOptions.subject || null
        })
      });
      
      if (res.ok && res.data.success) {
        successCount++;
        const result = res.data.notificationResult || {};
        if (result.emailSent) emailSentCount++;
        if (result.inAppNotificationSent) notificationSentCount++;
      } else {
        failedCount++;
      }
    }
    
    // Build feedback message
    let message = '';
    if (failedCount === 0) {
      message = `${successCount} application${successCount > 1 ? 's' : ''} ${status}`;
      if (emailSentCount > 0 && notificationSentCount > 0) {
        message += `. ${emailSentCount} email${emailSentCount > 1 ? 's' : ''} & ${notificationSentCount} notification${notificationSentCount > 1 ? 's' : ''} sent`;
      } else if (emailSentCount > 0) {
        message += `. ${emailSentCount} email${emailSentCount > 1 ? 's' : ''} sent`;
      } else if (notificationSentCount > 0) {
        message += `. ${notificationSentCount} notification${notificationSentCount > 1 ? 's' : ''} sent`;
      }
      message += '.';
      showToast(message, 'success');
    } else {
      message = `${successCount} succeeded, ${failedCount} failed`;
      showToast(message, failedCount > successCount ? 'error' : 'warning');
    }
    
    setSelectedApps([]);
    fetchApplications();
    setLoadingActions(prev => {
      const { bulk: _, ...rest } = prev;
      return rest;
    });
  };

  const openNotifyModal = (app, type) => {
    setNotifyTarget(app);
    setNotifyType(type);
    setShowNotifyModal(true);
  };

  const confirmNotify = async (options) => {
    if (!notifyTarget || !notifyType) return;
    
    if (notifyType === 'approve') {
      await handleStatusChange(notifyTarget._id, 'approved', options);
    } else if (notifyType === 'reject') {
      await handleStatusChange(notifyTarget._id, 'rejected', options);
    }
    
    setShowNotifyModal(false);
    setNotifyTarget(null);
    setNotifyType(null);
  };

  const confirmBulkNotify = async (status, options) => {
    await handleBulkStatus(status, options);
    setShowNotifyModal(false);
    setNotifyTarget(null);
    setNotifyType(null);
  };

  const toggleSelect = (appId) => {
    setSelectedApps(prev => prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]);
  };

  const toggleSelectAll = () => {
    if (selectedApps.length === filteredApps.length) {
      setSelectedApps([]);
    } else {
      setSelectedApps(filteredApps.map(a => a._id));
    }
  };

  const handleAddToTalentPool = async (app) => {
    const res = await apiFetch('/talent-pool', {
      method: 'POST',
      body: JSON.stringify({ userId: app.userId?._id || app.userId, source: 'application', jobId: app.jobId?._id })
    });
    if (res.ok && res.data.success) {
      showToast('Added to talent pool!', 'success');
    }
  };

  const handleScheduleInterview = async (applicant, formEvent) => {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.target);
    
    const dateTime = new Date(`${formData.get('scheduledDate')}T${formData.get('scheduledTime')}`);
    const interviewData = {
      candidateId: applicant.userId?._id || applicant.userId,
      jobId: formData.get('jobId'),
      scheduledDate: dateTime,
      type: formData.get('type') || 'video',
      location: formData.get('location') || undefined,
      meetingLink: formData.get('meetingLink') || undefined,
      notes: formData.get('notes') || undefined,
      status: 'scheduled',
      title: `Interview - ${applicant.jobId?.title || 'Position'}`,
      duration: parseInt(formData.get('duration') || 60),
      reminder: { enabled: true, beforeMinutes: parseInt(formData.get('reminder') || 30) }
    };

    setScheduling(true);
    const res = await apiFetch('/interview/schedule', { method: 'POST', body: JSON.stringify(interviewData) });
    if (res.ok && res.data.success) {
      showToast('Interview scheduled successfully!', 'success');
      setShowScheduleModal(false);
      fetchApplications();
    } else {
      showToast(res.data?.message || 'Failed to schedule interview', 'error');
    }
    setScheduling(false);
  };

  const findAIMatches = async (job) => {
    if (!job || !job._id) return;
    
    setLoadingMatches(true);
    setShowAIMatchModal(true);
    
    try {
      const currentToken = localStorage.getItem('token') || token;
      
      const res = await fetch(`${import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api'}/ai-matching/screening/screen-job-candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({ jobId: job._id })
      });
      
      const data = await res.json();
      
      if (data.success && data.results) {
        const matchedApps = applications
          .filter(app => (app.jobId?._id || app.jobId) === job._id)
          .map(app => {
            const aiResult = data.results.find(r => 
              r.candidateId === app._id || 
              r.candidateId === app.userId?._id
            );
            
            if (aiResult) {
              return {
                ...app,
                matchScore: {
                  score: aiResult.overallScore || 0,
                  skillScore: aiResult.skillsMatch?.score || 0,
                  matchedSkills: aiResult.skillsMatch?.matchedSkills || [],
                  missingSkills: aiResult.skillsMatch?.missingSkills || [],
                  yearsExp: aiResult.experienceMatch?.yearsCandidate || 0,
                  requiredExp: aiResult.experienceMatch?.yearsRequired || 0,
                  eduScore: aiResult.educationMatch?.score || 0,
                  education: aiResult.educationMatch?.candidate || 'Not specified',
                  cvKeywords: aiResult.resumeAnalysis?.keywordsFound || [],
                  aiData: aiResult
                },
                matchReasons: [
                  ...(aiResult.strengths || []).slice(0, 2),
                  aiResult.recommendation
                ].filter(Boolean)
              };
            }
            
            return app;
          })
          .sort((a, b) => (b.matchScore?.score || 0) - (a.matchScore?.score || 0));
        
        setAiMatches(matchedApps);
      } else {
        if (showToast) showToast('Using local matching', 'info');
        const normalizeText = (text) => String(text || '').toLowerCase().replace(/[^\w\s]/g, '');
        
        const calculateSkillMatch = (applicantSkills, jobSkills) => {
          const normalizedJobSkills = (jobSkills || []).map(s => normalizeText(s));
          const normalizedAppSkills = Array.isArray(applicantSkills) 
            ? applicantSkills.map(s => normalizeText(s))
            : [];
          
          const matched = [];
          const missing = [];
          
          for (const jobSkill of normalizedJobSkills) {
            const found = normalizedAppSkills.find(appSkill => 
              appSkill.includes(jobSkill) || jobSkill.includes(appSkill)
            );
            if (found) matched.push(jobSkill);
            else missing.push(jobSkill);
          }
          
          const score = normalizedJobSkills.length > 0 
            ? Math.round((matched.length / normalizedJobSkills.length) * 100) 
            : 50;
          
          return { 
            score: isNaN(score) ? 0 : score, 
            matched, 
            missing,
            matchedCount: matched.length,
            totalRequired: normalizedJobSkills.length
          };
        };
        
        const matchedApps = applications
          .filter(app => app.jobId?._id === job._id || app.jobId === job._id)
          .map(app => {
            const skillMatch = calculateSkillMatch(app.skills, job.skills || job.requirements?.skills);
            let overallScore = Math.round(skillMatch.score);
            
            return {
              ...app,
              matchScore: {
                score: overallScore,
                skillScore: skillMatch.score,
                matchedSkills: skillMatch.matched,
                missingSkills: skillMatch.missing,
                yearsExp: parseInt(app.experience?.years || app.experience || '0'),
                requiredExp: 0,
                eduScore: 75,
                education: app.education || 'Not specified',
                cvKeywords: []
              }
            };
          })
          .sort((a, b) => b.matchScore.score - a.matchScore.score);
        
        setAiMatches(matchedApps);
      }
    } catch (error) {
      console.error('AI Match Error:', error);
      if (showToast) showToast('Error running AI analysis', 'error');
      setAiMatches([]);
    }
    
    setLoadingMatches(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending', bg: 'bg-slate-950', text: 'text-white', dot: 'bg-amber-400' },
      reviewed: { label: 'Reviewed', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-400' },
      approved: { label: 'Approved', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
      rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400' },
    };
    return configs[status] || configs.pending;
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-amber-600 bg-amber-100';
    return 'text-slate-600 bg-slate-100';
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

  const statCards = [
    { label: 'Total Applicants', value: applications.length, icon: Users, color: 'slate' },
    { label: 'Pending Review', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'amber' },
    { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: CheckCircle, color: 'emerald' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, icon: XCircle, color: 'red' }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-slate-950 mx-auto mb-3" />
          <p className="text-slate-700 text-sm font-medium">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Applicants</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage candidates for your positions</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAIMatchModal(true)} 
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20"
          >
            <Brain className="w-4 h-4" /> AI Match
          </button>
          <button onClick={() => setShowAIMatching?.(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
            <Sparkles className="w-4 h-4" /> Smart Search
          </button>
        </div>
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
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400" />
          </div>
          <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
            <option value="all">All Jobs</option>
            {jobs.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
            <option value="match">Best Match</option>
            <option value="newest">Newest First</option>
            <option value="experience">Most Experience</option>
            <option value="name">Name A-Z</option>
          </select>
          <div className="flex gap-1">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApps.length > 0 && (
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">{selectedApps.length} selected</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setNotifyTarget(selectedApps.map(id => applications.find(a => a._id === id))); setNotifyType('bulk-approve'); setShowNotifyModal(true); }} 
              disabled={loadingActions.bulk === 'approved'}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:bg-emerald-400"
            >
              {loadingActions.bulk === 'approved' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> Approve All
                </>
              )}
            </button>
            <button 
              onClick={() => { setNotifyTarget(selectedApps.map(id => applications.find(a => a._id === id))); setNotifyType('bulk-reject'); setShowNotifyModal(true); }} 
              disabled={loadingActions.bulk === 'rejected'}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:bg-red-400"
            >
              {loadingActions.bulk === 'rejected' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" /> Reject All
                </>
              )}
            </button>
            <button onClick={() => setSelectedApps([])} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors">Clear</button>
          </div>
        </div>
      )}

      {/* Applicants List */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-950 mb-1">No applicants found</h3>
          <p className="text-slate-600 text-sm">Try adjusting your filters or wait for new applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const isSelected = selectedApps.includes(app._id);
            const statusConfig = getStatusConfig(app.status);
            
            return (
              <div key={app._id} className={`bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-slate-950' : 'border border-slate-200'}`}>
                <div className="p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${statusConfig.bg}`}>
                        {getInitials(app.userId?.name)}
                      </div>
                      {Number(app.matchScore?.score) > 0 && (
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow ${
                          Number(app.matchScore?.score) >= 80 ? 'bg-emerald-500' : 
                          Number(app.matchScore?.score) >= 60 ? 'bg-amber-500' : 
                          'bg-slate-400'
                        }`}>
                          {Number(app.matchScore?.score) || 0}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-slate-950 truncate">{app.userId?.name || 'Applicant'}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${statusConfig.bg} ${statusConfig.text}`}>{statusConfig.label}</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {app.jobId?.title || 'Position'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.userId?.email}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                      <div className="text-center">
                        <p className="font-bold text-slate-950">{app.experience?.years || app.experience || 0}</p>
                        <p className="text-[10px] text-slate-500">Years</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-950">{Array.isArray(app.skills) ? app.skills.length : 0}</p>
                        <p className="text-[10px] text-slate-500">Skills</p>
                      </div>
                      {Number(app.matchScore?.score) > 0 && (
                        <div className="text-center">
                          <p className={`font-bold ${Number(app.matchScore?.score) >= 80 ? 'text-emerald-600' : Number(app.matchScore?.score) >= 60 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {Number(app.matchScore?.score) || 0}%
                          </p>
                          <p className="text-[10px] text-slate-500">Match</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3 ml-16">
                    {Array.isArray(app.skills) && app.skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md">{skill}</span>
                    ))}
                    {Array.isArray(app.skills) && app.skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md">+{app.skills.length - 4}</span>
                    )}
                  </div>
                </div>
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button onClick={() => setShowApplicant?.(app)} className="px-3 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-800 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => setShowMessage?.({ open: true, recipient: app })} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Message
                  </button>
                  <button onClick={() => { setSchedulingApplicant(app); setShowScheduleModal(true); }} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors">
                    <Calendar className="w-3.5 h-3.5" /> Schedule
                  </button>
                  {app.status !== 'approved' ? (
                    <button 
                      onClick={() => openNotifyModal(app, 'approve')} 
                      disabled={loadingActions[app._id] === 'approved'}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors"
                    >
                      {loadingActions[app._id] === 'approved' ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving...</>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Approve</>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange(app._id, 'pending')} 
                      disabled={loadingActions[app._id] === 'pending'}
                      className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-amber-200 disabled:bg-amber-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Revert
                    </button>
                  )}
                  {app.status !== 'rejected' && (
                    <button 
                      onClick={() => openNotifyModal(app, 'reject')} 
                      disabled={loadingActions[app._id] === 'rejected'}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-red-200 disabled:bg-red-300 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                  <button onClick={() => handleAddToTalentPool(app)} className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-violet-200 transition-colors">
                    <UserPlus className="w-3.5 h-3.5" /> Talent Pool
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

{/* AI Match Modal */}
      {showAIMatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Candidate Matching</h3>
                </div>
              </div>
              <button onClick={() => setShowAIMatchModal(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Job */}
            <div className="px-5 py-3 border-b border-slate-200 flex-shrink-0">
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400"
                onChange={(e) => e.target.value && findAIMatches(jobs.find(j => j._id === e.target.value))}
              >
                <option value="">Select a job position to analyze...</option>
                {jobs.filter(j => j.status === 'active').map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-5">
              {loadingMatches ? (
                <div className="flex items-center justify-center py-16">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-3 border-slate-200 rounded-full" />
                    <div className="absolute inset-0 border-3 border-transparent border-t-slate-900 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-slate-900" />
                    </div>
                  </div>
                </div>
              ) : aiMatches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Select a job to analyze candidates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-600">{aiMatches.length} candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-slate-600">{aiMatches.filter(a => Number(a.matchScore?.score) >= 70).length} good matches</span>
                    </div>
                  </div>

                  {/* Candidates */}
                  {aiMatches.map((app, index) => {
                    const score = Number(app.matchScore?.score) || 0;
                    const isTopMatch = index === 0 && score >= 70;
                    
                    return (
                      <div key={app._id} className={`p-4 rounded-xl border ${isTopMatch ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${score >= 80 ? 'bg-slate-900' : score >= 60 ? 'bg-slate-600' : 'bg-slate-400'}`}>
                            {getInitials(app.userId?.name)}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900 text-sm truncate">{app.userId?.name || 'Applicant'}</h4>
                              {isTopMatch && <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded">Top</span>}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{app.userId?.email}</p>
                          </div>
                          
                          {/* Score */}
                          <div className="text-right">
                            <div className={`text-xl font-black ${score >= 80 ? 'text-slate-900' : score >= 60 ? 'text-slate-600' : 'text-slate-400'}`}>
                              {score}%
                            </div>
                            <p className="text-[10px] text-slate-400">match</p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1.5">
                            <button onClick={() => { setShowApplicant?.(app); setShowAIMatchModal(false); }} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg" title="View">
                              <Eye className="w-4 h-4 text-slate-600" />
                            </button>
                            <button onClick={() => openNotifyModal(app, 'approve')} className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg" title="Approve">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mt-3 ml-13">
                          {app.matchScore?.matchedSkills?.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">{skill}</span>
                          ))}
                          {app.matchScore?.missingSkills?.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">{skill}</span>
                          ))}
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

      {/* Schedule Interview Modal */}
      {showScheduleModal && schedulingApplicant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Schedule Interview</h3>
                    <p className="text-slate-400 text-sm">{schedulingApplicant.userId?.name || 'Candidate'}</p>
                  </div>
                </div>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleScheduleInterview(schedulingApplicant, e.target); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-950 mb-1.5">Position <span className="text-red-500">*</span></label>
                <select name="jobId" required defaultValue={schedulingApplicant.jobId?._id || schedulingApplicant.jobId}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400">
                  <option value="">Select position</option>
                  {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Date <span className="text-red-500">*</span></label>
                  <input type="date" name="scheduledDate" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Time <span className="text-red-500">*</span></label>
                  <input type="time" name="scheduledTime" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Type</label>
                  <select name="type" defaultValue="video" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400">
                    <option value="video">Video Call</option>
                    <option value="phone">Phone</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-950 mb-1.5">Duration</label>
                  <select name="duration" defaultValue="60" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 focus:outline-none focus:border-slate-400">
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-950 mb-1.5">Meeting Link</label>
                <input type="url" name="meetingLink" placeholder="Zoom, Google Meet..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-950 mb-1.5">Notes</label>
                <textarea name="notes" placeholder="Interview agenda..." rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400 resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} disabled={scheduling} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={scheduling} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5 disabled:bg-emerald-300">
                  {scheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" /> Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotifyModal && notifyTarget && (
        <NotificationModal
          type={notifyType}
          applicant={notifyTarget}
          jobs={jobs}
          onConfirm={(options) => {
            if (selectedApps.length > 1 && (notifyType === 'approve' || notifyType === 'reject')) {
              confirmBulkNotify(notifyType === 'approve' ? 'approved' : 'rejected', options);
            } else {
              confirmNotify(options);
            }
          }}
          onClose={() => {
            setShowNotifyModal(false);
            setNotifyTarget(null);
            setNotifyType(null);
          }}
        />
      )}
    </div>
  );
};

// Notification Modal Component
function NotificationModal({ type, applicant, jobs, onConfirm, onClose }) {
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('approve');

  const isBulk = type?.startsWith('bulk-');
  const actionType = isBulk ? type.replace('bulk-', '') : type;
  const applicants = isBulk ? applicant : [applicant];
  const firstApplicant = isBulk ? applicants[0] : applicant;
  const applicantName = isBulk ? `${applicants.length} applicants` : (firstApplicant?.userId?.name || 'Applicant');
  const firstName = firstApplicant?.userId?.name?.split(' ')[0] || 'Applicant';
  const jobTitle = isBulk ? 'their positions' : (firstApplicant?.jobId?.title || 'the position');

  const templates = {
    approve: {
      label: 'Application Approved',
      subject: 'Your Application Has Been Approved!',
      body: `Dear ${firstName},

Congratulations! We are pleased to inform you that your application for ${jobTitle} has been approved.

We were impressed with your qualifications and would like to move forward with your application. Our team will be in touch shortly with the next steps in the hiring process.

Thank you for your interest in joining our team. We look forward to speaking with you soon!

Best regards,
The Hiring Team`
    },
    reject: {
      label: 'Application Not Selected',
      subject: 'Update on Your Application',
      body: `Dear ${firstName},

Thank you for your interest in ${jobTitle} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs. This was a difficult decision as we received many strong applications.

We encourage you to apply for future positions that match your skills and experience. We will keep your information on file for upcoming opportunities.

We wish you the best in your career journey.

Best regards,
The Hiring Team`
    },
    interview: {
      label: 'Interview Invitation',
      subject: 'Interview Invitation - ' + jobTitle,
      body: `Dear ${firstName},

We are pleased to inform you that your application has caught our attention! We would like to invite you for an interview.

Your qualifications and experience align well with what we are looking for, and we believe you would be a great addition to our team.

Please reply with your available dates and times within the next 48 hours so we can schedule the interview at your convenience.

If you have any questions, please don't hesitate to reach out.

Best regards,
The Hiring Team`
    }
  };

  const getDefaultMessage = () => {
    return templates[selectedTemplate]?.body || templates.approve.body;
  };

  useEffect(() => {
    if (actionType === 'approve') setSelectedTemplate('approve');
    else if (actionType === 'reject') setSelectedTemplate('reject');
    else setSelectedTemplate('approve');
  }, [actionType]);

  useEffect(() => {
    setCustomMessage(getDefaultMessage());
  }, [selectedTemplate, firstName, jobTitle]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      sendEmail,
      sendInApp,
      customMessage: customMessage || null,
      subject: templates[selectedTemplate]?.subject || 'Message from Hiring Team'
    });
  };

  const statusLabel = actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Update';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`bg-slate-950 p-4 sm:p-6 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${actionType === 'approve' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {actionType === 'approve' ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">{statusLabel} {isBulk ? `${applicants.length} Applicants` : 'Applicant'}</h3>
                <p className="text-slate-400 text-xs sm:text-sm truncate">{applicantName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Notification Options */}
          <div>
            <label className="block text-sm font-semibold text-slate-950 mb-2 sm:mb-3">Send Notification Via</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <label className={`relative flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${sendEmail ? 'border-slate-950 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="sr-only" />
                <Mail className={`w-4 h-4 sm:w-5 sm:h-5 ${sendEmail ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className={`font-medium text-xs sm:text-sm ${sendEmail ? 'text-slate-950' : 'text-slate-500'}`}>Email</span>
                {sendEmail && <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full" />}
              </label>
              <label className={`relative flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${sendInApp ? 'border-slate-950 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="checkbox" checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)} className="sr-only" />
                <BellRing className={`w-4 h-4 sm:w-5 sm:h-5 ${sendInApp ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className={`font-medium text-xs sm:text-sm ${sendInApp ? 'text-slate-950' : 'text-slate-500'}`}>In-App</span>
                {sendInApp && <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-emerald-500 rounded-full" />}
              </label>
            </div>
            {(!sendEmail && !sendInApp) && (
              <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> No notification will be sent
              </p>
            )}
          </div>

          {/* Message Template Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-950 mb-2">Message Template</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTemplate(key)}
                  className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedTemplate === key 
                      ? 'bg-slate-950 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {template.label}
                </button>
              ))}
            </div>
            {sendEmail && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-500 mb-1">Subject Line</label>
                <input 
                  type="text" 
                  value={templates[selectedTemplate]?.subject || ''}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-950"
                  readOnly
                />
              </div>
            )}
            <textarea 
              value={customMessage} 
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              placeholder="Enter your message..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400 resize-none font-mono"
            />
          </div>

          {/* Preview */}
          {(sendEmail || sendInApp) && customMessage && (
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</span>
              </div>
              {sendEmail && (
                <p className="text-xs font-semibold text-slate-700 mb-2">Subject: {templates[selectedTemplate]?.subject}</p>
              )}
              <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line max-h-40 overflow-y-auto">{customMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className={`flex-1 py-2.5 sm:py-3 ${actionType === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : actionType === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-950 hover:bg-slate-800'} text-white rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2`}>
              {actionType === 'approve' ? <CheckCircle className="w-4 h-4" /> : actionType === 'reject' ? <XCircle className="w-4 h-4" /> : null}
              {statusLabel} {sendEmail || sendInApp ? '& Notify' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
