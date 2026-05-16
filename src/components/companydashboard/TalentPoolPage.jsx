import React, { useState, useEffect } from 'react';
import { 
  Search, RefreshCw, Mail, Trash2, Users2, Loader2, X, Send, 
  FileText, Edit3, Check, Copy, Bookmark, Plus, ChevronDown,
  Users, CheckSquare, Square, MailOpen, Bell, Eye, 
  MoreHorizontal, UserPlus, Briefcase, MapPin, Map, Calendar, Star, Award
} from 'lucide-react';
import { apiFetch, LoadingSpinner, Badge } from './CompanyDashboardUtils';

const SKILL_COLORS = [
  { bg: 'bg-blue-50 text-blue-700 border-blue-200', hover: 'hover:bg-blue-100' },
  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', hover: 'hover:bg-emerald-100' },
  { bg: 'bg-purple-50 text-purple-700 border-purple-200', hover: 'hover:bg-purple-100' },
  { bg: 'bg-amber-50 text-amber-700 border-amber-200', hover: 'hover:bg-amber-100' },
  { bg: 'bg-rose-50 text-rose-700 border-rose-200', hover: 'hover:bg-rose-100' },
  { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', hover: 'hover:bg-cyan-100' },
  { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', hover: 'hover:bg-indigo-100' },
  { bg: 'bg-teal-50 text-teal-700 border-teal-200', hover: 'hover:bg-teal-100' },
];

const getSkillColor = (index) => SKILL_COLORS[index % SKILL_COLORS.length];

export const TalentPoolPage = ({ token, user, showToast, templates = [], setTemplates }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCandidateDetail, setShowCandidateDetail] = useState(false);
  const [candidateDetail, setCandidateDetail] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: '',
    body: '',
    useTemplate: false
  });
  const [sending, setSending] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    body: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiFetch('/talent-pool');
    if (res.ok && res.data?.success) setCandidates(res.data.data || []);
    setLoading(false);
  };

  const removeFromTalentPool = async (id) => {
    const res = await apiFetch(`/talent-pool/${id}`, { method: 'DELETE' });
    if (res.ok) { 
      setCandidates(candidates.filter(c => c._id !== id)); 
      showToast('Removed from talent pool', 'success'); 
    }
  };

  const openCandidateDetail = (candidate) => {
    setCandidateDetail(candidate);
    setShowCandidateDetail(true);
  };

  const openMessageModal = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedCandidates([]);
    setSelectAll(false);
    const candidateName = candidate.candidateId?.name || candidate.candidateId?.email || 'Candidate';
    const companyName = user?.companyName || user?.name || 'Our Company';
    
    setMessageData({
      subject: `Opportunity at ${companyName}`,
      body: `Hi ${candidateName},\n\nI came across your profile on MissionHub and I'm impressed with your qualifications. We have some opportunities that might be a great fit for you.\n\nWould you be interested in learning more?\n\nBest regards,\n${user?.name}`,
      useTemplate: false
    });
    setSelectedTemplate(null);
    setShowMessageModal(true);
  };

  const openBulkMessageModal = () => {
    setSelectedCandidate(null);
    const companyName = user?.companyName || user?.name || 'Our Company';
    
    setMessageData({
      subject: `Opportunity at ${companyName}`,
      body: `Hi {name},\n\nI came across your profile on MissionHub and I'm impressed with your qualifications. We have some opportunities that might be a great fit for you.\n\nWould you be interested in learning more?\n\nBest regards,\n${user?.name}`,
      useTemplate: false
    });
    setSelectedTemplate(null);
    setShowBulkMessageModal(true);
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filtered.map(c => c.candidateId?._id || c.candidateId).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const applyTemplate = (template, isBulk = false) => {
    const companyName = user?.companyName || user?.name || 'Our Company';
    
    let subject = template.subject || '';
    let body = template.body || '';
    
    subject = subject.replace('{name}', isBulk ? '{name}' : selectedCandidate?.candidateId?.name || selectedCandidate?.candidateId?.email || 'Candidate');
    subject = subject.replace('{company}', companyName);
    body = body.replace('{name}', isBulk ? '{name}' : selectedCandidate?.candidateId?.name || selectedCandidate?.candidateId?.email || 'Candidate');
    body = body.replace('{company}', companyName);
    
    setMessageData({
      subject,
      body,
      useTemplate: true
    });
    setSelectedTemplate(template);
    setShowTemplateDropdown(false);
  };

  const sendMessage = async () => {
    if (!messageData.subject.trim()) {
      showToast('Please enter a subject', 'error');
      return;
    }
    if (!messageData.body.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    setSending(true);
    
    try {
      const userId = selectedCandidate?.candidateId?._id || selectedCandidate?.candidateId;
      const companyName = user?.companyName || user?.name || 'Our Company';
      
      const res = await apiFetch('/messages/company', { 
        method: 'POST', 
        body: JSON.stringify({ 
          userId, 
          subject: messageData.subject, 
          message: messageData.body 
        }) 
      });
      
      if (res.ok && res.data?.success) {
        await apiFetch('/notifications/talent-pool-reachout', { 
          method: 'POST', 
          body: JSON.stringify({ 
            userId,
            companyName,
            message: messageData.body
          }) 
        });
        
        showToast('Message sent successfully!', 'success');
        setShowMessageModal(false);
        setSelectedCandidate(null);
      } else {
        showToast(res.data?.message || 'Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Error sending message', 'error');
    }
    
    setSending(false);
  };

  const sendBulkMessages = async () => {
    if (!messageData.subject.trim()) {
      showToast('Please enter a subject', 'error');
      return;
    }
    if (!messageData.body.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }
    if (selectedCandidates.length === 0) {
      showToast('Please select at least one candidate', 'error');
      return;
    }

    setSending(true);
    let successCount = 0;
    let failCount = 0;
    const companyName = user?.companyName || user?.name || 'Our Company';
    
    for (const candidateId of selectedCandidates) {
      try {
        const candidate = candidates.find(c => (c.candidateId?._id || c.candidateId) === candidateId);
        const candidateName = candidate?.candidateId?.name || candidate?.candidateId?.email || 'Candidate';
        
        let body = messageData.body.replace(/{name}/g, candidateName);
        
        const res = await apiFetch('/messages/company', { 
          method: 'POST', 
          body: JSON.stringify({ 
            userId: candidateId, 
            subject: messageData.subject, 
            message: body 
          }) 
        });
        
        if (res.ok && res.data?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }
    
    if (successCount > 0) {
      showToast(`${successCount} message${successCount > 1 ? 's' : ''} sent successfully!`, 'success');
    }
    if (failCount > 0) {
      showToast(`${failCount} message${failCount > 1 ? 's' : ''} failed to send.`, 'error');
    }
    
    setShowBulkMessageModal(false);
    setSelectedCandidates([]);
    setSelectAll(false);
    setSending(false);
  };

  const saveTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) {
      showToast('Please fill in template name and message', 'error');
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: templateForm.name,
      subject: templateForm.subject,
      body: templateForm.body
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate ? { ...newTemplate, id: editingTemplate } : t));
      showToast('Template updated!', 'success');
    } else {
      setTemplates([...templates, newTemplate]);
      showToast('Template saved!', 'success');
    }

    setShowTemplateModal(false);
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', body: '' });
  };

  const deleteTemplate = (templateId) => {
    if (!confirm('Delete this template?')) return;
    setTemplates(templates.filter(t => t.id !== templateId));
    showToast('Template deleted', 'success');
  };

  const editTemplate = (template) => {
    setEditingTemplate(template.id);
    setTemplateForm({
      name: template.name,
      subject: template.subject || '',
      body: template.body
    });
    setShowTemplateModal(true);
  };

  const openTemplateModal = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', subject: '', body: '' });
    setShowTemplateModal(true);
  };

  const filtered = candidates.filter(c => {
    const candidate = c.candidateId;
    if (search && !(candidate?.name?.toLowerCase().includes(search.toLowerCase()) || candidate?.email?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterSkill && !candidate?.profile?.skills?.includes(filterSkill)) return false;
    return true;
  });

  const allSkills = [...new Set(candidates.flatMap(c => c.candidateId?.profile?.skills || []))];
  const characterCount = messageData.body.length;
  const wordCount = messageData.body.trim() ? messageData.body.trim().split(/\s+/).length : 0;

  const stats = {
    total: candidates.length,
    skills: allSkills.length,
    recent: candidates.filter(c => {
      const daysSince = (Date.now() - new Date(c.addedAt || c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length
  };

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 sm:py-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950">Talent Pool</h1>
              <p className="text-slate-500 text-sm">Manage your saved candidates for future hiring</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={openTemplateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 text-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
            {selectedCandidates.length > 0 && (
              <button 
                onClick={openBulkMessageModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm"
              >
                <MailOpen className="w-4 h-4" />
                <span>Message {selectedCandidates.length}</span>
              </button>
            )}
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-slate-200 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Users2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.total}</p>
              <p className="text-xs sm:text-sm text-slate-500">Total Candidates</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.skills}</p>
              <p className="text-xs sm:text-sm text-slate-500">Unique Skills</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-950 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-950">{stats.recent}</p>
              <p className="text-xs sm:text-sm text-slate-500">Added This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search candidates by name, email, or skills..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm sm:text-base transition-all" 
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select 
              value={filterSkill} 
              onChange={(e) => setFilterSkill(e.target.value)} 
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500 min-w-[140px] text-sm"
            >
              <option value="">All Skills</option>
              {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500 min-w-[120px] text-sm"
            >
              <option value="recent">Newest</option>
              <option value="name">Name A-Z</option>
              <option value="skills">Most Skills</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Select Header */}
      {candidates.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl border border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className={`p-2.5 rounded-xl transition-all ${
                selectAll || selectedCandidates.length === filtered.length
                  ? 'bg-slate-950 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {selectAll || selectedCandidates.length === filtered.length ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm font-medium text-slate-700">
              {selectedCandidates.length > 0 
                ? `${selectedCandidates.length} of ${filtered.length} selected`
                : `${filtered.length} candidates found`}
            </span>
          </div>
          {selectedCandidates.length > 0 && (
            <button
              onClick={() => { setSelectedCandidates([]); setSelectAll(false); }}
              className="text-sm text-slate-600 hover:text-slate-950 font-medium"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-slate-950 animate-spin" />
            </div>
            <p className="text-slate-500 font-medium">Loading talent pool...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users2 className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-950 mb-2">No candidates yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">Save promising candidates from applications to build your personalized talent network for future opportunities.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((c, index) => {
            const candidate = c.candidateId || {};
            const profile = candidate.profile || {};
            const candidateId = candidate._id || candidate;
            const isSelected = selectedCandidates.includes(candidateId);
            
            return (
              <div 
                key={c._id} 
                className={`group relative bg-white border rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  isSelected 
                    ? 'border-2 border-slate-950 shadow-lg ring-2 ring-slate-950/10' 
                    : 'border-slate-200 hover:border-slate-950'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-6 h-6 bg-slate-950 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <button
                      onClick={() => toggleCandidateSelection(candidateId)}
                      className={`mt-1 p-1.5 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-slate-200 text-slate-950'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-slate-950 font-bold text-lg">{(candidate.name || candidate.email || '?').charAt(0).toUpperCase()}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-950 truncate text-base">{candidate.name || 'Unknown Candidate'}</h3>
                      <p className="text-sm text-slate-500 truncate">{candidate.email || ''}</p>
                      {profile.headline && (
                        <p className="text-xs text-slate-600 mt-1 truncate bg-slate-50 px-2 py-1 rounded-lg">{profile.headline}</p>
                      )}
                    </div>
                  </div>
                  
                  {profile.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {profile.skills.slice(0, 4).map((s, j) => {
                        const color = getSkillColor(j);
                        return (
                          <span key={j} className={`px-2.5 py-1 ${color.bg} ${color.hover} border rounded-lg text-xs font-medium transition-colors`}>
                            {s}
                          </span>
                        );
                      })}
                      {profile.skills.length > 4 && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium">
                          +{profile.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {profile.experience && Array.isArray(profile.experience) && profile.experience.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-2 rounded-xl">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{profile.experience.length} experience{profile.experience.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button 
                      onClick={() => openMessageModal(c)} 
                      className="flex-1 py-2.5 text-sm bg-slate-950 text-white rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 font-medium transition-all"
                    >
                      <Mail className="w-4 h-4" /> 
                      <span>Contact</span>
                    </button>
                    <button 
                      onClick={() => openCandidateDetail(c)} 
                      className="py-2.5 px-3 text-sm bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeFromTalentPool(c._id)} 
                      className="py-2.5 px-3 text-sm bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                      title="Remove from pool"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Detail Modal */}
      {showCandidateDetail && candidateDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCandidateDetail(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-950">Candidate Details</h2>
                <button onClick={() => setShowCandidateDetail(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-950">{(candidateDetail.candidateId?.name || candidateDetail.candidateId?.email || '?').charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950">{candidateDetail.candidateId?.name || 'Unknown'}</h3>
                  <p className="text-slate-500">{candidateDetail.candidateId?.email}</p>
                  {candidateDetail.candidateId?.profile?.headline && (
                    <p className="text-sm text-slate-600 mt-1">{candidateDetail.candidateId.profile.headline}</p>
                  )}
                </div>
              </div>
              
              {candidateDetail.candidateId?.profile?.location && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-4">
                  <Map className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="font-medium text-slate-950">{candidateDetail.candidateId.profile.location}</p>
                  </div>
                </div>
              )}
              
              {candidateDetail.candidateId?.profile?.skills?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-500" />
                    Skills & Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidateDetail.candidateId.profile.skills.map((s, i) => {
                      const color = getSkillColor(i);
                      return (
                        <span key={i} className={`px-3 py-1.5 ${color.bg} border rounded-xl text-sm font-medium`}>
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {candidateDetail.candidateId?.profile?.experience && Array.isArray(candidateDetail.candidateId.profile.experience) && candidateDetail.candidateId.profile.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    Experience
                  </h4>
                  <div className="space-y-3">
                    {candidateDetail.candidateId.profile.experience.map((exp, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="font-medium text-slate-950">{exp.title || 'Position'}</p>
                        <p className="text-sm text-slate-600">{exp.company || 'Company'}</p>
                        <p className="text-xs text-slate-500 mt-1">{exp.duration || 'Duration not specified'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button 
                onClick={() => { setShowCandidateDetail(false); openMessageModal(candidateDetail); }} 
                className="flex-1 py-3 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Send Message
              </button>
              <button 
                onClick={() => removeFromTalentPool(candidateDetail._id)} 
                className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Message Composition Modal */}
      {showMessageModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Send Message</h3>
                    <p className="text-sm text-slate-500">To: {selectedCandidate.candidateId?.name || selectedCandidate.candidateId?.email}</p>
                  </div>
                </div>
                <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value, useTemplate: false })}
                  placeholder="Enter subject..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Message</label>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{characterCount} chars • {wordCount} words</span>
                </div>
                <textarea
                  value={messageData.body}
                  onChange={(e) => setMessageData({ ...messageData, body: e.target.value, useTemplate: false })}
                  placeholder="Write your message..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Variables:</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setMessageData(d => ({ ...d, body: d.body + '{name}' }))} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-mono hover:bg-slate-100 transition-all">{'{name}'}</button>
                  <button onClick={() => setMessageData(d => ({ ...d, body: d.body + '{company}' }))} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-mono hover:bg-slate-100 transition-all">{'{company}'}</button>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-start gap-3">
                <Bell className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-800">Delivery:</p>
                  <p className="text-emerald-700">In-app notification + Email notification</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={sending || !messageData.subject.trim() || !messageData.body.trim()}
                className="flex-1 py-3 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Message Modal */}
      {showBulkMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Bulk Message</h3>
                    <p className="text-sm text-slate-500">Sending to {selectedCandidates.length} candidates</p>
                  </div>
                </div>
                <button onClick={() => setShowBulkMessageModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value, useTemplate: false })}
                  placeholder="Enter subject..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Message (use {"{name}"} for personalization)</label>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{characterCount} chars</span>
                </div>
                <textarea
                  value={messageData.body}
                  onChange={(e) => setMessageData({ ...messageData, body: e.target.value, useTemplate: false })}
                  placeholder="Write your message... Use {name} to greet each candidate."
                  rows={8}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Variables:</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setMessageData(d => ({ ...d, body: d.body + '{name}' }))} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-mono hover:bg-slate-100 transition-all">{'{name}'}</button>
                  <button onClick={() => setMessageData(d => ({ ...d, body: d.body + '{company}' }))} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-mono hover:bg-slate-100 transition-all">{'{company}'}</button>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800">Ready to send to {selectedCandidates.length} recipients!</p>
                  <p className="text-amber-700">Each will receive a personalized message via in-app + email</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowBulkMessageModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={sendBulkMessages}
                disabled={sending || !messageData.subject.trim() || !messageData.body.trim() || selectedCandidates.length === 0}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending {selectedCandidates.length}...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to {selectedCandidates.length} Candidates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Management Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {editingTemplate ? 'Edit Template' : 'Message Templates'}
                    </h3>
                    <p className="text-sm text-slate-500">Save reusable message templates</p>
                  </div>
                </div>
                <button onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-slate-500" />
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Template Name *</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="e.g., Interview Invitation"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      placeholder="e.g., Interview Opportunity at {company}"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message Body *</label>
                    <textarea
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                      placeholder="Write your message template here..."
                      rows={6}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none transition-all"
                    />
                  </div>
                  <button
                    onClick={saveTemplate}
                    className="w-full py-2.5 bg-slate-950 text-white rounded-xl font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingTemplate ? 'Update Template' : 'Save Template'}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Saved Templates ({templates.length})</h4>
                {templates.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-10 text-center border-2 border-dashed border-slate-300">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No templates saved yet</p>
                    <p className="text-slate-400 text-sm mt-1">Create your first template above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map(template => (
                      <div key={template.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-400 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Bookmark className="w-4 h-4 text-slate-600" />
                              <h5 className="font-semibold text-slate-950">{template.name}</h5>
                            </div>
                            {template.subject && (
                              <p className="text-xs text-slate-500 mb-2">Subject: {template.subject}</p>
                            )}
                            <p className="text-sm text-slate-600 line-clamp-2">{template.body}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => editTemplate(template)}
                              className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-all"
                              title="Edit template"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentPoolPage;
