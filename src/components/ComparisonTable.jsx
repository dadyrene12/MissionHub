// src/components/ComparisonTable.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Trash2, X, CheckCircle, Brain, Target, 
  Award, AlertTriangle, ThumbsUp, Star, Zap, TrendingUp,
  MessageSquare, Lightbulb, Clock, Users, Map
} from 'lucide-react';

// AI Analysis Component
const AIAnalysisPanel = ({ jobs, userProfile }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeJobs();
  }, [jobs, userProfile]);

  const analyzeJobs = () => {
    setLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysisResults = jobs.map(job => {
        const matchScore = calculateMatchScore(job, userProfile);
        const gaps = analyzeGaps(job, userProfile);
        const recommendations = generateRecommendations(job, userProfile);
        
        return {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          matchScore,
          gaps,
          recommendations,
          overallRating: getOverallRating(matchScore, gaps.length),
          bestFor: getBestFor(job, userProfile)
        };
      });

      // Find the best match
      const bestMatch = analysisResults.reduce((best, current) => 
        current.matchScore > best.matchScore ? current : best
      );

      setAnalysis({
        individualAnalysis: analysisResults,
        bestMatch,
        comparisonInsights: generateComparisonInsights(analysisResults),
        timestamp: new Date()
      });
      setLoading(false);
    }, 1500);
  };

  const calculateMatchScore = (job, profile) => {
    let score = 0;
    
    // Skills matching (40%)
    if (job.skills && profile.skills) {
      const matchedSkills = job.skills.filter(skill => 
        profile.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      score += (matchedSkills.length / Math.max(job.skills.length, 1)) * 40;
    }

    // Experience matching (25%)
    const experienceLevels = { 'entry': 1, 'junior': 2, 'mid': 3, 'senior': 4, 'lead': 5 };
    const jobLevel = experienceLevels[job.experience?.toLowerCase()] || 3;
    const userLevel = experienceLevels[profile.experience?.toLowerCase()] || 3;
    score += (Math.min(userLevel / jobLevel, 1)) * 25;

    // Location matching (15%)
    if (job.remote || (profile.location && job.location?.toLowerCase().includes(profile.location.toLowerCase()))) {
      score += 15;
    } else {
      score += 5;
    }

    // Salary expectations (10%)
    if (profile.salaryExpectation && job.salary) {
      const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
      if (jobSalary >= profile.salaryExpectation * 0.8) {
        score += 10;
      }
    } else {
      score += 5;
    }

    // Company culture fit (10%)
    score += 10; // Default score

    return Math.min(Math.round(score), 100);
  };

  const analyzeGaps = (job, profile) => {
    const gaps = [];

    // Skill gaps
    if (job.skills && profile.skills) {
      const missingSkills = job.skills.filter(skill => 
        !profile.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      if (missingSkills.length > 0) {
        gaps.push({
          type: 'skills',
          message: `Missing ${missingSkills.length} required skills`,
          details: missingSkills.slice(0, 3),
          priority: missingSkills.length > 2 ? 'high' : 'medium'
        });
      }
    }

    // Experience gap
    const experienceLevels = { 'entry': 1, 'junior': 2, 'mid': 3, 'senior': 4, 'lead': 5 };
    const jobLevel = experienceLevels[job.experience?.toLowerCase()] || 3;
    const userLevel = experienceLevels[profile.experience?.toLowerCase()] || 3;
    
    if (userLevel < jobLevel) {
      gaps.push({
        type: 'experience',
        message: `Role requires ${job.experience} level (you have ${profile.experience})`,
        priority: jobLevel - userLevel >= 2 ? 'high' : 'medium'
      });
    }

    // Location gap
    if (!job.remote && profile.location && job.location && 
        !job.location.toLowerCase().includes(profile.location.toLowerCase())) {
      gaps.push({
        type: 'location',
        message: `On-site requirement in ${job.location}`,
        priority: 'medium'
      });
    }

    return gaps;
  };

  const generateRecommendations = (job, profile) => {
    const recommendations = [];

    if (calculateMatchScore(job, profile) >= 80) {
      recommendations.push({
        type: 'application',
        message: 'Strong match! Consider applying immediately',
        priority: 'high',
        icon: 'thumbs-up'
      });
    }

    const gaps = analyzeGaps(job, profile);
    gaps.forEach(gap => {
      if (gap.priority === 'high') {
        recommendations.push({
          type: 'improvement',
          message: `Focus on: ${gap.message}`,
          priority: 'high',
          icon: 'target'
        });
      }
    });

    // Additional recommendations based on job features
    if (job.remote) {
      recommendations.push({
        type: 'benefit',
        message: 'Remote work opportunity available',
        priority: 'low',
        icon: 'wifi'
      });
    }

    if (job.matchScore > 90) {
      recommendations.push({
        type: 'advantage',
        message: 'Excellent cultural and skill fit',
        priority: 'medium',
        icon: 'star'
      });
    }

    return recommendations;
  };

  const getOverallRating = (matchScore, gapCount) => {
    if (matchScore >= 90 && gapCount === 0) return 'excellent';
    if (matchScore >= 75 && gapCount <= 1) return 'good';
    if (matchScore >= 60) return 'fair';
    return 'poor';
  };

  const getBestFor = (job, profile) => {
    const matchScore = calculateMatchScore(job, profile);
    
    if (matchScore >= 90) return 'Career Growth & Skill Match';
    if (matchScore >= 80) return 'Strong Skill Alignment';
    if (matchScore >= 70) return 'Good Learning Opportunity';
    if (matchScore >= 60) return 'Entry Point with Growth Potential';
    return 'Consider Skill Development First';
  };

  const generateComparisonInsights = (analysisResults) => {
    const insights = [];
    
    if (analysisResults.length >= 2) {
      const scores = analysisResults.map(a => a.matchScore);
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      
      if (maxScore - minScore > 20) {
        insights.push({
          type: 'variance',
          message: `Significant match score variance (${minScore}% - ${maxScore}%)`,
          details: 'Consider focusing on higher-match opportunities first'
        });
      }

      // Find jobs with specific strengths
      const remoteJobs = analysisResults.filter(a => 
        jobs.find(j => j.id === a.jobId)?.remote
      );
      if (remoteJobs.length > 0) {
        insights.push({
          type: 'remote',
          message: `${remoteJobs.length} remote position${remoteJobs.length > 1 ? 's' : ''} available`,
          details: 'Great for flexibility and work-life balance'
        });
      }

      // High growth potential
      const growthJobs = analysisResults.filter(a => a.matchScore >= 80 && a.gaps.length <= 1);
      if (growthJobs.length > 0) {
        insights.push({
          type: 'growth',
          message: `${growthJobs.length} high-growth opportunity${growthJobs.length > 1 ? 'ies' : ''}`,
          details: 'Strong alignment with your career trajectory'
        });
      }
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900">AI Analysis in Progress</h3>
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-sm text-gray-600">Analyzing job compatibility with your profile...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Career Advisor</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Just now</span>
        </div>
      </div>

      {/* Best Match Highlight */}
      {analysis.bestMatch && (
        <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-green-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Best Match</h4>
                <p className="text-sm text-gray-600">
                  {analysis.bestMatch.jobTitle} at {analysis.bestMatch.company}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                analysis.bestMatch.matchScore >= 90 ? 'text-green-600' :
                analysis.bestMatch.matchScore >= 75 ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {analysis.bestMatch.matchScore}%
              </div>
              <div className="text-xs text-gray-500">Match Score</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            {analysis.bestMatch.bestFor}
          </p>
        </div>
      )}

      {/* Individual Job Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {analysis.individualAnalysis.map((jobAnalysis) => (
          <div key={jobAnalysis.jobId} className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{jobAnalysis.jobTitle}</h4>
                <p className="text-xs text-gray-500">{jobAnalysis.company}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                jobAnalysis.overallRating === 'excellent' ? 'bg-green-100 text-green-800' :
                jobAnalysis.overallRating === 'good' ? 'bg-blue-100 text-blue-800' :
                jobAnalysis.overallRating === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {jobAnalysis.overallRating}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Match Score:</span>
                <span className={`font-semibold ${
                  jobAnalysis.matchScore >= 90 ? 'text-green-600' :
                  jobAnalysis.matchScore >= 75 ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {jobAnalysis.matchScore}%
                </span>
              </div>
              
              {jobAnalysis.gaps.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Areas to improve:</span>
                  <div className="mt-1 space-y-1">
                    {jobAnalysis.gaps.slice(0, 2).map((gap, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <AlertTriangle className={`w-3 h-3 mr-1 ${
                          gap.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                        <span className="text-gray-700">{gap.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Insights */}
      {analysis.comparisonInsights.length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
            Comparison Insights
          </h4>
          <div className="space-y-2">
            {analysis.comparisonInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{insight.message}</p>
                  <p className="text-gray-600 text-xs">{insight.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Recommendations */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
          Recommended Actions
        </h4>
        <div className="space-y-2 text-sm">
          {analysis.bestMatch && analysis.bestMatch.matchScore >= 75 && (
            <div className="flex items-center space-x-2 text-green-700">
              <ThumbsUp className="w-4 h-4" />
              <span>Apply to <strong>{analysis.bestMatch.jobTitle}</strong> first - it's your best match!</span>
            </div>
          )}
          
          {analysis.individualAnalysis.some(a => a.gaps.length > 0) && (
            <div className="flex items-center space-x-2 text-yellow-700">
              <Target className="w-4 h-4" />
              <span>Focus on skill development in identified gap areas</span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-blue-700">
            <Users className="w-4 h-4" />
            <span>Consider company culture and team fit beyond technical requirements</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonTable = ({ comparisonJobs, setComparisonJobs, toggleComparison, appliedJobs, applyForJob, userProfile }) => {
  const [showAIAnalysis, setShowAIAnalysis] = useState(true);

  if (comparisonJobs.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-lg">
        <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Start Comparing Jobs</h3>
        <p className="text-gray-600">Add up to 3 jobs to this panel to see a side-by-side comparison of features.</p>
        <button onClick={() => setComparisonJobs([])} className="mt-4 text-blue-600 hover:underline">
          Back to Job Listings
        </button>
      </div>
    );
  }

  const maxJobs = 3;
  const emptyCells = Array(maxJobs - comparisonJobs.length).fill(null);
  
  const features = [
    { key: 'company', label: 'Company' },
    { key: 'location', label: 'Location', renderer: (value, job) => (
      <div className="flex items-center justify-center space-x-1">
        <MapPin className="w-4 h-4 text-gray-500" />
        <span>{value}</span>
        {job.remote && <span className="text-green-600 text-xs">(Remote)</span>}
      </div>
    )},
    { key: 'salary', label: 'Salary Range' },
    { key: 'experience', label: 'Experience Level' },
    { key: 'remote', label: 'Remote Option', renderer: (value) => value ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" /> },
    { key: 'matchScore', label: 'Match Score', renderer: (value) => <span className={`font-bold ${value > 90 ? 'text-green-600' : value > 80 ? 'text-yellow-600' : 'text-blue-600'}`}>{value}%</span> },
    { key: 'applicants', label: 'Total Applicants' },
    { key: 'companySize', label: 'Company Size' },
    { key: 'skills', label: 'Key Skills', renderer: (skills) => skills ? skills.slice(0, 3).join(', ') + (skills.length > 3 ? ` (+${skills.length - 3})` : '') : 'N/A' },
    { key: 'workCulture', label: 'Work Culture' },
    { key: 'posted', label: 'Posted' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Job Comparison ({comparisonJobs.length}/3)</h2>
          <p className="text-gray-600 mt-1">AI-powered analysis of your job opportunities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAIAnalysis(!showAIAnalysis)}
            className={`px-4 py-2 rounded-lg transition-colors font-semibold flex items-center ${
              showAIAnalysis 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Brain className="w-4 h-4 mr-2" />
            {showAIAnalysis ? 'Hide AI Analysis' : 'Show AI Analysis'}
          </button>
          <button
            onClick={() => setComparisonJobs([])}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear All
          </button>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAIAnalysis && userProfile && (
        <AIAnalysisPanel jobs={comparisonJobs} userProfile={userProfile} />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Feature
              </th>
              {comparisonJobs.map(job => (
                <th key={job.id} className="px-6 py-3 text-center text-sm font-bold text-blue-600 uppercase tracking-wider w-1/4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="max-w-xs truncate">{job.title}</span>
                      <button 
                        onClick={() => toggleComparison(job)} 
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-normal text-gray-500 max-w-xs truncate">{job.company}</p>
                    {job.aiMatchScore && (
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        job.aiMatchScore >= 90 ? 'bg-green-100 text-green-800' :
                        job.aiMatchScore >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        AI Score: {job.aiMatchScore}%
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {emptyCells.map((_, index) => (
                <th key={`empty-${index}`} className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">
                  <div className="flex flex-col items-center space-y-2">
                    <span>Add Job</span>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map(feature => (
              <tr key={feature.key} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    {feature.key === 'matchScore' && <Target className="w-4 h-4 text-blue-500" />}
                    {feature.key === 'remote' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {feature.key === 'salary' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    <span>{feature.label}</span>
                  </div>
                </td>
                {comparisonJobs.map(job => (
                  <td key={job.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                    {feature.renderer ? feature.renderer(job[feature.key], job) : job[feature.key] || 'N/A'}
                  </td>
                ))}
                {emptyCells.map((_, index) => (
                  <td key={`empty-cell-${index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center italic">
                    -
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>AI Recommendation</span>
                </div>
              </td>
              {comparisonJobs.map(job => {
                const matchScore = job.aiMatchScore || job.matchScore || 0;
                let recommendation = '';
                let color = '';
                
                if (matchScore >= 90) {
                  recommendation = 'Excellent match! Apply now';
                  color = 'text-green-600';
                } else if (matchScore >= 75) {
                  recommendation = 'Strong match - Recommended';
                  color = 'text-blue-600';
                } else if (matchScore >= 60) {
                  recommendation = 'Good potential - Consider';
                  color = 'text-yellow-600';
                } else {
                  recommendation = 'Needs improvement';
                  color = 'text-red-600';
                }
                
                return (
                  <td key={`recommendation-${job.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`font-semibold ${color}`}>{recommendation}</span>
                  </td>
                );
              })}
              {emptyCells.map((_, index) => (
                <td key={`empty-recommendation-${index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center italic">
                  -
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Actions
              </td>
              {comparisonJobs.map(job => (
                <td key={`action-${job.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                  <div className="flex flex-col space-y-2 items-center">
                    <button
                      onClick={() => applyForJob(job.id)}
                      disabled={appliedJobs.has(job.id)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all w-32 ${
                        appliedJobs.has(job.id)
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {appliedJobs.has(job.id) ? (
                        <div className="flex items-center justify-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                    {!appliedJobs.has(job.id) && (
                      <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Save for later</span>
                      </button>
                    )}
                  </div>
                </td>
              ))}
              {emptyCells.map((_, index) => (
                <td key={`empty-action-${index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center italic">
                  -
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">{comparisonJobs.length}</div>
          <div className="text-xs text-gray-600">Jobs Compared</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">
            {comparisonJobs.filter(job => job.remote).length}
          </div>
          <div className="text-xs text-gray-600">Remote Options</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-lg font-bold text-yellow-600">
            {Math.round(comparisonJobs.reduce((acc, job) => acc + (job.aiMatchScore || job.matchScore || 0), 0) / comparisonJobs.length)}%
          </div>
          <div className="text-xs text-gray-600">Avg Match Score</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-600">
            {comparisonJobs.filter(job => appliedJobs.has(job.id)).length}
          </div>
          <div className="text-xs text-gray-600">Applied</div>
        </div>
      </div>
    </div>
  );
};

// Add missing Plus icon component
const Plus = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default ComparisonTable;