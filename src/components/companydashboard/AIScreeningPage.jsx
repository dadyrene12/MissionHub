import React, { useState, useEffect } from 'react';
import {
  Briefcase, Brain, Wand2, Loader2, Eye, Check, X, Award, RefreshCw,
  Plus, Users, TrendingUp, AlertCircle, Search, BarChart3, List, Grid3X3, Sparkles,
  ThumbsUp, ThumbsDown, FileText, GraduationCap, Star, Folder, Download, Mail, Phone, MapPin,
  CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : 'https://missionhubbackend.onrender.com/api';

const getCandidateHTML = (c, index, jobTitle) => {
  const matchedSkills = c.matchScore?.matchedSkills || [];
  const missingSkills = c.matchScore?.missingSkills || [];
  const strengths = c.aiData?.strengths || [];
  const weaknesses = c.aiData?.weaknesses || [];
  const location = c.userId?.profile?.location || c.userId?.location || 'N/A';
  const experience = c.userId?.experience || c.userId?.profile?.experience || 'N/A';
  const education = c.userId?.education || c.userId?.profile?.education || 'N/A';
  const bio = c.userId?.bio || c.userId?.profile?.bio || '';
  const resumeUrl = c.userId?.resume?.url || '';
  const appliedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A';
  const initials = (c.userId?.name || 'U').charAt(0).toUpperCase();
  const phone = c.userId?.phone || 'N/A';
  const email = c.userId?.email || 'N/A';
  const name = c.userId?.name || 'N/A';
  const aiScore = c.aiScore || 0;
  
  const matchedSkillsHTML = matchedSkills.length > 0 ? matchedSkills.map(s => '<span class="skill-tag skill-matched">' + s + '</span>').join('') : '<span class="text-slate-400">None identified</span>';
  const missingSkillsHTML = missingSkills.length > 0 ? missingSkills.map(s => '<span class="skill-tag skill-missing">' + s + '</span>').join('') : '<span class="text-emerald-600">None - all required skills present</span>';
  const strengthsHTML = strengths.length > 0 ? strengths.map(s => '<div class="strength-item"><span class="strength-icon">&#10003;</span><span>' + s + '</span></div>').join('') : '<div class="text-slate-400 text-sm">No specific strengths identified</div>';
  const weaknessesHTML = weaknesses.length > 0 ? weaknesses.map(w => '<div class="weakness-item"><span class="weakness-icon">&#9679;</span><span>' + w + '</span></div>').join('') : '<div class="text-emerald-600 text-sm">No significant weaknesses identified</div>';
  const bioHTML = bio ? '<div class="section-title"></div><div class="bio-card"><div class="bio-text">' + bio + '</div></div>' : '';
  const resumeHTML = resumeUrl ? '<div style="margin-top:16px;"><a href="' + resumeUrl + '" class="resume-link" target="_blank">&#128196; View Resume / CV</a></div>' : '';
  const skillsSection = (matchedSkills.length > 0 || missingSkills.length > 0) ? '<div class="section-title">Skills Analysis</div><div class="skills-grid"><div class="skills-card matched"><div class="skills-label">&#10003; Matched Skills (' + matchedSkills.length + ')</div><div class="skills-tags">' + matchedSkillsHTML + '</div></div><div class="skills-card missing"><div class="skills-label">&#10007; Missing Skills (' + missingSkills.length + ')</div><div class="skills-tags">' + missingSkillsHTML + '</div></div></div>' : '';
  const aiSection = (strengths.length > 0 || weaknesses.length > 0) ? '<div class="section-title">AI Assessment</div><div class="assessment-grid"><div class="assessment-card"><div class="assessment-icon">&#10003;</div><div class="assessment-num">' + strengths.length + '</div><div class="assessment-label">Strengths</div></div><div class="assessment-card"><div class="assessment-icon">&#9679;</div><div class="assessment-num">' + weaknesses.length + '</div><div class="assessment-label">Areas to Improve</div></div><div class="assessment-card"><div class="assessment-icon">&#9733;</div><div class="assessment-num">' + aiScore + '%</div><div class="assessment-label">Overall Score</div></div></div><div class="strengths-section"><div class="strengths-label">Key Strengths</div>' + strengthsHTML + '</div><div class="weaknesses-label">Areas for Improvement</div>' + weaknessesHTML + '</div></div>' : '<div class="section-title">AI Assessment</div><div class="assessment-grid"><div class="assessment-card full"><div class="assessment-num">' + aiScore + '%</div><div class="assessment-label">AI Screening Score</div></div></div>';
  return '<div class="candidate"><div class="candidate-top"><div class="rank-num">#' + (index + 1) + '</div><div class="avatar">' + initials + '</div><div class="info"><div class="name">' + name + '</div><div class="email">' + email + '</div></div><div class="score-box"><div class="score-num">' + aiScore + '</div><div class="score-label">AI Score</div></div></div><div class="details-grid"><div class="detail-item"><span class="detail-icon">&#9742;</span><div><div class="detail-label">Phone</div><div class="detail-value">' + phone + '</div></div></div><div class="detail-item"><span class="detail-icon">&#9906;</span><div><div class="detail-label">Location</div><div class="detail-value">' + location + '</div></div></div><div class="detail-item"><span class="detail-icon">&#128197;</span><div><div class="detail-label">Applied</div><div class="detail-value">' + appliedDate + '</div></div></div>' + skillsSection + aiSection + '<div class="section-title">Background</div><div class="bg-grid"><div class="bg-card"><div class="bg-label">Experience</div><div class="bg-value">' + experience + '</div></div><div class="bg-card"><div class="bg-label">Education</div><div class="bg-value">' + education + '</div></div></div>' + bioHTML + resumeHTML + '</div>';
};

const downloadShortlistedPDF = (candidates, jobTitle) => {
  const totalCandidates = candidates.length;
  const avgScore = totalCandidates > 0 ? Math.round(candidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / totalCandidates) : 0;
  const excellent = candidates.filter(c => (c.aiScore || 0) >= 70).length;
  const good = candidates.filter(c => (c.aiScore || 0) >= 50 && (c.aiScore || 0) < 70).length;
  const pending = candidates.filter(c => !c.aiData).length;
  const jobBadge = jobTitle || 'All Applications';
  const generatedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const candidatesHTML = candidates.map((c, i) => getCandidateHTML(c, i, jobTitle)).join('');

  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Shortlisted Candidates - ' + jobTitle + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Inter","Segoe UI",Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;background:#f1f5f9;min-height:100vh}.header{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:40px;border-radius:16px;margin-bottom:24px}.logo{display:flex;align-items:center;gap:12px;margin-bottom:16px}.logo-icon{width:48px;height:48px;background:#f59e0b;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px}.logo-text{font-size:14px;font-weight:600;color:#f59e0b}.header h1{font-size:32px;font-weight:700;margin-bottom:8px}.job-badge{display:inline-block;background:#f59e0b;color:#0f172a;padding:8px 16px;border-radius:20px;font-size:14px;font-weight:600;margin-bottom:16px}.subtitle{color:#94a3b8;font-size:14px;display:flex;justify-content:space-between;align-items:center}.stats-row{display:flex;gap:16px;margin-top:24px}.stat-box{background:rgba(255,255,255,0.1);padding:16px 24px;border-radius:12px;text-align:center;flex:1}.stat-num{font-size:28px;font-weight:700}.stat-lbl{font-size:12px;color:#94a3b8;text-transform:uppercase;margin-top:4px}.candidate{background:#fff;border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e2e8f0}.candidate-top{display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f1f5f9}.rank-num{width:48px;height:48px;background:#0f172a;color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700}.avatar{width:56px;height:56px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600}.info{flex:1}.name{font-size:18px;font-weight:700;color:#0f172a}.email{font-size:13px;color:#64748b;margin-top:2px}.score-box{background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:12px 20px;border-radius:12px;text-align:center}.score-num{font-size:28px;font-weight:700}.score-label{font-size:11px;opacity:0.9}.details-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}.detail-item{display:flex;align-items:flex-start;gap:8px;padding:12px;background:#f8fafc;border-radius:10px}.detail-icon{font-size:16px}.detail-label{font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase}.detail-value{font-size:14px;color:#0f172a;margin-top:2px}.section-title{font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:24px 0 12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px}.skills-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.skills-card{padding:16px;border-radius:12px}.skills-card.matched{background:#f0fdf4;border:1px solid #bbf7d0}.skills-card.missing{background:#fef2f2;border:1px solid #fecaca}.skills-label{font-size:13px;font-weight:700;margin-bottom:10px}.skills-card.matched .skills-label{color:#166534}.skills-card.missing .skills-label{color:#991b1b}.skills-tags{display:flex;flex-wrap:wrap;gap:6px}.skill-tag{padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600}.skill-matched{background:#dcfce7;color:#166534}.skill-missing{background:#fee2e2;color:#991b1b}.assessment-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}.assessment-card{padding:16px;background:#f8fafc;border-radius:12px;text-align:center}.assessment-card.full{grid-column:span 3}.assessment-icon{font-size:20px;margin-bottom:4px}.assessment-num{font-size:24px;font-weight:700;color:#0f172a}.assessment-label{font-size:12px;color:#64748b;margin-top:4px}.strengths-section,.weaknesses-section{margin-bottom:16px}.strengths-label,.weaknesses-label{font-size:13px;font-weight:700;margin-bottom:8px}.strengths-label{color:#166534}.weaknesses-label{color:#dc2626}.strength-item,.weakness-item{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid #f1f5f9}.strength-item:last-child,.weakness-item:last-child{border-bottom:none}.strength-icon{color:#10b981}.weakness-icon{color:#f59e0b}.bg-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.bg-card{padding:16px;background:#f8fafc;border-radius:12px}.bg-label{font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;margin-bottom:6px}.bg-value{font-size:14px;color:#0f172a;line-height:1.5}.bio-card{padding:16px;background:#f8fafc;border-radius:12px}.bio-text{font-size:14px;color:#475569;line-height:1.6}.resume-link{display:inline-flex;align-items:center;gap:8px;background:#0f172a;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:500;margin-top:16px}.resume-link:hover{background:#334155}.footer{text-align:center;padding:24px;color:#94a3b8;font-size:13px;border-top:1px solid #e2e8f0;margin-top:24px}@media print{body{padding:0;background:#fff}.candidate{box-shadow:none;border:1px solid #e2e8f0}}</style></head><body><div class="header"><div class="logo"><div class="logo-icon">&#128200;</div><div class="logo-text">MissionHub</div></div><span class="job-badge">' + jobBadge + '</span><h1>Shortlisted Candidates Report</h1><div class="subtitle"><span>' + generatedDate + '</span><span>AI-Powered Candidate Screening</span></div><div class="stats-row"><div class="stat-box"><div class="stat-num">' + totalCandidates + '</div><div class="stat-lbl">Candidates</div></div><div class="stat-box"><div class="stat-num">' + avgScore + '%</div><div class="stat-lbl">Avg Score</div></div><div class="stat-box"><div class="stat-num">' + excellent + '</div><div class="stat-lbl">Excellent (70+)</div></div><div class="stat-box"><div class="stat-num">' + good + '</div><div class="stat-lbl">Good (50-69)</div></div><div class="stat-box"><div class="stat-num">' + pending + '</div><div class="stat-lbl">Pending Review</div></div></div></div>' + candidatesHTML + '<div class="footer"><p>Generated by MissionHub AI Screening System</p></div></body></html>';

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = jobTitle ? jobTitle.toLowerCase().replace(/\s+/g, '-') : 'all';
a.download = 'shortlisted-candidates-' + filename + '-' + new Date().toISOString().split('T')[0] + '.html';
  a.click();
  URL.revokeObjectURL(url);
};

const AIScreeningPage = ({ token, showNotification }) => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [screeningAll, setScreeningAll] = useState(false);
  const [screeningId, setScreeningId] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [showShortlist, setShowShortlist] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(null);
  const [showProfile, setShowProfile] = useState(null);
  const [viewMode, setViewMode] = useState('ranked');
  const [shortlistCount, setShortlistCount] = useState(10);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0, results: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getToken = () => token || localStorage.getItem('token') || '';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const currentToken = getToken();
      const [jobsRes, appsRes] = await Promise.all([
        fetch(`${API_BASE}/jobs/company`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        }),
        fetch(`${API_BASE}/applications/for-my-jobs`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        })
      ]);
      
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      
      const applications = appsData.success && Array.isArray(appsData.data) ? appsData.data : [];
      setAllApplications(applications);
      
      const savedShortlist = localStorage.getItem('shortlistedCandidates');
      if (savedShortlist) {
        setShortlistedIds(new Set(JSON.parse(savedShortlist)));
      }
      
      const savedDocuments = localStorage.getItem('selectedDocuments');
      if (savedDocuments) {
        setSelectedDocuments(JSON.parse(savedDocuments));
      }
      
      if (jobsData.success) {
        const jobsWithCounts = (jobsData.data || []).map(job => {
          const jobApplications = applications.filter(app => 
            app.jobId?._id === job._id || app.jobId === job._id
          );
          return {
            ...job,
            totalApplicants: jobApplications.length
          };
        });
        setJobs(jobsWithCounts);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    setShowResult(null);
    setSearchTerm('');
    setFilterStatus('all');
    const filtered = allApplications.filter(app => 
      app.jobId?._id === jobId || app.jobId === jobId
    );
    setCandidates(filtered.map(app => ({
      ...app,
      aiScore: app.aiScreening?.overallScore || 0,
      aiData: app.aiScreening || null
    })));
  };

  const screenCandidate = async (applicationId) => {
    try {
      setScreeningId(applicationId);
      const currentToken = getToken();
      
      const res = await fetch(`${API_BASE}/ai-matching/screening/screen-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({ 
          applicationId, 
          provider: 'gemini'
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const updatedCandidates = candidates.map(c => 
          c._id === applicationId 
            ? { ...c, aiScore: data.screening.overallScore, aiData: data.screening }
            : c
        );
        setCandidates(updatedCandidates);
        
        const updatedApps = allApplications.map(a =>
          a._id === applicationId
            ? { ...a, aiScreening: data.screening }
            : a
        );
        setAllApplications(updatedApps);
        
        const analyzedCandidate = updatedCandidates.find(c => c._id === applicationId);
        setShowAnalysisModal(analyzedCandidate);
        showNotification?.('Analysis complete!', 'success');
        return data.screening;
      } else {
        showNotification?.(data.message || 'Analysis failed', 'error');
        return null;
      }
    } catch (err) {
      console.error('Error:', err);
      showNotification?.('Analysis failed', 'error');
      return null;
    } finally {
      setScreeningId(null);
    }
  };

  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  const handleViewProfile = async (candidate) => {
    const fullProfile = await fetchUserProfile(candidate.userId?._id);
    if (fullProfile) {
      setShowProfile({ ...candidate, userData: fullProfile });
    } else {
      setShowProfile(candidate);
    }
  };

  const analyzeAll = async () => {
    const unscreened = candidates.filter(c => !c.aiData);
    if (unscreened.length === 0) {
      showNotification?.('All candidates already analyzed!', 'info');
      return;
    }

    setScreeningAll(true);
    setAnalysisProgress({ current: 0, total: unscreened.length, results: [] });

    try {
      const currentToken = getToken();
      
      // Analyze ALL candidates in parallel at once
      const allResults = await Promise.all(
        unscreened.map(async (candidate, index) => {
          setAnalysisProgress(prev => ({ ...prev, current: index + 1 }));
          
          try {
            const res = await fetch(`${API_BASE}/ai-matching/screening/screen-candidate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentToken}`
              },
              body: JSON.stringify({ 
                applicationId: candidate._id, 
                provider: 'gemini'
              })
            });
            const data = await res.json();
            if (data.success) {
              return { candidateId: candidate._id, ...data.screening };
            }
            return null;
          } catch (err) {
            console.error('Error analyzing:', candidate._id, err);
            return null;
          }
        })
      );

      // Update local state with results
      const validResults = allResults.filter(r => r !== null);
      const updatedCandidates = candidates.map(c => {
        const result = validResults.find(r => r.candidateId === c._id);
        if (result) {
          return { ...c, aiScore: result.overallScore, aiData: result };
        }
        return c;
      });
      setCandidates(updatedCandidates);

      // Update all applications
      const updatedApps = allApplications.map(a => {
        const result = validResults.find(r => r.candidateId === a._id);
        if (result) {
          return { ...a, aiScreening: result };
        }
        return a;
      });
      setAllApplications(updatedApps);

      setAnalysisProgress(prev => ({ ...prev, results: validResults, current: unscreened.length }));
      showNotification?.(`Analyzed ${validResults.length} candidates! Skills, Experience, Education & CV analyzed.`, 'success');
    } catch (err) {
      console.error('Batch analysis error:', err);
      showNotification?.('Analysis failed', 'error');
    } finally {
      setScreeningAll(false);
    }
  };

  const analyzeAllCVs = async () => {
    if (!selectedJobId) {
      showNotification?.('Please select a job first', 'error');
      return;
    }

    try {
      setScreeningAll(true);
      setAnalysisProgress({ current: 0, total: candidates.length, results: [] });
      const currentToken = getToken();
      
      const res = await fetch(`${API_BASE}/ai-matching/screening/screen-job-candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({ jobId: selectedJobId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchAllData();
        showNotification?.(`Analyzed ${data.results?.length || 0} candidates! Skills, Experience, Education & CV analyzed.`, 'success');
      } else {
        showNotification?.(data.message || 'Analysis failed', 'error');
      }
    } catch (err) {
      console.error('CV Analysis error:', err);
      showNotification?.('CV analysis failed', 'error');
    } finally {
      setScreeningAll(false);
    }
  };

  const toggleShortlist = (candidateId) => {
    const newSet = new Set(shortlistedIds);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setShortlistedIds(newSet);
    localStorage.setItem('shortlistedCandidates', JSON.stringify([...newSet]));
    showNotification?.(newSet.has(candidateId) ? 'Added to shortlist' : 'Removed from shortlist', 'success');
  };

  const toggleSelectDocument = (candidateId, documentInfo) => {
    setSelectedDocuments(prev => {
      const newDocs = { ...prev };
      if (newDocs[candidateId] && newDocs[candidateId].url === documentInfo.url) {
        delete newDocs[candidateId];
      } else {
        newDocs[candidateId] = documentInfo;
      }
      localStorage.setItem('selectedDocuments', JSON.stringify(newDocs));
      return newDocs;
    });
  };

  const generateShortlist = (count = 10) => {
    const ranked = [...candidates]
      .filter(c => c.aiData)
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, count);
    
    ranked.forEach(c => {
      if (!shortlistedIds.has(c._id)) {
        const newSet = new Set(shortlistedIds);
        newSet.add(c._id);
        setShortlistedIds(newSet);
      }
    });
    
    localStorage.setItem('shortlistedCandidates', JSON.stringify([...shortlistedIds]));
    showNotification?.(`Generated Top ${count} shortlist!`, 'success');
    setShowShortlist(true);
  };

  const shortlistAll = () => {
    const screenedCandidates = candidates.filter(c => c.aiData);
    if (screenedCandidates.length === 0) {
      showNotification?.('No analyzed candidates to shortlist!', 'info');
      return;
    }
    
    const newShortlist = new Set(shortlistedIds);
    screenedCandidates.forEach(c => {
      newShortlist.add(c._id);
    });
    
    setShortlistedIds(newShortlist);
    localStorage.setItem('shortlistedCandidates', JSON.stringify([...newShortlist]));
    showNotification?.(`Shortlisted all ${screenedCandidates.length} analyzed candidates!`, 'success');
    setShowShortlist(true);
  };

  const stats = {
    total: candidates.length,
    screened: candidates.filter(c => c.aiData).length,
    unscreened: candidates.filter(c => !c.aiData).length,
    excellent: candidates.filter(c => (c.aiScore || 0) >= 85).length,
    shortlisted: candidates.filter(c => shortlistedIds.has(c._id)).length,
    avgScore: candidates.filter(c => c.aiScore).length > 0 
      ? Math.round(candidates.filter(c => c.aiScore).reduce((a, c) => a + c.aiScore, 0) / candidates.filter(c => c.aiScore).length)
      : 0
  };

  const topCandidates = [...candidates]
    .filter(c => c.aiData)
    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
    .slice(0, 20);

  const shortlistCandidates = [...candidates]
    .filter(c => shortlistedIds.has(c._id))
    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchTerm || 
      c.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'screened' && c.aiData) ||
      (filterStatus === 'unscreened' && !c.aiData) ||
      (filterStatus === 'shortlisted' && shortlistedIds.has(c._id));
    
    return matchesSearch && matchesFilter;
  });

  const selectedJob = jobs.find(j => j._id === selectedJobId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                AI Candidate Screening
              </h1>
              <p className="text-slate-500 text-sm">Intelligent CV Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShortlist(!showShortlist)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm ${
                showShortlist ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              Shortlist ({shortlistedIds.size})
            </button>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Job Selection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-600" />
              Select Job Position
            </h3>
            {selectedJob && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{stats.total}</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" />{stats.screened}</span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-slate-900 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-slate-900" />
                </div>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-slate-400" />
              </div>
              <p className="font-bold text-xl text-slate-700">No jobs found</p>
              <p className="text-sm text-slate-500 mt-2">Create a job to start screening candidates</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {jobs.map(job => (
                <button
                  key={job._id}
                  onClick={() => handleJobSelect(job._id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedJobId === job._id 
                      ? 'border-slate-900 bg-slate-900' 
                      : 'border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                >
                  <h4 className={`font-semibold ${selectedJobId === job._id ? 'text-white' : 'text-slate-900'}`}>
                    {job.title}
                  </h4>
                  <div className={`flex items-center gap-2 mt-2text-xs ${selectedJobId === job._id ? 'text-white/70' : 'text-slate-500'}`}>
                    <Users className="w-3.5 h-3.5" />
                    <span>{job.totalApplicants || 0}</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedJobId && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total', value: stats.total, icon: Users },
                { label: 'Screened', value: stats.screened, icon: CheckCircle },
                { label: 'Pending', value: stats.unscreened, icon: Loader2 },
                { label: 'Excellent', value: stats.excellent, icon: Star },
                { label: 'Avg Score', value: `${stats.avgScore}%`, icon: BarChart3 },
                { label: 'Shortlisted', value: stats.shortlisted, icon: Award },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <stat.icon className="w-4 h-4 text-slate-400 mb-1" />
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* AI Analysis Progress */}
            {screeningAll && (
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
                      <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">AI Analyzing Candidates...</h3>
                      <p className="text-slate-400 text-sm">Processing CVs with advanced AI</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black">{analysisProgress.current}/{analysisProgress.total}</p>
                    <p className="text-xs text-slate-400">completed</p>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${(analysisProgress.current / analysisProgress.total) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Skills 40%</span>
                  <span>Experience 30%</span>
                  <span>Projects 20%</span>
                  <span>Education 10%</span>
                </div>
              </div>
            )}

            {/* Analyze Actions */}
            {!screeningAll && stats.unscreened > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Brain className="w-7 h-7 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">AI CV Analysis</h3>
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        {stats.unscreened} candidates pending analysis
                        <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" />
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={analyzeAll}
                      disabled={screeningAll}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Wand2 className="w-4 h-4" />
                      Analyze All ({stats.unscreened})
                    </button>
                    <button
                      onClick={analyzeAllCVs}
                      disabled={screeningAll}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4" />
                      Batch Analyze
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {stats.screened > 0 && !screeningAll && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Award className="w-7 h-7 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                      <p className="text-slate-500 text-sm">
                        {stats.screened} analyzed • {stats.shortlisted} shortlisted • Avg: {stats.avgScore}%
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={shortlistAll}
                      disabled={stats.screened === 0}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Award className="w-4 h-4" />
                      Shortlist All ({stats.screened})
                    </button>
                    <button
                      onClick={() => { setShowShortlist(true); }}
                      className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
                    >
                      <Users className="w-4 h-4" />
                      View Shortlist
                    </button>
                    <button
                      onClick={() => downloadShortlistedPDF(shortlistCandidates, selectedJobId ? jobs.find(j => j._id === selectedJobId)?.title : '')}
                      disabled={shortlistCandidates.length === 0}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Top Shortlist */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Auto-Rank Top Candidates</h3>
                    <p className="text-slate-500 text-sm">Generate shortlist based on AI scores</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={shortlistCount}
                    onChange={(e) => setShortlistCount(Number(e.target.value))}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  >
                    <option value={10}>Top 10</option>
                    <option value={15}>Top 15</option>
                    <option value={20}>Top 20</option>
                  </select>
                  <button
                    onClick={() => generateShortlist(shortlistCount)}
                    disabled={stats.screened < 1}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Candidates List */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-800">
                  {showShortlist ? 'Shortlisted' : 'Candidates'} 
                  <span className="text-slate-400 ml-1">({showShortlist ? shortlistCandidates.length : filteredCandidates.length})</span>
                </h3>
                {!showShortlist && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg w-48 text-sm"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      <option value="all">All</option>
                      <option value="screened">Screened</option>
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                    </select>
                    <button
                      onClick={() => setViewMode(viewMode === 'ranked' ? 'grid' : 'ranked')}
                      className="p-1.5 bg-slate-100 rounded-lg"
                    >
                      {viewMode === 'ranked' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {showShortlist ? (
                shortlistCandidates.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="font-semibold text-lg">No shortlisted candidates</p>
                    <p className="text-sm">Generate a shortlist to see candidates here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shortlistCandidates.map((candidate, index) => (
                      <div key={candidate._id} className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          #{index + 1}
                        </div>
                        <div className="w-14 h-14 bg-slate-200 rounded-xl flex items-center justify-center">
                          <span className="text-slate-600 font-bold text-xl">{(candidate.userId?.name || 'U').charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{candidate.userId?.name || 'Candidate'}</h4>
                          <p className="text-sm text-slate-500">{candidate.userId?.email}</p>
                        </div>
                        <div className="px-5 py-2.5 rounded-xl font-bold text-white bg-slate-900">
                          {candidate.aiScore}%
                        </div>
                        <button
                          onClick={() => handleViewProfile(candidate)}
                          className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          title="View Profile"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowModal(candidate)}
                          className="p-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                          title="View AI Score"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleShortlist(candidate._id)}
                          className="p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">No candidates found</p>
                </div>
              ) : viewMode === 'ranked' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="p-3 font-semibold text-slate-600">#</th>
                        <th className="p-3 font-semibold text-slate-600">Candidate</th>
                        <th className="p-3 font-semibold text-slate-600">Score</th>
                        <th className="p-3 font-semibold text-slate-600">Strengths</th>
                        <th className="p-3 font-semibold text-slate-600">Missing</th>
                        <th className="p-3 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates
                        .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
                        .map((candidate, index) => {
                        const isShortlisted = shortlistedIds.has(candidate._id);
                        return (
                          <tr key={candidate._id} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="p-3">
                              <span className={`font-bold ${candidate.aiData ? 'text-slate-900' : 'text-slate-400'}`}>
                                {candidate.aiData ? `#${index + 1}` : '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                  <span className="text-slate-600 font-bold text-sm">{(candidate.userId?.name || 'U').charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{candidate.userId?.name || 'Candidate'}</p>
                                  <p className="text-xs text-slate-500">{candidate.userId?.email}</p>
                                </div>
                              </div>
                            </td>
<td className="p-3 text-center">
                              {candidate.aiData ? (
                                <span className="font-bold text-slate-900">{candidate.aiScore}</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              {candidate.aiData ? (
                                <div className="text-xs text-slate-600">
                                  {(candidate.aiData.strengths || []).slice(0, 2).join(', ')}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              {candidate.aiData ? (
                                <div className="text-xs text-slate-500">
                                  {(candidate.aiData.weaknesses || []).slice(0, 2).join(', ') || 'None'}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                {candidate.aiData ? (
                                  <>
                                    <button
                                      onClick={() => toggleShortlist(candidate._id)}
                                      className={`p-1.5 rounded ${isShortlisted ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                      {isShortlisted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => setShowModal(candidate)}
                                      className="p-1.5 bg-slate-100 text-slate-600 rounded"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => screenCandidate(candidate._id)}
                                    disabled={screeningId === candidate._id}
                                    className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium disabled:opacity-50"
                                  >
                                    {screeningId === candidate._id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : 'Analyze'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCandidates
                    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
                    .map((candidate, index) => {
                    const isShortlisted = shortlistedIds.has(candidate._id);
                    return (
                      <div key={candidate._id} className="p-5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all bg-white">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${candidate.aiData ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {candidate.aiData ? `#${index + 1}` : '-'}
                          </div>
                          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                            <span className="text-slate-600 font-bold text-xl">{(candidate.userId?.name || 'U').charAt(0)}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">{candidate.userId?.name || 'Candidate'}</h4>
                        <p className="text-sm text-slate-500 mb-4">{candidate.userId?.email}</p>
                        {candidate.aiData ? (
                          <div className="space-y-3">
                            <div className="px-4 py-3 rounded-lg font-bold text-white text-center bg-slate-900">
                              Score: {candidate.aiScore}%
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleShortlist(candidate._id)}
                                className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-1 text-sm font-medium ${isShortlisted ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                              >
                                {isShortlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                Shortlist
                              </button>
                              <button
                                onClick={() => {
                                  const profile = candidate.userId || {};
                                  const resumeInfo = { 
                                    name: profile.resume?.name || profile.profile?.resume?.name || 'Resume',
                                    url: profile.resume?.url || profile.profile?.resume?.url || ''
                                  };
                                  if (resumeInfo.url) {
                                    toggleSelectDocument(candidate._id, resumeInfo);
                                  }
                                }}
                                className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium ${selectedDocuments[candidate._id] ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
                              >
                                <FileText className="w-4 h-4" />
                                {selectedDocuments[candidate._id] ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => screenCandidate(candidate._id)}
                            disabled={screeningId === candidate._id}
                            className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {screeningId === candidate._id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Wand2 className="w-5 h-5" />
                            )}
                            Analyze CV
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-slate-900 text-white px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-white/10 border border-white/20">
                  #{topCandidates.findIndex(c => c._id === showModal._id) + 1 || '-'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{showModal.userId?.name}</h3>
                  <p className="text-slate-400">{showModal.userId?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {showModal.aiData ? (
                <div className="space-y-5">
                  <div className="bg-slate-800 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-300 font-medium">Overall Score</span>
                      <span className="text-5xl font-bold">{showModal.aiScore || 0}<span className="text-2xl">/100</span></span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${showModal.aiScore || 0}%` }} />
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-slate-400">
                      <span>Skills 40%</span>
                      <span>Experience 30%</span>
                      <span>Projects 20%</span>
                      <span>Education 10%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Skills', score: showModal.aiData.skillsMatch?.score || 0, weight: showModal.aiData.skillsMatch?.weightedScore || 0 },
                      { label: 'Experience', score: showModal.aiData.experienceMatch?.score || 0, weight: showModal.aiData.experienceMatch?.weightedScore || 0 },
                      { label: 'Projects', score: showModal.aiData.projectsMatch?.score || 0, weight: showModal.aiData.projectsMatch?.weightedScore || 0 },
                      { label: 'Education', score: showModal.aiData.educationMatch?.score || 0, weight: showModal.aiData.educationMatch?.weightedScore || 0 },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{item.score}</p>
                        <p className="text-xs text-slate-400">({item.weight}%)</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5" />
                      Key Strengths
                    </h4>
                    <div className="space-y-2">
                      {(showModal.aiData.strengths || []).map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span className="text-slate-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                    <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5" />
                      Weaknesses / Gaps
                    </h4>
                    <div className="space-y-2">
                      {(showModal.aiData.weaknesses || []).map((w, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-red-600 mt-0.5" />
                          <span className="text-slate-700">{w}</span>
                        </div>
                      ))}
                      {((showModal.aiData.weaknesses || []).length === 0) && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                          <span className="text-slate-700">No significant weaknesses identified</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Selection Reason
                    </h4>
                    <p className="text-slate-700 leading-relaxed">{showModal.aiData.selectionReason}</p>
                  </div>

<div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => toggleShortlist(showModal._id)}
                      className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                        shortlistedIds.has(showModal._id) 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {shortlistedIds.has(showModal._id) ? (
                        <><Check className="w-5 h-5" /> Shortlisted</>
                      ) : (
                        <><Plus className="w-5 h-5" /> Add to Shortlist</>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:5000" : 'https://missionhubbackend.onrender.com';
                        fetch(`${backendUrl}/api/applications/${showModal._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                          body: JSON.stringify({ status: 'approved' })
                        }).then(res => res.json()).then(data => {
                          if (data.success) {
                            showNotification?.('Candidate approved!', 'success');
                            setShowModal(null);
                            fetchAllData();
                          }
                        });
                      }}
                      className="py-4 px-6 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const profile = showModal.userId || {};
                        const resumeInfo = { 
                          name: profile.resume?.name || profile.profile?.resume?.name || 'Resume',
                          url: profile.resume?.url || profile.profile?.resume?.url || ''
                        };
                        if (resumeInfo.url) {
                          toggleSelectDocument(showModal._id, resumeInfo);
                        }
                      }}
                      className={`py-4 px-6 rounded-xl font-bold flex items-center gap-2 ${
                        selectedDocuments[showModal._id]
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      {selectedDocuments[showModal._id] ? 'Selected' : 'Select Document'}
                    </button>
                    <button
                      onClick={() => setShowModal(null)}
                      className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-semibold text-lg mb-4">No analysis available</p>
                  <button
                    onClick={() => { screenCandidate(showModal._id); setShowModal(null); }}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 flex items-center gap-2 mx-auto"
                  >
                    <Wand2 className="w-5 h-5" />
                    Run AI Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold">{(showProfile.userId?.name || 'U').charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">{showProfile.userId?.name}</h3>
                  <p className="text-slate-400 text-sm">{showProfile.userId?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowProfile(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {(() => {
                const profile = showProfile.userData || showProfile.userId;
                if (!profile) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-slate-500">Profile data not available</p>
                    </div>
                  );
                }
                
                const userSkills = profile.skills || profile.profile?.skills || [];
                const userExperience = profile.experience || profile.profile?.experience || '';
                const userEducation = profile.education || profile.profile?.education || '';
                const userBio = profile.bio || profile.profile?.bio || '';
                const userPhone = profile.phone || profile.profile?.phone || '';
                const userCity = profile.city || profile.profile?.location || profile.profile?.city || '';
                const userResume = profile.resume || profile.profile?.resume?.url || profile.profile?.resume || '';
                
                return (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-600">{(profile.name || 'U').charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{profile.name || 'Candidate'}</h4>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-1">Phone</p>
                        <p className="font-semibold text-slate-900">{userPhone || 'Not provided'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-1">Location</p>
                        <p className="font-semibold text-slate-900">{userCity || 'Not specified'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {userSkills.length > 0 ? (
                          userSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">No skills listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Experience</h4>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-slate-700 whitespace-pre-wrap">{userExperience || 'No experience listed'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Education</h4>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-slate-700 whitespace-pre-wrap">{userEducation || 'No education listed'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Bio</h4>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-slate-700">{userBio || 'No bio available'}</p>
                      </div>
                    </div>

                    {(userResume || selectedDocuments[showModal?._id] || selectedDocuments[showProfile?._id]) && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Resume / Document</h4>
                        {(() => {
                          const selectedDoc = selectedDocuments[showModal?._id] || selectedDocuments[showProfile?._id];
                          if (selectedDoc) {
                            return (
                              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">{selectedDoc.name}</span>
                                <a 
                                  href={selectedDoc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                                >
                                  View
                                </a>
                              </div>
                            );
                          }
                          return userResume ? (
                            <a 
                              href={userResume} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                            >
                              <FileText className="w-5 h-5" />
                              View Resume
                            </a>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIScreeningPage;