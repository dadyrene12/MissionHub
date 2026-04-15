import React, { useState } from 'react';
import {
  Cpu, TrendingUp, DollarSign, Stethoscope, Briefcase,
  Bookmark, BookmarkCheck, BarChart3, Send, CheckCircle,
  ChevronRight, ChevronDown, ShieldCheck, GraduationCap,
  HeartHandshake, MapPin, Clock, Users, Building,
  Star, Wifi, AlertCircle, Calendar, Award, Target,
  MessageSquare, X, FileText, Code, Sparkles, Mail
} from 'lucide-react';

const JobCard = ({
  job,
  view = 'grid',
  bookmarkedJobs = new Set(),
  appliedJobs = new Set(),
  comparisonJobs = [],
  toggleBookmark = () => {},
  toggleComparison = () => {},
  applyForJob = () => {},
  contactCompany = () => {}
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const isBookmarked = bookmarkedJobs.has(job.id);
  const isApplied = appliedJobs.has(job.id);

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

  const handleViewDetails = () => setShowDetails(true);
  const handleCloseDetails = () => setShowDetails(false);

  const gridView = (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-1 group h-full flex flex-col">
      <div className="relative p-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {job.remote && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            )}
            {job.urgent && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="w-3 h-3" /> Urgent
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
            className="w-9 h-9 bg-white hover:bg-indigo-50 rounded-xl flex items-center justify-center border-2 border-slate-100 hover:border-indigo-200 transition-all duration-200 shadow-sm"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-amber-500 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 hover:text-indigo-500" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-2 border-slate-200 shadow-sm">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover" />
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
        <div className="h-px bg-slate-200 mb-4" />
      </div>

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
              isApplied ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            {isApplied ? <><CheckCircle className="w-4 h-4" /> Applied</> : <><Send className="w-4 h-4" /> Apply</>}
          </button>
        </div>
      </div>
    </div>
  );

  const listView = (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 group">
      <div className="p-5">
        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-100">
              {job.logo ? (
                <img src={job.logo} alt={job.company} className="w-11 h-11 rounded-lg object-cover" />
              ) : (
                <span className="text-slate-950 font-bold text-lg">{job.company?.substring(0, 2).toUpperCase() || 'CO'}</span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-950 mb-1.5 line-clamp-1">{job.title || 'Job Position'}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-700 text-sm font-medium">{job.company || 'Company'}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${getCategoryIconBg(job.category)}`}>{job.category || 'General'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2.5 py-1 ${getMatchScoreColor(job.matchScore || 75)} text-white text-xs font-bold rounded-md`}>{job.matchScore || 75}%</div>
                <button onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-500 fill-current" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location || 'Remote'}</span>
              <span className="flex items-center gap-1 text-emerald-600"><DollarSign className="w-3.5 h-3.5" />{job.salary || 'Competitive'}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.type || 'Full-time'}</span>
            </div>
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{job.description || 'Join our team to build amazing products.'}</p>
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <button onClick={handleViewDetails} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-950 text-sm rounded-lg border border-slate-200 flex items-center gap-1.5">
                Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => applyForJob(job.id)} disabled={isApplied} className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isApplied ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white'}`}>
                {isApplied ? <><CheckCircle className="w-3.5 h-3.5" /> Applied</> : <><Send className="w-3.5 h-3.5" /> Apply</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

const modal = showDetails && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={handleCloseDetails} />
      <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '56rem', maxHeight: 'calc(100vh - 2rem)', overflow: 'hidden', border: '2px solid #0f172a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(to bottom right, #1e293b, #020617)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '4rem', height: '4rem', backgroundColor: 'white', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {job.logo ? <img src={job.logo} alt={job.company} style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', objectFit: 'cover' }} /> : <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '1.5rem' }}>{job.company?.substring(0, 2).toUpperCase() || 'CO'}</span>}
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>{job.title || 'Job Position'}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building style={{ width: '1rem', height: '1rem' }} /> {job.company || 'Company'}</p>
            </div>
          </div>
          <button onClick={handleCloseDetails} style={{ width: '3rem', height: '3rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: '1.5rem', height: '1.5rem', color: 'rgba(255,255,255,0.8)' }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#6366f1', marginBottom: '0.75rem' }} />
              <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 'bold' }}>{job.location || 'Remote'}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Location</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <DollarSign style={{ width: '1.25rem', height: '1.25rem', color: '#10b981', marginBottom: '0.75rem' }} />
              <p style={{ color: '#059669', fontSize: '0.875rem', fontWeight: 'bold' }}>{job.salary || 'Competitive'}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Salary</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <Briefcase style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b', marginBottom: '0.75rem' }} />
              <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 'bold' }}>{job.type || 'Full-time'}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Job Type</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
              <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#8b5cf6', marginBottom: '0.75rem' }} />
              <p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 'bold' }}>{job.experience || 'Mid Level'}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Experience</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ padding: '0.625rem 1.25rem', backgroundColor: '#0f172a', color: 'white', fontSize: '0.875rem', fontWeight: '500', borderRadius: '0.75rem' }}>{job.type || 'Full-time'}</span>
            {job.remote && <span style={{ padding: '0.625rem 1.25rem', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.875rem', fontWeight: '500', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>Remote</span>}
            {job.urgent && <span style={{ padding: '0.625rem 1.25rem', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.875rem', fontWeight: '500', borderRadius: '0.75rem', border: '1px solid #fcd34d' }}>Urgent</span>}
            {job.category && <span style={{ padding: '0.625rem 1.25rem', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.875rem', fontWeight: '500', borderRadius: '0.75rem', border: '1px solid #c7d2fe' }}>{job.category}</span>}
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText style={{ width: '1.25rem', height: '1.25rem' }} /> About the Job</h4>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{job.description || 'No description provided.'}</p>
          </div>
          {(job.requirements || job.benefits) && (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            {job.requirements && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '1rem' }}>Requirements</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
            </div>
            )}
            {job.benefits && (
            <div>
              <h4 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '1rem' }}>Benefits</h4>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{job.benefits}</p>
            </div>
            )}
          </div>
          )}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code style={{ width: '1.25rem', height: '1.25rem' }} /> Skills Required</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(job.skills || ['Communication', 'Problem Solving']).map((skill, i) => (
                <span key={i} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.875rem', fontWeight: '500', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>{skill}</span>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building style={{ width: '1.25rem', height: '1.25rem' }} /> About {job.company || 'Company'}</h4>
            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.625' }}>Join our team and grow with us. We're looking for talented individuals who are passionate about their work.</p>
          </div>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleCloseDetails} style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>Close</button>
          <button onClick={() => { applyForJob(job.id); handleCloseDetails(); }} disabled={isApplied} style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: isApplied ? 'not-allowed' : 'pointer', backgroundColor: isApplied ? '#10b981' : '#0f172a', color: 'white' }}>
            {isApplied ? <><CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} /> Applied</> : <><Send style={{ width: '1.25rem', height: '1.25rem' }} /> Apply Now</>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {view === 'list' ? listView : gridView}
      {modal}
    </div>
  );
};

export default JobCard;