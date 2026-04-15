import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Star, Clock, MessageSquare, Brain, Target, Users, 
  RefreshCw, Eye, AlertCircle, Loader2, Wand2, Award, Check, X, 
  Crown, TrendingUp, GraduationCap, CalendarPlus, ChevronDown, Filter
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

const AIScreeningPage = ({ token, showNotification }) => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [screeningId, setScreeningId] = useState(null);
  const [screeningAll, setScreeningAll] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [error, setError] = useState(null);

  const getToken = () => token || localStorage.getItem('token') || '';

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidates();
    } else {
      setCandidates([]);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/applications/for-my-jobs?jobId=${selectedJobId}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const apps = Array.isArray(data.data) ? data.data : [];
        setCandidates(apps.map(app => ({
          ...app,
          aiScore: app.aiScreening?.overallScore || 0,
          aiData: app.aiScreening || null,
        })));
      } else {
        setCandidates([]);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
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
        body: JSON.stringify({ applicationId })
      });
      const data = await res.json();
      
      if (data.success) {
        setCandidates(prev => prev.map(c => 
          c._id === applicationId 
            ? { ...c, aiScore: data.screening.overallScore, aiData: data.screening }
            : c
        ));
        showNotification?.('Analysis complete!', 'success');
      } else {
        showNotification?.(data.message || 'Screening failed', 'error');
      }
    } catch (err) {
      console.error('Screen error:', err);
      showNotification?.('Screening failed', 'error');
    } finally {
      setScreeningId(null);
    }
  };

  const screenAll = async () => {
    const unscreened = candidates.filter(c => !c.aiData);
    if (unscreened.length === 0) {
      showNotification?.('All candidates screened!', 'info');
      return;
    }

    setScreeningAll(true);
    for (const candidate of unscreened) {
      await screenCandidate(candidate._id);
      await new Promise(r => setTimeout(r, 500));
    }
    setScreeningAll(false);
    showNotification?.(`Screened ${unscreened.length} candidates!`, 'success');
  };

  const selectedJob = jobs.find(j => j._id === selectedJobId);
  const stats = {
    total: candidates.length,
    screened: candidates.filter(c => c.aiData).length,
    unscreened: candidates.filter(c => !c.aiData).length,
    excellent: candidates.filter(c => (c.aiScore || 0) >= 85).length,
    avgScore: candidates.filter(c => c.aiScore).length > 0 
      ? Math.round(candidates.filter(c => c.aiScore).reduce((a, c) => a + c.aiScore, 0) / candidates.filter(c => c.aiScore).length)
      : 0
  };

  const sortedCandidates = [...candidates].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  const getScoreStyle = (score) => {
    if (score >= 85) return 'bg-emerald-500 text-white';
    if (score >= 70) return 'bg-blue-500 text-white';
    if (score >= 50) return 'bg-amber-500 text-white';
    return 'bg-slate-400 text-white';
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Good';
    return 'Review';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI Screening
          </h1>
          <p className="text-slate-500 text-sm mt-1">Analyze candidates with AI</p>
        </div>
        <button
          onClick={fetchCandidates}
          disabled={!selectedJobId || loading}
          className="p-2 hover:bg-slate-100 rounded-xl disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Job Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Select Job Position
        </label>
        <div className="flex gap-3">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">-- Select a job --</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.location || 'Remote'}
              </option>
            ))}
          </select>
          {selectedJobId && candidates.length > 0 && (
            <button
              onClick={screenAll}
              disabled={screeningAll || stats.unscreened === 0}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {screeningAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Screening...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Screen All ({stats.unscreened})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {selectedJobId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-slate-500 text-sm">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <p className="text-violet-500 text-sm">Screened</p>
            <p className="text-2xl font-bold text-violet-700">{stats.screened}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-amber-500 text-sm">Unscreened</p>
            <p className="text-2xl font-bold text-amber-700">{stats.unscreened}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-emerald-500 text-sm">Avg Score</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.avgScore}%</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && selectedJobId && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* No Job Selected */}
      {!selectedJobId && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Select a Job Position</h3>
          <p className="text-slate-500">Choose a job above to view and screen candidates</p>
        </div>
      )}

      {/* No Candidates */}
      {selectedJobId && !loading && candidates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-900 font-semibold mb-1">No Candidates Yet</h3>
          <p className="text-slate-500 text-sm">Candidates will appear here when they apply</p>
        </div>
      )}

      {/* Candidates List */}
      {selectedJobId && !loading && candidates.length > 0 && (
        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => {
            const isTop = index === 0 && candidate.aiScore >= 85;
            
            return (
              <div
                key={candidate._id}
                className={`bg-white border-2 rounded-2xl overflow-hidden ${
                  isTop ? 'border-emerald-400' : 'border-slate-200'
                }`}
              >
                {isTop && (
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-semibold">Top Match</span>
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                        {candidate.userId?.profilePhoto ? (
                          <img src={candidate.userId.profilePhoto} alt="" className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <span className="text-slate-700 font-bold text-xl">
                            {(candidate.userId?.name || 'U').charAt(0)}
                          </span>
                        )}
                      </div>
                      {candidate.aiScore > 0 && (
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getScoreStyle(candidate.aiScore)}`}>
                          {candidate.aiScore}%
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{candidate.userId?.name || 'Candidate'}</h4>
                          <p className="text-sm text-slate-500">{candidate.userId?.email}</p>
                        </div>
                        {candidate.aiScore > 0 && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getScoreStyle(candidate.aiScore)}`}>
                            {getScoreLabel(candidate.aiScore)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {candidate.userId?.profile?.experience || 'Exp N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {candidate.userId?.profile?.education || 'Edu N/A'}
                        </span>
                      </div>

                      {candidate.aiData && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {candidate.aiData.skillsMatch?.matchedSkills?.slice(0, 4).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg">
                              {skill}
                            </span>
                          ))}
                          {candidate.aiData.skillsMatch?.missingSkills?.slice(0, 2).map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg">
                              Missing: {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => screenCandidate(candidate._id)}
                      disabled={screeningId === candidate._id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {screeningId === candidate._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      {candidate.aiData ? 'Re-Screen' : 'Screen'}
                    </button>
                    <button
                      onClick={() => setShowModal(candidate)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <button className="px-4 py-2.5 bg-emerald-100 hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-xl font-medium transition-all">
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                  (showModal.aiScore || 0) >= 85 ? 'bg-emerald-500' : (showModal.aiScore || 0) >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                }`}>
                  {showModal.aiScore || 0}%
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{showModal.userId?.name}</h3>
                  <p className="text-slate-500 text-sm">{showModal.userId?.email}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {showModal.aiData ? (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{showModal.aiData.skillsMatch?.score || 0}%</p>
                      <p className="text-xs text-slate-500">Skills</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{showModal.aiData.experienceMatch?.score || 0}%</p>
                      <p className="text-xs text-slate-500">Experience</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{showModal.aiData.resumeAnalysis?.score || 0}%</p>
                      <p className="text-xs text-slate-500">Resume</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold">{showModal.aiData.culturalFitScore || 0}%</p>
                      <p className="text-xs text-slate-500">Culture</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-950 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-emerald-500" /> Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(showModal.aiData.strengths || []).map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-950 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> Concerns
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(showModal.aiData.concerns || []).map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm">{c}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-950 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-violet-500" /> Interview Questions
                    </h4>
                    <div className="space-y-2">
                      {(showModal.aiData.interviewQuestions || []).map((q, i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">
                          {i + 1}. {q}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-violet-50 rounded-xl p-4">
                    <p className="font-semibold text-violet-900 mb-1">Recommendation</p>
                    <p className="text-sm text-violet-800">{showModal.aiData.recommendation}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">No analysis yet</p>
                  <button
                    onClick={() => { screenCandidate(showModal._id); setShowModal(null); }}
                    className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium"
                  >
                    Run Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIScreeningPage;
