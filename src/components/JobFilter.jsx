import React, { useState } from 'react';
import {
  Search, MapPin, SlidersHorizontal, X, Grid, List,
  Briefcase, Code, TrendingUp, DollarSign, Stethoscope,
  Filter, ChevronDown, ChevronUp, Trash2, Check
} from 'lucide-react';

const JobFilter = ({
  searchQuery,
  onSearchChange,
  locationQuery,
  onLocationChange,
  activeCategory,
  onCategoryChange,
  activeFilters,
  onFilterChange,
  onClearFilters,
  currentView,
  onViewChange,
  jobCount,
  isLoading,
  isTyping,
  categories = [],
  onOpenAdvancedFilters
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryIcons = {
    all: Briefcase,
    technology: Code,
    marketing: TrendingUp,
    finance: DollarSign,
    healthcare: Stethoscope
  };

  const getCategoryIcon = (catId) => {
    const Icon = categoryIcons[catId] || Briefcase;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <>
      {/* Main Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        {/* Top Row - Search and Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 outline-none text-slate-800 bg-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Location Input */}
          <div className="flex-1 lg:max-w-xs flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all">
            <MapPin className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Location or Remote..."
              value={locationQuery}
              onChange={(e) => onLocationChange(e.target.value)}
              className="flex-1 outline-none text-slate-800 bg-transparent text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                isFilterOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilters && Object.values(activeFilters).some(v => v && v !== 'all') && (
                <span className="ml-2 px-1.5 py-0.5 bg-slate-900 text-white text-xs rounded-full">
                  {Object.values(activeFilters).filter(v => v && v !== 'all').length}
                </span>
              )}
            </button>

            <button
              onClick={onClearFilters}
              className="flex items-center px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl border border-slate-200 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </button>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={() => onViewChange('grid')}
                className={`p-2 rounded-lg transition-all ${currentView === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`p-2 rounded-lg transition-all ${currentView === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="border-t border-slate-200 pt-4 mt-4 animate-slideDown">
            {/* Quick Filter Tags */}
            <div className="flex flex-wrap gap-3 mb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    activeCategory === category.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  {category.name}
                  <span className={`text-xs ${activeCategory === category.id ? 'text-white/70' : 'text-slate-400'}`}>
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Job Type */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Job Type</label>
                <select
                  value={activeFilters?.type || ''}
                  onChange={(e) => onFilterChange({ ...activeFilters, type: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Experience</label>
                <select
                  value={activeFilters?.experience || ''}
                  onChange={(e) => onFilterChange({ ...activeFilters, experience: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Salary Range</label>
                <select
                  value={activeFilters?.salary || ''}
                  onChange={(e) => onFilterChange({ ...activeFilters, salary: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="">Any Salary</option>
                  <option value="30000">$30k+</option>
                  <option value="50000">$50k+</option>
                  <option value="75000">$75k+</option>
                  <option value="100000">$100k+</option>
                  <option value="150000">$150k+</option>
                </select>
              </div>

              {/* Remote */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">Work Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onFilterChange({ ...activeFilters, remote: !activeFilters?.remote })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      activeFilters?.remote
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Remote
                  </button>
                  <button
                    onClick={() => onFilterChange({ ...activeFilters, remote: false })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      activeFilters?.remote === false
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    On-site
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilters && Object.values(activeFilters).some(v => v && v !== 'all' && v !== false) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                <span className="text-xs font-medium text-slate-500 self-center">Active:</span>
                {activeFilters.type && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full flex items-center gap-1">
                    Type: {activeFilters.type}
                    <button onClick={() => onFilterChange({ ...activeFilters, type: '' })} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeFilters.experience && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full flex items-center gap-1">
                    Exp: {activeFilters.experience}
                    <button onClick={() => onFilterChange({ ...activeFilters, experience: '' })} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeFilters.salary && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full flex items-center gap-1">
                    ${activeFilters.salary}+
                    <button onClick={() => onFilterChange({ ...activeFilters, salary: '' })} className="hover:text-slate-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeFilters.remote && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                    Remote Only
                    <button onClick={() => onFilterChange({ ...activeFilters, remote: false })} className="hover:text-emerald-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Counter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isTyping ? 'bg-amber-400 animate-pulse' : isLoading ? 'bg-slate-400 animate-pulse' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium text-slate-600">
            {isTyping ? 'Searching...' : isLoading ? 'Loading...' : `${jobCount} Jobs Found`}
          </p>
        </div>
        
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <select className="text-sm text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer font-medium">
            <option>Most Recent</option>
            <option>Salary: High to Low</option>
            <option>Salary: Low to High</option>
            <option>Most Relevant</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default JobFilter;
