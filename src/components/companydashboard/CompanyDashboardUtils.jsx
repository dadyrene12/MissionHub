import React, { useState, useEffect } from 'react';
import { 
  Loader2, X, CheckCircle, XCircle, AlertCircle, Bell, Search,
  FileText, FileText as FileTextIcon, Mail, Phone, MapPin, Check, Brain, Wand2,
  Calendar, Eye, Briefcase, Users, Video, Activity, TrendingUp, 
  Star, GraduationCap, CreditCard, Settings, BellRing, AlertTriangle,
  Linkedin, Github, ExternalLink, FileUp, Trash2, Edit2, Cpu, 
  Clock, Globe, User, Download, MessageSquare, Send, ChevronRight,
  MessageCircle, ThumbsUp, ThumbsDown, ExternalLink as ExternalLinkIcon,
  Award, Grid, List, Bookmark, UserPlus
} from 'lucide-react';

// API Configuration
const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export const apiFetch = async (endpoint, options = {}, retries = 3) => {
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options, headers, signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.hash = '/login';
        return { ok: false, status: 401, data: { success: false, message: 'Session expired' } };
      }
      
      if (response.status === 429 && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
        continue;
      }
      
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      clearTimeout(timeout);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
        continue;
      }
      return { ok: false, status: 500, data: { success: false, message: error.message } };
    }
  }
  
  return { ok: false, status: 429, data: { success: false, message: 'Too many requests' } };
};

// Loading Spinner
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizes[size]} animate-spin text-slate-400`} />
    </div>
  );
};

// Toast Notification
export const Toast = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-rose-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    info: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  };
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] animate-slide-in-right flex items-center gap-3 max-w-md`}>
      {type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
      {type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
      {type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      {type === 'info' && <Bell className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 p-1 rounded-lg">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Badge Component
export const Badge = ({ children, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-slate-800/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    pink: 'bg-pink-500/20 text-pink-400',
    gray: 'bg-slate-500/20 text-slate-400',
    orange: 'bg-orange-500/20 text-orange-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses[color] || colorClasses.gray}`}>{children}</span>;
};

// PDF Viewer
export const PDFViewer = ({ url, title = 'Document' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  return (
    <div className="w-full h-full flex flex-col bg-slate-900 relative rounded-xl overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          <ExternalLinkIcon className="w-5 h-5 text-slate-400" />
        </a>
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-slate-500">Loading document...</p>
          </div>
        </div>
      )}
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <FileTextIcon className="w-16 h-16 text-slate-700 mb-4" />
          <p className="text-slate-500">Failed to load document</p>
          <a href={url} download className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Download
          </a>
        </div>
      ) : (
        <iframe src={url} title={title} className="flex-1 w-full" onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError(true); }} />
      )}
    </div>
  );
};

// Applicant Detail Modal - Clean White Design
export function ApplicantDetailModal({ isOpen, onClose, applicant, onAction, showNotification }) {
  const [loadingStates, setLoadingStates] = useState({
    message: false,
    schedule: false,
    talentpool: false,
    approved: false,
    rejected: false
  });
  const [resumeError, setResumeError] = useState(false);

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

  if (!isOpen || !applicant) return null;

  const user = applicant.userId || {};
  const profile = user.profile || {};
  
  const userPhone = user.phone || profile?.phone || '';
  const userLocation = user.city || profile?.location || profile?.location || '';
  const userSkills = user.skills || profile?.skills || [];
  const userExperience = user.experience || profile?.experience || '';
  const userEducation = user.education || profile?.education || '';
  const userBio = user.bio || profile?.bio || '';
  const userResume = user.resume || profile?.resume?.url || profile?.resume || '';
  
  const getResumeData = () => {
    const appResume = applicant.resume;
    const profileData = profile?.resume || profile?.cv || {};
    const userResumeData = user.resume || user.cv || {};
    if (typeof userResumeData === 'string' && userResumeData) return { name: userResumeData.split('/').pop() || 'Resume', url: userResumeData };
    if (appResume && typeof appResume === 'string' && appResume) return { name: appResume.split('/').pop() || 'Resume', url: appResume };
    if (appResume && (appResume.url || appResume.name)) return appResume;
    if (userResumeData && (userResumeData.url || userResumeData.name)) return userResumeData;
    if (profileData && (profileData.url || profileData.name)) return profileData;
    if (applicant.cv && (applicant.cv.url || applicant.cv.name)) return applicant.cv;
    if (applicant.coverLetter) return { name: 'Cover Letter', url: null, isCoverLetter: true, text: applicant.coverLetter };
    return null;
  };

  const resumeData = getResumeData();

  const handleViewCV = async () => {
    if (!resumeData?.url) {
      if (showNotification) showNotification('Resume file not available', 'error');
      return;
    }
    // Open URL directly - works for both R2 and local URLs
    window.open(resumeData.url, '_blank');
  };

  const handleDownloadCV = async () => {
    if (!resumeData?.url) {
      if (showNotification) showNotification('Resume file not available', 'error');
      return;
    }
    // If it's an R2 URL, it may not have CORS for download, so open instead
    if (resumeData.url.includes('dblivpykh') || resumeData.url.includes('workers.dev')) {
      window.open(resumeData.url, '_blank');
      return;
    }
    // For local URLs, try to download
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:5000" : 'https://missionhubbackend.onrender.com';
      const filename = resumeData.url.split('/').pop();
      const fullUrl = `${backendUrl}/api/resume/${filename}?token=${token}`;
      const res = await fetch(fullUrl);
      if (!res.ok) {
        if (showNotification) showNotification('Resume file not found', 'error');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resumeData?.name || 'resume.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open directly
      window.open(resumeData.url, '_blank');
    }
  };

  const statusConfig = {
    approved: { gradient: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Approved', border: 'border-emerald-200' },
    rejected: { gradient: 'from-red-500 to-rose-600', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Rejected', border: 'border-red-200' },
    reviewed: { gradient: 'from-blue-500 to-indigo-600', badge: 'bg-blue-100 text-blue-700', dot: 'bg-slate-800', label: 'Reviewed', border: 'border-blue-200' },
    pending: { gradient: 'from-amber-500 to-orange-500', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Pending', border: 'border-amber-200' },
  };
  const currentStatus = statusConfig[applicant.status] || statusConfig.pending;

  const skills = Array.isArray(applicant.skills) ? applicant.skills : 
               Array.isArray(profile.skills) ? profile.skills : 
               Array.isArray(user.skills) ? user.skills : [];
  
  const experienceYears = typeof applicant.experience === 'object' ? applicant.experience.years : 
                        typeof profile.experience === 'object' ? profile.experience.years :
                        parseInt(applicant.experience || profile.experience || user.experience || 0);
  
  const experienceSummary = typeof applicant.experience === 'object' ? applicant.experience.summary : 
                          typeof profile.experience === 'object' ? profile.experience.summary :
                          applicant.experience || profile.experience || user.experience || '';

  const educationDegree = typeof applicant.education === 'object' ? applicant.education.degree :
                       typeof profile.education === 'object' ? profile.education.degree :
                       applicant.education || profile.education || user.education || '';
  
  const phone = applicant.phone || profile.phone || user.phone || '';
  const location = applicant.location || profile.location || user.location || '';
  const email = applicant.userId?.email || user.email || applicant.email || '';
  const name = applicant.userId?.name || user.name || applicant.name || 'Unknown';
  const jobTitle = applicant.jobId?.title || applicant.jobTitle || 'Position';
  const bio = applicant.userId?.bio || profile.bio || user.bio || '';

  const handleAction = async (actionType, applicantData) => {
    setLoadingStates(prev => ({ ...prev, [actionType]: true }));
    try {
      if (onAction) await onAction(actionType, applicantData);
    } catch (error) {
      console.error(`Error in ${actionType} action:`, error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionType]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '92vh' }}>
        
        {/* Header - White */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                {getInitials(name)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                <p className="text-sm text-slate-600 font-medium">{jobTitle}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Applied {new Date(applicant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentStatus.badge}`}>
                    {currentStatus.label}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-slate-900">{skills.length}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase">Skills</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-slate-900">{experienceYears || 0}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase">Years Exp</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-slate-900 truncate">{educationDegree ? educationDegree.split(' ')[0] : 'N/A'}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase">Education</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-slate-900">{applicant.aiScreening ? applicant.aiScreening.overallScore || 0 : '--'}</p>
              <p className="text-xs text-slate-500 font-semibold uppercase">AI Score</p>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-2">About</h4>
              <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
            </div>
          )}

          {/* Contact & Education */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-xl p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Contact</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-900 font-medium">{email || 'Not provided'}</p>
                </div>
                {phone && (<div><p className="text-xs text-slate-500">Phone</p><p className="text-sm text-slate-900 font-medium">{phone}</p></div>)}
                {location && (<div><p className="text-xs text-slate-500">Location</p><p className="text-sm text-slate-900 font-medium">{location}</p></div>)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Education</h4>
              {educationDegree ? <p className="text-sm text-slate-700">{educationDegree}</p> : <p className="text-sm text-slate-500 italic">Not provided</p>}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (<span key={idx} className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg">{skill}</span>))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experienceSummary && (
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Experience</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{experienceSummary}</p>
            </div>
          )}

          {/* Resume */}
          {resumeData ? (
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Resume</h4>
              {resumeData.url ? (
                <div className="flex gap-2">
                  <button onClick={handleViewCV} className="flex-1 py-2.5 bg-slate-900 text-white text-sm rounded-xl font-semibold flex items-center justify-center gap-2">View</button>
                  <button onClick={handleDownloadCV} className="flex-1 py-2.5 bg-emerald-600 text-white text-sm rounded-xl font-semibold flex items-center justify-center gap-2">Download</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Cover letter on file</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{resumeData.text || applicant.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Resume</h4>
              <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg border border-dashed border-slate-300">
                <FileText className="w-6 h-6 text-slate-400" />
                <p className="text-sm text-slate-500">No resume attached</p>
              </div>
            </div>
          )}

          {/* AI Screening */}
          {applicant.aiScreening && (
            <div className="bg-slate-50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4">AI Score</h4>
              <div className="text-3xl font-black text-slate-900">{applicant.aiScreening.overallScore || 0}%</div>
              {applicant.aiScreening.summary && <p className="text-sm text-slate-600 mt-3">{applicant.aiScreening.summary}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <button onClick={() => handleAction('message', applicant)} disabled={loadingStates.message}
              className="flex-1 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 disabled:opacity-50">
              {loadingStates.message ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Message'}
            </button>
            <button onClick={() => handleAction('schedule', applicant)} disabled={loadingStates.schedule}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
              {loadingStates.schedule ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule'}
            </button>
            <button onClick={() => handleAction('approved', applicant)} disabled={loadingStates.approved}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
              {loadingStates.approved ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
            </button>
            <button onClick={() => handleAction('rejected', applicant)} disabled={loadingStates.rejected}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
              {loadingStates.rejected ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Templates Modal
export function MessageTemplatesModal({ isOpen, onClose, templates, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-slate-700">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Message Templates</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid gap-3">
            {templates.map((template) => (
              <button key={template.id} onClick={() => { onSelect?.(template); onClose(); }}
                className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-left transition-colors border border-slate-700 hover:border-slate-600">
                <h4 className="font-semibold text-white mb-1">{template.name}</h4>
                <p className="text-slate-500 text-sm line-clamp-2">{template.body.substring(0, 100)}...</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Send Message Modal
export function SendMessageModal({ isOpen, onClose, recipient, templates, onSend }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (recipient) {
      setSubject('');
      setBody('');
    }
  }, [recipient]);

  const handleSend = async () => {
    if (!body.trim()) return;
    setSending(true);
    const success = await onSend?.(recipient, subject, body);
    if (success) onClose();
    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Send Message</h3>
                {recipient && <p className="text-white/80 text-sm mt-0.5">To: {recipient.userId?.name || recipient.name || 'Recipient'}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none" />
          </div>

          {templates && templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button key={t.id} onClick={() => { setSubject(t.subject); setBody(t.body); }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-600 text-sm rounded-lg font-medium transition-all">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={handleSend} disabled={!body.trim() || sending}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Matching Modal
export function AIMatchingModal({ isOpen, onClose, jobs, applications, onMatch }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [filterScore, setFilterScore] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeText = (text) => String(text || '').toLowerCase().replace(/[^\w\s]/g, '');

  const findMatches = (jobId) => {
    setLoading(true);
    setTimeout(() => {
      const job = jobs.find(j => j._id === jobId);
      if (!job) {
        setMatches([]);
        setLoading(false);
        return;
      }
      
      const jobSkills = (job.skills || job.requirements?.skills || []).map(s => normalizeText(s));
      const jobExp = parseInt(job.experience) || parseInt(job.requirements?.minExperience) || 0;
      const jobEdu = job.requirements?.education || '';
      
      const levels = { 'high school': 1, 'associate': 2, 'bachelor': 3, 'bachelors': 3, 'masters': 4, 'master': 4, 'mba': 4, 'phd': 5, 'doctoral': 5, 'doctorate': 5 };
      const requiredLevel = levels[normalizeText(jobEdu)] || 2;
      
      const jobApps = applications.filter(a => a.jobId?._id === jobId || a.jobId === jobId);
      const matched = jobApps.map(app => {
        const appSkills = (app.skills || []).map(s => normalizeText(s));
        const matchedSkills = jobSkills.filter(js => 
          appSkills.some(as => as.includes(js) || js.includes(as))
        );
        const missingSkills = jobSkills.filter(js => 
          !appSkills.some(as => as.includes(js) || js.includes(as))
        );
        
        const appYears = parseInt(app.experience?.years || app.experience || '0') || 0;
        let expScore = 100;
        if (jobExp > 0) {
          expScore = appYears >= jobExp 
            ? Math.min(100 + (appYears - jobExp) * 2, 100) 
            : Math.round((appYears / jobExp) * 100);
        }
        
        const appLevel = levels[normalizeText(app.education)] || 2;
        const eduScore = appLevel >= requiredLevel ? 100 : Math.round((appLevel / requiredLevel) * 100);
        
        const skillScore = jobSkills.length > 0 
          ? Math.round((matchedSkills.length / jobSkills.length) * 100) 
          : 50;
        
        const overallScore = Math.round(
          (skillScore * 0.50) +
          (expScore * 0.30) +
          (eduScore * 0.20)
        );
        
        const validScore = Number(overallScore) || 0;
        
        return {
          app,
          score: Math.max(0, Math.min(100, validScore)),
          skillScore: Math.max(0, Math.min(100, skillScore)),
          expScore: Math.max(0, Math.min(100, expScore)),
          eduScore: Math.max(0, Math.min(100, eduScore)),
          matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          status: validScore >= 85 ? 'Excellent' : validScore >= 70 ? 'Good' : validScore >= 50 ? 'Fair' : 'Low',
          yearsExp: appYears,
          requiredExp: jobExp,
          education: app.education || 'Not specified',
          appliedDate: app.createdAt
        };
      }).sort((a, b) => b.score - a.score);
      
      setMatches(matched);
      setLoading(false);
    }, 800);
  };

  const filteredMatches = matches.filter(m => {
    if (filterScore === 'all') return true;
    if (filterScore === 'high') return m.score >= 85;
    if (filterScore === 'medium') return m.score >= 70 && m.score < 85;
    if (filterScore === 'low') return m.score < 70;
    return true;
  }).filter(m => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (m.app.userId?.name || '').toLowerCase().includes(search) ||
           (m.app.userId?.email || '').toLowerCase().includes(search);
  }).sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'experience') return b.yearsExp - a.yearsExp;
    if (sortBy === 'name') return (a.app.userId?.name || '').localeCompare(b.app.userId?.name || '');
    if (sortBy === 'date') return new Date(b.appliedDate) - new Date(a.appliedDate);
    return 0;
  });

  const getScoreColor = (score) => {
    if (score >= 85) return { text: 'text-emerald-600', bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 70) return { text: 'text-blue-600', bg: 'bg-slate-800', light: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-slate-600', bg: 'bg-slate-500', light: 'bg-slate-50', border: 'border-slate-200' };
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-950">Smart Search</h3>
                <p className="text-slate-500 text-sm">AI-powered candidate matching based on skills, experience & education</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-950 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-5 border-b border-slate-200 bg-white space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-950 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Select Job Position
              </label>
              <select onChange={(e) => { setSelectedJob(e.target.value); findMatches(e.target.value); setSearchTerm(''); }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400">
                <option value="">Choose a job to analyze...</option>
                {jobs.filter(j => j.status === 'active').map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>
            {matches.length > 0 && (
              <>
                <div className="w-48">
                  <label className="block text-sm font-semibold text-slate-950 mb-2">Filter by Score</label>
                  <select value={filterScore} onChange={(e) => setFilterScore(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400">
                    <option value="all">All Candidates</option>
                    <option value="high">Excellent (85%+)</option>
                    <option value="medium">Good (70-84%)</option>
                    <option value="low">Below 70%</option>
                  </select>
                </div>
                <div className="w-40">
                  <label className="block text-sm font-semibold text-slate-950 mb-2">Sort by</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400">
                    <option value="score">Best Match</option>
                    <option value="experience">Experience</option>
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              </>
            )}
          </div>
          {matches.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:border-slate-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-slate-950 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-slate-950 animate-pulse" />
                </div>
              </div>
              <p className="text-slate-950 font-semibold text-lg">Analyzing Candidates...</p>
              <p className="text-slate-500 text-sm mt-1">Matching skills, experience & education</p>
            </div>
          )}

          {!loading && selectedJob && matches.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-950" />
              </div>
              <p className="text-slate-950 font-semibold text-lg">No applicants for this job</p>
              <p className="text-slate-500 text-sm mt-1">Post your job and wait for applications</p>
            </div>
          )}

          {!loading && !selectedJob && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-slate-950" />
              </div>
              <p className="text-slate-950 font-semibold text-lg">Select a job to find matches</p>
              <p className="text-slate-500 text-sm mt-1">Choose from your active job postings</p>
            </div>
          )}

          {!loading && matches.length > 0 && (
            <>
              {/* Stats Header */}
              <div className="flex items-center justify-between mb-5 bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">{filteredMatches.length}</p>
                    <p className="text-xs text-slate-500">of {matches.length} candidates shown</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-950 text-white text-xs font-semibold rounded-full">
                    Powered by AI
                  </span>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>
                      <Grid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMatches.map((match, idx) => {
                    const colors = getScoreColor(match.score);
                    const isTopMatch = idx === 0 && match.score >= 70;
                    return (
                      <div key={idx} className={`relative bg-white rounded-2xl border transition-all hover:shadow-lg hover:border-slate-300 ${isTopMatch ? 'border-slate-950 ring-2 ring-slate-200' : 'border-slate-200'}`}>
                        {isTopMatch && (
                          <div className="absolute -top-3 left-4 px-3 py-1 bg-slate-950 text-white text-xs font-bold rounded-full z-10">
                            Top Match
                          </div>
                        )}
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                              <div className="w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {getInitials(match.app.userId?.name)}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white ${colors.bg}`}>
                                {match.score || 0}%
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-950 truncate">{match.app.userId?.name || 'Applicant'}</h4>
                                {isTopMatch && <Award className="w-4 h-4 text-slate-950" />}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{match.app.userId?.email}</p>
                            </div>
                          </div>
                          
                          {/* Overall Score */}
                          <div className="text-center mb-4">
                            <div className={`text-4xl font-black ${colors.text}`}>{match.score || 0}%</div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Match Score</p>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                            <div className={`h-full rounded-full transition-all ${colors.bg}`} style={{ width: `${match.score || 0}%` }} />
                          </div>
                          
                          {/* Score Breakdown */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className={`p-2 rounded-lg border ${colors.light} ${colors.border}`}>
                              <p className={`text-lg font-bold ${colors.text}`}>{match.skillScore || 0}%</p>
                              <p className="text-[9px] text-slate-500">Skills</p>
                            </div>
                            <div className={`p-2 rounded-lg border ${colors.light} ${colors.border}`}>
                              <p className={`text-lg font-bold ${colors.text}`}>{match.yearsExp || 0}</p>
                              <p className="text-[9px] text-slate-500">Years</p>
                            </div>
                            <div className={`p-2 rounded-lg border ${colors.light} ${colors.border}`}>
                              <p className={`text-lg font-bold ${colors.text}`}>{match.eduScore || 0}%</p>
                              <p className="text-[9px] text-slate-500">Education</p>
                            </div>
                          </div>
                          
                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.matchedSkills.slice(0, 4).map((s, i) => (
                              <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] rounded-lg font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> {s}
                              </span>
                            ))}
                            {match.missingSkills.slice(0, 2).map((s, i) => (
                              <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] rounded-lg font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {s}
                              </span>
                            ))}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2 pt-3 border-t border-slate-100">
                            <button onClick={() => onMatch?.(match)} className="flex-1 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                              <Eye className="w-4 h-4" /> View
                            </button>
                            <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-xl transition-all" title="Save to talent pool">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {filteredMatches.map((match, idx) => {
                    const colors = getScoreColor(match.score);
                    const isTopMatch = idx === 0 && match.score >= 70;
                    return (
                      <div key={idx} className={`relative bg-white rounded-2xl border transition-all hover:shadow-lg hover:border-slate-300 ${isTopMatch ? 'border-slate-950' : 'border-slate-200'}`}>
                        <div className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-white font-bold">
                                {getInitials(match.app.userId?.name)}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white ${colors.bg}`}>
                                {match.score || 0}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-950 truncate">{match.app.userId?.name || 'Applicant'}</h4>
                                {isTopMatch && <span className="px-2 py-0.5 bg-slate-950 text-white text-[10px] font-bold rounded-full">Top Match</span>}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {match.app.userId?.email}</span>
                                <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {match.yearsExp || 0} years</span>
                                <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {match.education}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`text-2xl font-black ${colors.text}`}>{match.score || 0}%</div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Match</p>
                              </div>
                              <button onClick={() => onMatch?.(match)} className="p-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-all">
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3 ml-16">
                            {match.matchedSkills.slice(0, 5).map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-lg font-medium">{s}</span>
                            ))}
                            {match.missingSkills.slice(0, 3).map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-lg font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
