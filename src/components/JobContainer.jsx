import React from 'react';
import { Grid, List, Loader2, CheckCircle, Search, X } from 'lucide-react';

const JobContainer = ({
  jobs,
  isLoading,
  currentView,
  onViewChange,
  jobCount,
  hasMoreJobs,
  onLoadMore,
  showAllJobs,
  children,
  searchQuery,
  onClearSearch
}) => {
  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-slate-950 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Container Header */}
      <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Results Count */}
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-sm font-semibold text-slate-900">
              {isLoading ? 'Searching...' : `${jobCount} jobs found`}
            </span>
            {searchQuery && (
              <span className="text-xs text-slate-500">
                for "<span className="text-slate-700 font-medium">{searchQuery}</span>"
              </span>
            )}
          </div>

          {/* View Toggle & Actions */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option>Most Recent</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
              <option>Most Relevant</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => onViewChange('grid')}
                className={`p-2 rounded-lg transition-all ${
                  currentView === 'grid' 
                    ? 'bg-white shadow-sm text-slate-900' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`p-2 rounded-lg transition-all ${
                  currentView === 'list' 
                    ? 'bg-white shadow-sm text-slate-900' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid/List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
          <p className="text-slate-600 text-sm mb-4">Try adjusting your search or filters</p>
          {onClearSearch && (
            <button 
              onClick={onClearSearch}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${
            currentView === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {children}
          </div>

          {/* Load More */}
          {hasMoreJobs && (
            <div className="text-center pt-4">
              <button
                onClick={onLoadMore}
                className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-xl font-semibold hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center mx-auto gap-2"
              >
                <span>Load More Jobs</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                  {jobCount - jobs.length}
                </span>
              </button>
            </div>
          )}

          {/* All Loaded */}
          {!hasMoreJobs && jobs.length > 0 && showAllJobs && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-emerald-900">All jobs loaded!</h3>
              <p className="text-sm text-emerald-700">You've seen all {jobs.length} available positions</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobContainer;