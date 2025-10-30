import React, { useState } from 'react';
import {
  Cpu, TrendingUp, DollarSign, Stethoscope, Briefcase,
  Bookmark, BookmarkCheck, BarChart3, Send, CheckCircle,
  ChevronRight, ChevronDown, ShieldCheck, GraduationCap,
  HeartHandshake, MapPin, Clock, Users, Building,
  Star, Loader2, AlertCircle, Calendar, Award, Target
} from 'lucide-react';

const JobCard = ({
  job,
  view = 'grid',
  bookmarkedJobs = new Set(),
  appliedJobs = new Set(),
  comparisonJobs = [],
  expandedJobId = null,
  toggleBookmark = () => console.warn('toggleBookmark not implemented'),
  toggleComparison = () => console.warn('toggleComparison not implemented'),
  applyForJob = () => console.warn('applyForJob not implemented'),
  toggleJobDetails = () => console.warn('toggleJobDetails not implemented')
}) => {
  
  const isBookmarked = bookmarkedJobs.has(job.id);
  const isApplied = appliedJobs.has(job.id);
  const isInComparison = comparisonJobs.find(j => j.id === job.id);
  const isExpanded = expandedJobId === job.id;
  
  const Icon = job.category === 'technology' ? Cpu : 
               job.category === 'marketing' ? TrendingUp : 
               job.category === 'finance' ? DollarSign : 
               job.category === 'healthcare' ? Stethoscope : Briefcase;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technology': return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'marketing': return 'bg-gradient-to-br from-purple-600 to-purple-800';
      case 'finance': return 'bg-gradient-to-br from-green-600 to-green-800';
      case 'healthcare': return 'bg-gradient-to-br from-red-600 to-red-800';
      default: return 'bg-gradient-to-br from-gray-600 to-gray-800';
    }
  };

  const getCategoryBorder = (category) => {
    switch (category) {
      case 'technology': return 'border-l-4 border-l-blue-500';
      case 'marketing': return 'border-l-4 border-l-purple-500';
      case 'finance': return 'border-l-4 border-l-green-500';
      case 'healthcare': return 'border-l-4 border-l-red-500';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'technology': return 'text-blue-600';
      case 'marketing': return 'text-purple-600';
      case 'finance': return 'text-green-600';
      case 'healthcare': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    if (score >= 80) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
  };

  // Visual Header Component
  const VisualHeader = ({ view }) => (
    <div className={`
      ${view === 'list' ? 'w-20 flex-shrink-0' : 'h-32'}
      relative flex flex-col justify-center items-center
      ${getCategoryColor(job.category)} text-white
      ${view === 'list' ? 'rounded-l-2xl' : 'rounded-t-2xl'}
      shadow-inner
    `}>
      {/* Category Icon */}
      <div className={`
        p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30
        ${view === 'list' ? '' : 'mb-2'}
        shadow-lg
      `}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Company Initial - Only show in grid view */}
      {view === 'grid' && (
        <div className="absolute bottom-3 left-3">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold border border-white/30">
            {job.company?.charAt(0) || 'C'}
          </div>
        </div>
      )}

      {/* Match Score - Grid View */}
      {view === 'grid' && (
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getMatchScoreColor(job.matchScore || 75)}`}>
          {job.matchScore || 75}%
        </div>
      )}
      
      {/* Bookmark/Compare Actions - Grid View */}
      {view === 'grid' && (
        <div className="absolute top-3 left-3 flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(job.id); }}
            className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 transition-all duration-300 hover:bg-white/30"
            title={isBookmarked ? "Remove bookmark" : "Bookmark job"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-white fill-current" />
            ) : (
              <Bookmark className="w-4 h-4 text-white/80" />
            )}
          </button>
        </div>
      )}
    </div>
  );

  if (view === 'list') {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group ${getCategoryBorder(job.category)}`}>
        <div className="flex">
          
          {/* Visual Header (List View) */}
          <VisualHeader view="list" />

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-xl ${getCategoryColor(job.category)} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors">{job.title}</h3>
                      <p className="text-gray-600 font-semibold text-sm">{job.company} • {job.companySize || 'Established Company'}</p>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center space-x-3 mb-3 ml-14">
                    {job.urgent && (
                      <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> URGENT
                      </span>
                    )}
                    {job.remote && (
                      <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-green-200 flex items-center">
                        <Users className="w-3 h-3 mr-1" /> REMOTE
                      </span>
                    )}
                    {job.featured && (
                      <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 flex items-center">
                        <Star className="w-3 h-3 mr-1" /> FEATURED
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Score (List View) */}
                <div className="text-right ml-4 flex-shrink-0">
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl shadow-md ${getMatchScoreColor(job.matchScore || 75)}`}>
                    <div className="text-right">
                      <p className="text-xs font-semibold">Match Score</p>
                      <p className="text-xl font-bold">{job.matchScore || 75}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-base text-gray-600 mb-4">
                <span className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  {job.location}
                </span>
                <span className="flex items-center font-bold text-lg text-green-700">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {job.salary || 'Competitive Salary'}
                </span>
                <span className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  {job.type || 'Full-time'}
                </span>
              </div>

              <p className="text-gray-700 mb-5 line-clamp-2 text-base leading-relaxed">{job.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(job.skills || ['Communication', 'Teamwork', 'Problem Solving', 'React']).slice(0, 5).map((skill, index) => (
                  <span
                    key={skill + index}
                    className="bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 5 && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200">
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                onClick={() => toggleJobDetails(job.id)}
                className="text-blue-700 hover:text-blue-800 font-semibold text-sm flex items-center transition-colors group"
              >
                {isExpanded ? 'Show Less Details' : 'View Full Details'}
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:scale-110" />
                ) : (
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:scale-110" />
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleBookmark(job.id)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-400 group"
                  title={isBookmarked ? "Remove bookmark" : "Bookmark job"}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-blue-600 fill-current group-hover:scale-110 transition-transform" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  )}
                </button>
                
                <button
                  onClick={() => toggleComparison(job)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                    isInComparison  
                      ? 'bg-green-100 text-green-600 border-green-300 shadow-md'  
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-md hover:shadow-lg'
                  }`}
                  title={isInComparison ? "Remove from comparison" : "Add to comparison"}
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => applyForJob(job.id)}
                  disabled={isApplied}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center ${
                    isApplied
                      ? 'bg-green-600 text-white cursor-not-allowed shadow-md'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      <span>Apply Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 border-t-4 border-dashed border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-green-600" /> 
                  Key Responsibilities
                </h4>
                <ul className="space-y-2">
                  {(job.responsibilities || [
                    'Collaborate with cross-functional teams',
                    'Develop and maintain software applications',
                    'Participate in code reviews and team meetings',
                    'Ensure high code quality and performance'
                  ]).map((r, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2.5 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-yellow-600" /> 
                  Requirements
                </h4>
                <ul className="space-y-2">
                  {(job.requirements || [
                    'Bachelor\'s degree in Computer Science or related field',
                    '3+ years of professional experience with React/Next.js',
                    'Strong problem-solving and communication skills',
                    'Experience with cloud platforms (AWS/Azure/GCP)'
                  ]).map((r, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2.5 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <HeartHandshake className="w-5 h-5 mr-2 text-pink-600" /> 
                  Benefits & Perks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(job.benefits || [
                    'Premium Health Insurance',
                    'Unlimited PTO',
                    'Flexible Work Hours (Hybrid/Remote)',
                    'Annual Professional Development Stipend',
                    '401k Matching'
                  ]).map((benefit, i) => (
                    <span
                      key={i}
                      className="bg-white text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group border border-gray-200 ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
      
      {/* Visual Header (Grid View) */}
      <VisualHeader view="grid" />

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-800 transition-colors line-clamp-1">{job.title}</h3>
            </div>
            <p className={`font-semibold text-sm mb-2 ${getCategoryText(job.category)}`}>{job.company}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job.urgent && (
            <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-200 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" /> URGENT
            </span>
          )}
          {job.remote && (
            <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-green-200 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1" /> REMOTE
            </span>
          )}
          {job.featured && (
            <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center">
              <Star className="w-3.5 h-3.5 mr-1" /> FEATURED
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 text-blue-600" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign className="w-4 h-4 mr-1.5 text-green-600" />
            <span className="font-bold text-gray-900">{job.salary || 'Competitive'}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Briefcase className="w-4 h-4 mr-1.5 text-purple-600" />
            <span className="capitalize">{job.type?.replace('-', ' ') || job.type || 'Full-time'}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {(job.skills || ['React', 'JavaScript', 'Tailwind']).slice(0, 3).map((skill, index) => (
              <span
                key={skill + index}
                className="bg-gray-50 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200"
              >
                {skill}
              </span>
            ))}
            {job.skills?.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                +{job.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

        {/* Expandable Details - Grid View */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100 pt-3 border-t border-gray-100 mb-3' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center mb-2">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-500" /> Responsibilities
              </h4>
              <ul className="text-xs text-gray-700 space-y-1">
                {(job.responsibilities || [
                  'Collaborate with team members',
                  'Complete assigned tasks efficiently',
                  'Participate in team meetings'
                ]).slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button
            onClick={() => toggleJobDetails(job.id)}
            className="text-blue-700 hover:text-blue-800 font-semibold text-sm flex items-center transition-colors group"
          >
            {isExpanded ? 'Show Less' : 'View Details'}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 ml-1 transition-transform group-hover:scale-110" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:scale-110" />
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleComparison(job)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isInComparison
                  ? 'bg-green-100 text-green-600 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyForJob(job.id)}
              disabled={isApplied}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center ${
                isApplied
                  ? 'bg-green-600 text-white cursor-not-allowed shadow-md'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isApplied ? (
                <CheckCircle className="w-4 h-4 mr-1.5" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              {isApplied ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;