import React, { useState } from 'react';
import {
  Cpu, TrendingUp, DollarSign, Stethoscope, Briefcase,
  Bookmark, BookmarkCheck, BarChart3, Send, CheckCircle,
  ChevronRight, ChevronDown, ShieldCheck, GraduationCap,
  HeartHandshake, MapPin, Map, Clock, Users, Building,
  Star, Wifi, AlertCircle, Calendar, Award, Target,
  MessageSquare, X, FileText, Code, Sparkles, Mail, Loader2,
  Share2, CheckSquare, Gift
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
  contactCompany = () => {},
  isApplying = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
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
          <button
            onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
            className="w-9 h-9 bg-white hover:bg-indigo-50 rounded-xl flex items-center justify-center border-2 border-slate-100 hover:border-indigo-200 transition-all duration-200 shadow-sm"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-slate-400 hover:text-indigo-500" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border-2 border-slate-200 shadow-sm">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover" onError={(e) => e.target.style.display = 'none'} />
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
            disabled={isApplied || isApplying}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              isApplied ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            {isApplied ? <><CheckCircle className="w-4 h-4" /> Applied</> : isApplying ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</> : <><Send className="w-4 h-4" /> Apply</>}
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
                <img src={job.logo} alt={job.company} className="w-11 h-11 rounded-lg object-cover" onError={(e) => e.target.style.display = 'none'} />
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
                <button onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200" title="Share">
                  <Share2 className="w-4 h-4 text-slate-400" />
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
              <button onClick={() => applyForJob(job.id)} disabled={isApplied || isApplying} className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${isApplied ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white'}`}>
                {isApplied ? <><CheckCircle className="w-3.5 h-3.5" /> Applied</> : isApplying ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying</> : <><Send className="w-3.5 h-3.5" /> Apply</>}
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
      <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '48rem', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'white', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              {job.logo ? <img src={job.logo} alt={job.company} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} /> : <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '1.25rem' }}>{job.company?.substring(0, 2).toUpperCase() || 'CO'}</span>}
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem', lineHeight: 1.3 }}>{job.title || 'Job Position'}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building style={{ width: '0.875rem', height: '0.875rem' }} /> {job.company || 'Company'}</p>
            </div>
          </div>
          <button onClick={handleCloseDetails} style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: '1.25rem', height: '1.25rem', color: 'rgba(255,255,255,0.8)' }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin style={{ width: '1.125rem', height: '1.125rem', color: '#0284c7' }} /></div>
              <div><p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600' }}>{job.location || 'Remote'}</p><p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Location</p></div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign style={{ width: '1.125rem', height: '1.125rem', color: '#10b981' }} /></div>
              <div><p style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '600' }}>{job.salary || 'Competitive'}</p><p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Salary</p></div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#fffbeb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase style={{ width: '1.125rem', height: '1.125rem', color: '#f59e0b' }} /></div>
              <div><p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600' }}>{job.type || 'Full-time'}</p><p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Job Type</p></div>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#f5f3ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock style={{ width: '1.125rem', height: '1.125rem', color: '#8b5cf6' }} /></div>
              <div><p style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: '600' }}>{job.experience || 'Mid Level'}</p><p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Experience</p></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ padding: '0.375rem 0.875rem', backgroundColor: '#0f172a', color: 'white', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px' }}>{job.type || 'Full-time'}</span>
            {job.remote && <span style={{ padding: '0.375rem 0.875rem', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wifi style={{ width: '0.75rem', height: '0.75rem' }} />Remote</span>}
            {job.urgent && <span style={{ padding: '0.375rem 0.875rem', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px' }}>Urgent</span>}
            {job.category && <span style={{ padding: '0.375rem 0.875rem', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: '600', borderRadius: '9999px' }}>{job.category}</span>}
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText style={{ width: '1.125rem', height: '1.125rem' }} /> About the Job</h4>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{job.description || 'No description provided.'}</p>
          </div>
          {job.requirements && (
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare style={{ width: '1.125rem', height: '1.125rem' }} /> Requirements</h4>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
          </div>
          )}
          {job.benefits && (
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Gift style={{ width: '1.125rem', height: '1.125rem' }} /> Benefits</h4>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{job.benefits}</p>
          </div>
          )}
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code style={{ width: '1.125rem', height: '1.125rem' }} /> Skills Required</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(job.skills || ['JavaScript', 'React', 'Node.js']).map((skill, i) => (
                <span key={i} style={{ padding: '0.375rem 0.75rem', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.8125rem', fontWeight: '500', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>{skill}</span>
              ))}
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building style={{ width: '1.125rem', height: '1.125rem' }} /> About {job.company || 'Company'}</h4>
            <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: '1.625' }}>Join our team and grow with us. We're looking for talented individuals who are passionate about their work.</p>
          </div>
        </div>
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
          <button onClick={handleCloseDetails} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}>Close</button>
          <button onClick={() => { applyForJob(job.id); handleCloseDetails(); }} disabled={isApplied || isApplying} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.625rem', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: isApplied ? 'not-allowed' : 'pointer', backgroundColor: isApplied ? '#10b981' : '#0f172a', color: 'white' }}>
            {isApplied ? <><CheckCircle style={{ width: '1.125rem', height: '1.125rem' }} /> Applied</> : isApplying ? <><Loader2 style={{ width: '1.125rem', height: '1.125rem' }} className="animate-spin" /> Applying...</> : <><Send style={{ width: '1.125rem', height: '1.125rem' }} /> Apply Now</>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {view === 'list' ? listView : gridView}
      {modal}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setShowShareModal(false)} />
          <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '1rem', width: '100%', maxWidth: '28rem', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Share Job</h3>
              <button onClick={() => setShowShareModal(false)} style={{ padding: '0.25rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X style={{ width: '1.25rem', height: '1.25rem', color: '#64748b' }} />
              </button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '0.5rem' }}>Job: <span style={{ fontWeight: 500, color: '#0f172a' }}>{job.title}</span></p>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>Add a message (optional)</label>
              <textarea 
                value={shareMessage} 
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Hey! Check out this job opportunity..."
                style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#0f172a', resize: 'none', height: '6rem', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowShareModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={() => {
                  const jobLink = `${window.location.origin}/jobs/${job._id || job.id}`;
                  const fullMessage = shareMessage 
                    ? `${shareMessage}\n\nCheck out this job: ${jobLink}`
                    : `Check out this job: ${jobLink}`;
                  navigator.clipboard.writeText(fullMessage);
                  setShowShareModal(false);
                }} 
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                <Share2 style={{ width: '1rem', height: '1rem' }} /> Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;