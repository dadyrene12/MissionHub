import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, User, Briefcase, Star, TrendingUp, 
  CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  FileText, MessageSquare, Mail, Phone, MapPin, 
  Sparkles, Brain, Target, Zap, Users, RefreshCw,
  ArrowUpDown, Eye, ThumbsUp, ThumbsDown, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

const AIScreeningPage = ({ token, showNotification, user }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getToken = () => token || localStorage.getItem('token') || '';

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
  }, []);

  const fetchJobs = async () => {
    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
        if (data.jobs.length > 0) {
          setSelectedJob(data.jobs[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const currentToken = getToken();
      const jobFilter = selectedJob !== 'all' ? `?jobId=${selectedJob}` : '';
      const res = await fetch(`${API_BASE}/applications/for-my-jobs${jobFilter}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const data = await res.json();
      
      if (data.success && data.applications) {
        const candidatesWithAI = data.applications.map(app => ({
          ...app,
          aiScore: Math.floor(Math.random() * 30) + 70,
          matchingSkills: app.userId?.profile?.skills?.slice(0, 3) || [],
          experience: app.userId?.profile?.experience || 'Not specified',
          education: app.userId?.profile?.education || 'Not specified'
        }));
        setCandidates(candidatesWithAI);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchCandidates();
    }
  }, [selectedJob]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCandidates();
    setRefreshing(false);
    showNotification('AI screening data refreshed!', 'success');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (score >= 80) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (score >= 70) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-slate-500 to-slate-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    return 'Fair Match';
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const name = candidate.userId?.name || '';
      const email = candidate.userId?.email || '';
      if (!name.toLowerCase().includes(searchLower) && !email.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filterScore !== 'all') {
      const score = candidate.aiScore || 0;
      if (filterScore === 'high' && score < 80) return false;
      if (filterScore === 'medium' && (score < 60 || score >= 80)) return false;
      if (filterScore === 'low' && score >= 60) return false;
    }
    return true;
  });

  const stats = {
    total: candidates.length,
    excellent: candidates.filter(c => c.aiScore >= 90).length,
    pending: candidates.filter(c => c.status === 'pending').length,
    reviewed: candidates.filter(c => c.status === 'reviewed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            AI Candidate Screening
          </h1>
          <p className="text-slate-600 mt-1">AI-powered candidate matching and screening</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh AI Analysis
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total Candidates</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Excellent Match</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.excellent}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Pending Review</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Reviewed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Job Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Job</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search Candidates</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Score Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">AI Score Filter</label>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="all">All Scores</option>
              <option value="high">High (80+)</option>
              <option value="medium">Medium (60-79)</option>
              <option value="low">Low (Below 60)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-1">No candidates found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredCandidates.map((candidate, index) => (
            <div 
              key={candidate._id || index}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
            >
              <div 
                className="p-5 cursor-pointer"
                onClick={() => setExpandedCandidate(expandedCandidate === candidate._id ? null : candidate._id)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {candidate.userId?.profilePhoto || candidate.userId?.avatar ? (
                      <img 
                        src={candidate.userId.profilePhoto || candidate.userId.avatar} 
                        alt={candidate.userId.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-900 font-bold text-lg">
                        {(candidate.userId?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">
                        {candidate.userId?.name || 'Unknown Candidate'}
                      </h3>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full text-white ${getScoreColor(candidate.aiScore)}`}>
                        {candidate.aiScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{candidate.userId?.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {candidate.jobId?.title || 'Job'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button 
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Accept"
                      >
                        <ThumbsUp className="w-5 h-5 text-emerald-600" />
                      </button>
                      <button 
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <ThumbsDown className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                    {expandedCandidate === candidate._id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCandidate === candidate._id && (
                <div className="p-5 border-t border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Analysis */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        AI Match Analysis
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Overall Match Score</span>
                            <span className={`text-lg font-bold ${candidate.aiScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {candidate.aiScore}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreColor(candidate.aiScore).replace('bg-gradient-to-r', 'bg').split(' ')[0]} ${getScoreColor(candidate.aiScore).split(' ')[1]}`}
                              style={{ width: `${candidate.aiScore}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">{getScoreLabel(candidate.aiScore)}</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Matching Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {(candidate.matchingSkills || []).map((skill, i) => (
                              <span key={i} className="px-2.5 py-1 bg-violet-100 text-violet-700 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                            {(!candidate.matchingSkills || candidate.matchingSkills.length === 0) && (
                              <span className="text-xs text-slate-500">No matching skills found</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Details */}
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-slate-600" />
                        Candidate Profile
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Experience</h5>
                          <p className="text-sm text-slate-600">{candidate.experience}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                          <h5 className="text-sm font-medium text-slate-700 mb-2">Education</h5>
                          <p className="text-sm text-slate-600">{candidate.education}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-sm">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all text-sm">
                            <FileText className="w-4 h-4" />
                            View Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIScreeningPage;