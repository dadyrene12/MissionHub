import React, { useState } from 'react';
import {
  Cpu, TrendingUp, DollarSign, Stethoscope, Briefcase,
  Bookmark, BookmarkCheck, BarChart3, Send, CheckCircle,
  ChevronRight, ChevronDown, ShieldCheck, GraduationCap,
  HeartHandshake, MapPin, Clock, Users, Building,
  Star, Wifi, AlertCircle, Calendar, Award, Target,
  MessageSquare, X, FileText, Code, Sparkles,
  Filter, Search, LayoutGrid, List, SlidersHorizontal,
  ArrowUpDown, ArrowUp, ArrowDown, ThumbsUp, ThumbsDown,
  ExternalLink, Eye, EyeOff
} from 'lucide-react';

const JobCard = ({
  job,
  view = 'grid',
  bookmarkedJobs = new Set(),
  appliedJobs = new Set(),
  comparisonJobs = [],
  expandedJobId = null,
  toggleBookmark = () => {},
  toggleComparison = () => {},
  applyForJob = () => {},
  toggleJobDetails = () => {},
  contactCompany = () => {},
  onViewDetails = null
}) => {
  const isBookmarked = bookmarkedJobs.has(job.id);
  const isApplied = appliedJobs.has(job.id);
  const isInComparison = comparisonJobs.find(j => j.id === job.id);

  const Icon = job.category === 'technology' ? Cpu : 
               job.category === 'marketing' ? TrendingUp : 
               job.category === 'finance' ? DollarSign : 
               job.category === 'healthcare' ? Stethoscope : Briefcase;

  const getCategoryIconBg = (category) => {
    switch (category) {
      case 'technology': return 'bg-blue-100 text-blue-600';
      case 'marketing': return 'bg-purple-100 text-purple-600';
      case 'finance': return 'bg-emerald-100 text-emerald-600';
      case 'healthcare': return 'bg-rose-100 text-rose-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-slate-500';
  };

  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = () => {
    setShowDetails(true);
    if (onViewDetails) onViewDetails(job);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  if (view === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 group">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                {job.logo ? (
                  <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <span className="text-slate-950 font-bold text-xl">{job.company?.substring(0, 2).toUpperCase() || 'CO'}</span>
                )}
              </div>
            </div>

            {/* Job Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-slate-700 transition-colors mb-2">
                    {job.title || 'Job Position'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-slate-700 text-sm font-medium">{job.company || 'Company'}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getCategoryIconBg(job.category)}`}>
                      {job.category || 'General'}
                    </span>
                    {job.remote && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1 border border-emerald-200">
                        <Wifi className="w-3 h-3" /> Remote
                      </span>
                    )}
                    {job.urgent && (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-full flex items-center gap-1 border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                    {job.featured && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1 border border-amber-200">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 ${getMatchScoreColor(job.matchScore || 75)} text-white text-sm font-bold rounded-lg`}>
                    {job.matchScore || 75}% Match
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center border border-slate-200 transition-all duration-200"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-5 h-5 text-amber-500 fill-current" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Job Details Row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{job.location || 'Location TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{job.salary || 'Competitive Salary'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span>{job.type || 'Full-time'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{job.experience || '2-5 years'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Posted {job.postedDate || 'Recently'}</span>
                </div>
              </div>

              {/* Description & Skills */}
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {job.description || 'Join our team to build amazing products and grow your career.'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(job.skills || ['React', 'TypeScript', 'Node.js', 'Tailwind CSS']).slice(0, 5).map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200">
                    {skill}
                  </span>
                ))}
                {(job.skills?.length || 4) > 5 && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg border border-slate-200">
                    +{(job.skills?.length || 4) - 5} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleViewDetails}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-950 text-sm font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => applyForJob(job.id)}
                  disabled={isApplied}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                    isApplied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-950 text-white hover:bg-slate-900'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply Now
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => contactCompany && contactCompany(job)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-950 text-sm font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300 group h-full flex flex-col">
      {/* Header */}
      <div className="relative p-5 bg-white">
        {/* Top Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {job.remote && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-emerald-200">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            )}
            {job.urgent && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-rose-200">
                <AlertCircle className="w-3 h-3" /> Urgent
              </span>
            )}
            {job.featured && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-amber-200">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
            className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 transition-all duration-200"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-amber-500 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Company Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <span className="text-slate-950 font-bold text-lg">{job.company?.substring(0, 2).toUpperCase() || 'CO'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-slate-950 font-semibold text-sm truncate">{job.company || 'Company'}</h4>
            <p className="text-slate-500 text-xs">{job.companySize || 'Hiring Now'}</p>
          </div>
          <div className={`px-3 py-1.5 ${getMatchScoreColor(job.matchScore || 75)} text-white text-xs font-bold rounded-lg`}>
            {job.matchScore || 75}%
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 mb-4" />
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5 flex flex-col">
        <h3 className="font-bold text-slate-950 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-slate-700 transition-colors">
          {job.title || 'Job Position'}
        </h3>
        
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getCategoryIconBg(job.category)}`}>
            {job.category || 'General'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {job.location || 'Remote'}
          </span>
        </div>

        <div className="flex items-center text-lg font-bold text-emerald-600 mb-4">
          <DollarSign className="w-5 h-5 mr-1 text-emerald-600" />
          <span>{job.salary || 'Competitive Salary'}</span>
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
          {job.description || 'Join our team to build amazing products and grow your career.'}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {(job.skills || ['React', 'Node.js', 'TypeScript']).slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
              {skill}
            </span>
          ))}
          {(job.skills?.length || 3) > 3 && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-md border border-slate-200">
              +{(job.skills?.length || 3) - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>{job.posted || 'Recently posted'}</span>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
          <button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-950 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => applyForJob(job.id)}
            disabled={isApplied}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isApplied
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Applied
              </>
            ) : (
              <>
                Apply
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={handleCloseDetails} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col">
            <div className="flex-shrink-0 bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <span className="text-slate-900 font-bold text-xl">{job.company?.substring(0, 2).toUpperCase() || 'CO'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{job.title || 'Job Position'}</h3>
                  <p className="text-white/60 text-sm flex items-center gap-2">
                    <Building className="w-4 h-4" /> {job.company || 'Company'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetails}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <MapPin className="w-4 h-4 text-slate-400 mb-2" />
                  <p className="text-slate-900 text-sm font-medium truncate">{job.location || 'Remote'}</p>
                  <p className="text-slate-400 text-xs">Location</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <DollarSign className="w-4 h-4 text-emerald-500 mb-2" />
                  <p className="text-emerald-600 text-sm font-bold truncate">{job.salary || 'Competitive'}</p>
                  <p className="text-slate-400 text-xs">Salary</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <Users className="w-4 h-4 text-slate-400 mb-2" />
                  <p className="text-slate-900 text-sm font-medium">{job.experience || '2-5 years'}</p>
                  <p className="text-slate-400 text-xs">Experience</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <Clock className="w-4 h-4 text-slate-400 mb-2" />
                  <p className="text-slate-900 text-sm font-medium">{job.posted || 'Recently'}</p>
                  <p className="text-slate-400 text-xs">Posted</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg">
                  {job.type || 'Full-time'}
                </span>
                {job.remote && (
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm rounded-lg border border-emerald-200">
                    <Wifi className="w-3 h-3 inline mr-1.5" /> Remote
                  </span>
                )}
                {job.featured && (
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 text-sm rounded-lg border border-amber-200">
                    <Star className="w-3 h-3 inline mr-1.5" /> Featured
                  </span>
                )}
                {job.urgent && (
                  <span className="px-4 py-2 bg-rose-100 text-rose-700 text-sm rounded-lg border border-rose-200">
                    <AlertCircle className="w-3 h-3 inline mr-1.5" /> Urgent
                  </span>
                )}
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2.5 text-slate-500" />
                  About the Job
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {job.description || 'No description provided by the employer.'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center">
                  <Code className="w-5 h-5 mr-2.5 text-slate-500" />
                  Skills Required
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(job.skills && job.skills.length > 0) ? job.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200">
                      {skill}
                    </span>
                  )) : (
                    <>
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200">Communication</span>
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200">Problem Solving</span>
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg border border-slate-200">Teamwork</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2.5 text-emerald-500" />
                  Key Responsibilities
                </h4>
                <ul className="space-y-2.5">
                  {(job.responsibilities && job.responsibilities.length > 0) ? job.responsibilities.map((resp, i) => (
                    <li key={i} className="text-slate-600 text-sm flex items-start">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                      {resp}
                    </li>
                  )) : (
                    <>
                      <li className="text-slate-600 text-sm flex items-start">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        Collaborate with team members
                      </li>
                      <li className="text-slate-600 text-sm flex items-start">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        Participate in meetings
                      </li>
                      <li className="text-slate-600 text-sm flex items-start">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0" />
                        Maintain documentation
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2.5 text-amber-500" />
                  Requirements
                </h4>
                <ul className="space-y-2.5">
                  {(job.requirements && job.requirements.length > 0) ? job.requirements.map((req, i) => (
                    <li key={i} className="text-slate-600 text-sm flex items-start">
                      <CheckCircle className="w-4 h-4 mr-3 text-amber-500 flex-shrink-0 mt-0.5" />
                      {req}
                    </li>
                  )) : (
                    <>
                      <li className="text-slate-600 text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 text-amber-500 flex-shrink-0 mt-0.5" />
                        Relevant experience
                      </li>
                      <li className="text-slate-600 text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 text-amber-500 flex-shrink-0 mt-0.5" />
                        Strong communication skills
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-base mb-3 flex items-center">
                  <HeartHandshake className="w-5 h-5 mr-2 text-slate-500" />
                  Benefits & Perks
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(job.benefits && job.benefits.length > 0) ? job.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      <span className="text-slate-600 text-sm">{benefit}</span>
                    </div>
                  )) : (
                    <>
                      <div className="flex items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="text-slate-600 text-sm">Health Insurance</span>
                      </div>
                      <div className="flex items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="text-slate-600 text-sm">Remote Work</span>
                      </div>
                      <div className="flex items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="text-slate-600 text-sm">401k Match</span>
                      </div>
                      <div className="flex items-center px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                        <span className="text-slate-600 text-sm">Paid Time Off</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-900 text-base mb-2 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-slate-500" />
                  About {job.company || 'Company'}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {job.companyDescription || `${job.company || 'Company'} is a great place to work with excellent culture and growth opportunities.`}
                </p>
                {job.companySize && (
                  <p className="text-slate-400 text-sm mt-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" /> {job.companySize}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 p-5 bg-white border-t border-slate-200">
              <button
                onClick={() => { applyForJob(job.id); handleCloseDetails(); }}
                disabled={isApplied}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  isApplied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Application Submitted
                  </>
                ) : (
                  <>
                    Apply Now
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
