import React, { useState } from 'react';
import { X, MapPin, Clock, DollarSign, Globe, Building2, Send, Bookmark, BookmarkCheck, Share2, CheckCircle, Loader2, ExternalLink, Users, ArrowRight, Briefcase, ShieldCheck } from 'lucide-react';

const SharedJobPanel = ({ job, onClose, applyForJob, user, setLoginOpen }) => {
  const [applying, setApplying] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!job) return null;

  const handleApply = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setApplying(true);
    try {
      await applyForJob(job.id || job._id);
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = () => {
    if (job.salaryMin && job.salaryMax) return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `$${job.salaryMin.toLocaleString()}+`;
    if (job.salaryMax) return `Up to $${job.salaryMax.toLocaleString()}`;
    return 'Competitive';
  };

  const jobLink = typeof window !== 'undefined' ? `${window.location.origin}/jobs/${job._id || job.id}` : `/jobs/${job._id || job.id}`;
  const shortDesc = job.description?.substring(0, 200) || 'No description provided.';
  const needsReadMore = (job.description?.length || 0) > 200;

  const copyLink = () => {
    navigator.clipboard.writeText(jobLink);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-modal-enter">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Shared from</p>
                <h2 className="text-white font-bold">{job.company || 'Company'}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
              <Clock className="w-3 h-3" /> {job.type}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-md">
              <DollarSign className="w-3 h-3" /> {formatSalary()}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.remote && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> Remote
              </span>
            )}
            {job.urgent && (
              <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                Urgent
              </span>
            )}
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
              {job.category}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {showFullDesc ? job.description : shortDesc}
              {needsReadMore && !showFullDesc && '...'}
            </p>
            {needsReadMore && (
              <button 
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-xs text-indigo-600 font-medium mt-1 hover:underline"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 mb-2">Skills needed</p>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(job.skills) ? job.skills : job.skills?.split(',')).slice(0, 6).map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{jobLink}</span>
            </div>
            <button 
              onClick={copyLink}
              className="text-xs text-indigo-600 font-medium hover:underline"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <button 
              onClick={handleApply}
              disabled={applying}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${applying ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Applying...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Apply Now
                </>
              )}
            </button>
            <button 
              onClick={() => setBookmarked(!bookmarked)}
              className={`px-3 py-2.5 rounded-lg border transition-colors ${bookmarked ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button 
              onClick={copyLink}
              className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {job.applicants?.length || 0} applicants
            </span>
            <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">Powered by Mission Hub</span>
          <a href="/" className="text-xs text-indigo-600 font-medium flex items-center gap-1">
            View more jobs <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SharedJobPanel;