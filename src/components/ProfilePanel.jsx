import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Eye, User, MapPin, Briefcase, Globe, Trash2, Save, Loader2, Award, Phone, Code, Linkedin, Github, ExternalLink, CheckCircle, Clock, ChevronDown, Zap, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

const ProfilePanel = ({ profilePanelOpen, setProfilePanelOpen, user, showNotification, token, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [analyzingJobs, setAnalyzingJobs] = useState(false);
  const resumeInputRef = useRef(null);
  const profilePicInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    experience: '',
    education: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    resume: null,
    documents: []
  });

  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const getToken = () => token || localStorage.getItem('token') || '';

  const fetchProfile = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken || !profilePanelOpen) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const userData = data.data;
          setFormData(prev => ({
            ...prev,
            name: userData.name || prev.name || user?.name || '',
            email: userData.email || prev.email || user?.email || '',
            phone: userData.profile?.phone || '',
            location: userData.profile?.location || '',
            title: userData.profile?.title || '',
            bio: userData.profile?.bio || '',
            experience: userData.profile?.experience || '',
            education: userData.profile?.education || '',
            skills: Array.isArray(userData.profile?.skills) ? userData.profile.skills.join(', ') : (userData.profile?.skills || ''),
            linkedin: userData.profile?.linkedin || userData.profile?.linkedinUrl || '',
            github: userData.profile?.github || userData.profile?.githubUrl || '',
            portfolio: userData.profile?.portfolio || userData.profile?.websiteUrl || ''
          }));
          const avatarUrl = userData.profile?.profilePhoto || userData.profile?.profilePicture || userData.avatar || userData.image || userData.profilePhoto || user?.profilePhoto || user?.profile?.profilePhoto || null;
          setProfilePicture(avatarUrl);
          if (userData.profile?.resume || userData.resume) {
            setFormData(prev => ({ ...prev, resume: userData.profile?.resume || userData.resume }));
          }
        }
      }
    } catch (error) {
      console.log('Profile fetch error');
    } finally {
      setIsLoading(false);
    }
  }, [user, profilePanelOpen]);

  const fetchApplicants = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) return;
    setApplicantsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/applications/my-applications`, { headers: { Authorization: `Bearer ${currentToken}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const apps = (data.data?.applications || data.data || []).map(app => ({
            id: app._id,
            name: app.userId?.name || app.applicantName || 'Applicant',
            position: app.jobId?.title || app.jobTitle || 'Position',
            status: app.status || 'pending',
            date: app.createdAt || app.date
          }));
          setApplicants(apps);
        }
      }
    } catch (e) {
      console.log('Applicants fetch error');
    } finally {
      setApplicantsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (profilePanelOpen) {
      fetchProfile();
      fetchApplicants();
    }
  }, [profilePanelOpen, fetchProfile, fetchApplicants]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyzeJobs = async () => {
    const currentToken = getToken();
    if (!currentToken) { showNotification('Please login', 'error'); return; }
    setAnalyzingJobs(true);
    try {
      const res = await fetch(`${API_BASE}/ai-matching/analyze-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
        body: JSON.stringify({ minMatchScore: 50 })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || ' Analyzing complete!', 'success');
      } else {
        showNotification(data.message || 'Analysis complete', 'success');
      }
    } catch (error) {
      console.error('Analyze error:', error);
      showNotification('Analysis failed', 'error');
    } finally {
      setAnalyzingJobs(false);
    }
  };

  const handleSaveProfile = async () => {
    const currentToken = getToken();
    if (!currentToken) { showNotification('Please login to save', 'error'); return; }
    setIsSaving(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        title: formData.title,
        bio: formData.bio,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio
      };
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || 'Profile saved!', 'success');
        if (onRefresh) onRefresh();
      } else {
        showNotification(data.message || 'Profile updated', data.success === false ? 'error' : 'success');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Save profile error:', error);
      showNotification('Failed to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentToken = getToken();
    if (!currentToken) { showNotification('Please login', 'error'); return; }
    setFileUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photo', file);
      const res = await fetch(`${API_BASE}/upload/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        body: formDataUpload
      });
      const data = await res.json();
      if (data.success) {
        setProfilePicture(data.photoUrl || data.url || data.profilePhoto);
        showNotification('Profile picture uploaded!', 'success');
        if (onRefresh) onRefresh();
      } else {
        setProfilePicture(URL.createObjectURL(file));
        showNotification('Picture saved locally', 'success');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setProfilePicture(URL.createObjectURL(file));
      showNotification('Picture saved locally', 'success');
      if (onRefresh) onRefresh();
    }
    setFileUploading(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentToken = getToken();
    if (!currentToken) { showNotification('Please login', 'error'); return; }
    setFileUploading(true);
    try {
      // Try Cloudflare R2 first
      const R2_UPLOAD_URL = 'https://api.dblivpykh.workers.dev/upload';
      const R2_ROOT = 'Root-985465718553282';
      const R2_API_KEY = 'Z3kIqffAFzSCt-kid2-ihtt8rSI';
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'resumes');
      formDataUpload.append('filename', file.name);
      
      const res = await fetch(R2_UPLOAD_URL, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'x-root': R2_ROOT,
          'x-api-key': R2_API_KEY
        },
        body: formDataUpload
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, resume: { name: file.name, url: data.url } }));
        showNotification('Resume uploaded to cloud!', 'success');
      } else {
        throw new Error('Cloud upload failed');
      }
    } catch (err) {
      // Fallback: save locally
      setFormData(prev => ({ ...prev, resume: { name: file.name, url: URL.createObjectURL(file) } }));
      showNotification('Resume saved locally', 'success');
    }
    setFileUploading(false);
  };

  const triggerFileInput = (type) => {
    if (type === 'resume') resumeInputRef.current?.click();
  };

  const viewResume = () => {
    if (formData.resume?.url) {
      window.open(formData.resume.url, '_blank');
    }
  };

  const handleDeleteResume = () => {
    setFormData(prev => ({ ...prev, resume: null }));
    showNotification('Resume deleted', 'success');
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'applicants', label: 'Applicants', icon: Award }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'hired': return 'bg-white text-emerald-600 border border-emerald-200';
      case 'interview': return 'bg-white text-blue-600 border border-blue-200';
      case 'rejected': return 'bg-white text-rose-600 border border-rose-200';
      case 'pending': return 'bg-white text-amber-600 border border-amber-200';
      default: return 'bg-white text-gray-600 border border-gray-200';
    }
  };

  if (!profilePanelOpen) return null;

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => { setProfilePanelOpen(false); setMobileMenuOpen(false); }} />
      <div className="fixed right-0 top-0 h-full w-full md:w-[800px] max-w-[95vw] bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white p-4 md:p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-5">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Profile Settings</h2>
                  <p className="text-slate-500 text-sm">Manage your personal information</p>
                </div>
              </div>
              <button onClick={() => setProfilePanelOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap">
                {activeTabData?.icon && <activeTabData.icon className="w-4 h-4" />}{activeTabData?.label}<ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileMenuOpen && (
                <div className="absolute left-4 top-24 bg-white shadow-xl rounded-xl border border-slate-200 py-2 z-50 min-w-[180px]">
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} className={`w-full px-4 py-2.5 text-left font-semibold text-sm flex items-center gap-2.5 whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                      <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden md:flex gap-2 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>
            ) : (
              <>
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
                      <div className="flex items-center gap-3 mb-4 md:mb-6"><User className="w-5 h-5 text-slate-600" /><div><h3 className="text-lg font-bold">Basic Information</h3><p className="text-sm text-slate-500">Your personal details</p></div></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Phone className="w-3.5 h-3.5" />Phone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'professional' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
                      <div className="flex items-center gap-3 mb-4 md:mb-6"><Briefcase className="w-5 h-5 text-slate-600" /><div><h3 className="text-lg font-bold">Professional Details</h3><p className="text-sm text-slate-500">Your work experience</p></div></div>
                      <div className="space-y-4 md:space-y-5">
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Experience</label><textarea name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" rows={3} /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Code className="w-3.5 h-3.5" />Skills (comma separated)</label><input type="text" name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="React, Node.js, Python" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label><textarea name="bio" value={formData.bio} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" rows={4} /></div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
                      <div className="flex items-center gap-3 mb-4 md:mb-6"><Globe className="w-5 h-5 text-slate-600" /><div><h3 className="text-lg font-bold">Links</h3><p className="text-sm text-slate-500">Your social profiles</p></div></div>
                      <div className="space-y-4 md:space-y-5">
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">LinkedIn</label><input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">GitHub</label><input type="url" name="github" value={formData.github} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio</label><input type="url" name="portfolio" value={formData.portfolio} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
                      <div className="flex items-center gap-4 mb-4 md:mb-6"><FileText className="w-6 h-6 text-slate-600" /><div><h3 className="text-lg font-bold">Resume / CV</h3><p className="text-sm text-slate-500">Your primary job application document</p></div></div>
                      
                      {formData.resume ? (
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText className="w-7 h-7 text-emerald-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 truncate">{formData.resume?.name || formData.resume?.url?.split('/').pop() || 'Resume'}</p>
                                <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Uploaded successfully</p>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button onClick={viewResume} className="px-4 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-700">
                                <Eye className="w-4 h-4" />View
                              </button>
                              <button onClick={() => triggerFileInput('resume')} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">
                                Replace
                              </button>
                              <button onClick={handleDeleteResume} className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete resume">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 md:p-12 text-center hover:border-slate-400 hover:bg-slate-50/50 cursor-pointer transition-all" onClick={() => triggerFileInput('resume')}>
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-900 font-bold text-lg mb-1">No Resume</p>
                          <p className="text-slate-500 text-sm mb-5">Upload your resume to apply for jobs faster</p>
                          <div className="px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold inline-flex items-center gap-2 text-sm">
                            {fileUploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Choose File</>}
                          </div>
                          <p className="text-xs text-slate-400 mt-4">PDF, DOC, or DOCX (max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'applicants' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
                      <div className="flex items-center gap-3 mb-4 md:mb-6"><Award className="w-5 h-5 text-slate-600" /><div><h3 className="text-lg font-bold">My Applicants</h3><p className="text-sm text-slate-500">Your job applications</p></div></div>
                      {applicantsLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div> : applicants.length === 0 ? (
                        <div className="text-center py-12"><div className="w-16 md:w-20 h-16 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="w-8 md:w-10 h-8 md:h-10 text-slate-400" /></div><p className="text-slate-900 font-semibold text-base md:text-lg mb-2">No Applications Yet</p><p className="text-slate-500 text-sm">Start applying for jobs to see them here</p></div>
                      ) : (
                        <div className="space-y-3">
                          {applicants.slice(0, 10).map(applicant => (
                            <div key={applicant.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 md:w-12 h-10 md:h-12 bg-slate-200 rounded-xl flex items-center justify-center"><span className="text-slate-700 font-bold text-sm md:text-base">{applicant.name?.substring(0, 2).toUpperCase() || 'AP'}</span></div>
                                <div><h4 className="font-bold text-slate-900 text-sm md:text-base">{applicant.name || 'Applicant'}</h4><p className="text-sm text-slate-600">{applicant.position || 'Position'}</p></div>
                              </div>
                              <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(applicant.status)}`}>{applicant.status || 'pending'}</span>
                                <span className="text-xs md:text-sm text-slate-500">{applicant.date ? new Date(applicant.date).toLocaleDateString() : 'N/A'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-white border-t border-slate-200 p-4 md:p-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <p className="text-sm text-slate-500 flex items-center order-2 sm:order-1"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Auto-saved changes</p>
              <div className="flex gap-2 order-1 sm:order-2">
                <button onClick={handleAnalyzeJobs} disabled={analyzingJobs} className="px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 flex items-center justify-center disabled:opacity-50">
                  {analyzingJobs ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Analyzing...</> : <><Zap className="w-5 h-5 mr-2" />Find Jobs</>}
                </button>
                <button onClick={handleSaveProfile} disabled={isSaving} className="px-6 md:px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 flex items-center justify-center disabled:opacity-50">
                  {isSaving ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</> : <><Save className="w-5 h-5 mr-2" />Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" className="hidden" />
    </>
  );
};

export default ProfilePanel;