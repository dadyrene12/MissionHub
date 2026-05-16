import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Building2, Briefcase, Users, MessageSquare,
  BarChart3, Settings, Calendar, LogOut, ChevronLeft, ChevronRight,
  Plus, X, Eye, CheckCircle, XCircle, Trash2, Menu,
  Send, CreditCard, TrendingUp, Activity, Star, Download, Upload,
  Clock, Video, Mail, Paperclip, Megaphone, DollarSign,
  CheckSquare, Wallet, AlertCircle, BellRing, User, FileText,
  Check, Phone, MapPin, Save, AlertTriangle, Zap, Sparkles,
  Target, TrendingUp as TrendUp, Users2, Image, Share2, Globe,
  Award, Brain, Cpu, Lightbulb, ChevronDown, ChevronUp,
  Bell, BellOff, MessageCircle, MailOpen, ThumbsUp, ThumbsDown,
  UserPlus, Archive, Tag, Crown, Shield, Gem, Smartphone,
  Edit2, RefreshCw, SendHorizontal, Paperclip as Attachment,
  CheckCheck, CircleDot, Star as StarIcon, Filter as FilterIcon,
  GraduationCap, Info, Linkedin, Github, ExternalLink, Copy, Heart, Package,
  FileCode, Play, BookOpen, Clipboard, Clock3, FileWarning,
  LayoutGrid, List, Grid3X3, PieChart, FolderKanban, HelpCircle,
  FileUp, FileSearch, Wand2, Gauge, Crown as CrownIcon,
  MoreHorizontal, MoreVertical, Layers, UserCog,
  WalletCards, MessageSquarePlus, BellPlus, Search as SearchIcon
} from 'lucide-react';

import { apiFetch, LoadingSpinner, Toast, Badge, PDFViewer, ApplicantDetailModal, MessageTemplatesModal, SendMessageModal, AIMatchingModal } from './companydashboard/CompanyDashboardUtils';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';
const BACKEND_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : 'https://missionhubbackend.onrender.com';

import DashboardPage from './companydashboard/DashboardPage';
import { JobsPage } from './companydashboard/JobsPage';
import { ApplicantsPage } from './companydashboard/ApplicantsPage';
import InterviewsPage from './companydashboard/InterviewsPage';
import { MessagesPage } from './companydashboard/MessagesPage';
import { NotificationsPage } from './companydashboard/NotificationsPage';
import { TalentPoolPage } from './companydashboard/TalentPoolPage';
import { PaymentsPage } from './companydashboard/PaymentsPage';
import { AnalyticsPage } from './companydashboard/AnalyticsPage';
import { SettingsPage } from './companydashboard/SettingsPage';
import AIScreeningPage from './companydashboard/AIScreeningPage';

export default function CompanyDashboard({ user: propUser, token: propToken, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [talentPool, setTalentPool] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState({ open: false, recipient: null });
  const [showApplicantDetail, setShowApplicantDetail] = useState(null);
  const [showAIMatching, setShowAIMatching] = useState(false);
  const [showProblemReport, setShowProblemReport] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJobFilter, setSelectedJobFilter] = useState(null);
  const [allApplications, setAllApplications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [theme, setTheme] = useState('light');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [activeGroup, setActiveGroup] = useState('main');

  const user = propUser;
  const token = propToken;
  const [loading, setLoading] = useState(false);

  const [messageTemplates, setMessageTemplates] = useState([
    { id: 1, name: 'Application Received', subject: 'Application Received - {company}', body: 'Dear {name},\n\nThank you for applying! We have received your application for the position and will review it shortly.\n\nWe will get back to you soon with updates.\n\nBest regards,\nThe Hiring Team' },
    { id: 2, name: 'Interview Invitation', subject: 'Interview Invitation - {company}', body: 'Dear {name},\n\nWe are pleased to inform you that your application has caught our attention! We would like to invite you for an interview.\n\nPlease reply with your available dates and times within the next 48 hours.\n\nBest regards,\nThe Hiring Team' },
    { id: 3, name: 'Talent Pool Outreach', subject: 'Career Opportunity at {company}', body: 'Dear {name},\n\nI came across your impressive profile on MissionHub and was impressed by your qualifications. Our company has exciting opportunities that might be a great fit for you.\n\nWould you be interested in learning more about our openings?\n\nBest regards,\n{company} Team' },
    { id: 4, name: 'Follow Up', subject: 'Following Up - {company}', body: 'Dear {name},\n\nI wanted to follow up on our previous conversation. Are you still interested in opportunities at {company}?\n\nPlease let me know if you have any questions.\n\nBest regards,\nThe Hiring Team' },
    { id: 5, name: 'Application Rejected', subject: 'Application Update - {company}', body: 'Dear {name},\n\nThank you for your interest in our company and for taking the time to apply.\n\nAfter careful consideration, we have decided to proceed with other candidates whose qualifications more closely match our current needs.\n\nWe encourage you to apply for future positions that match your skills.\n\nBest regards,\nThe Hiring Team' },
  ]);

   const showToast = (message, type = 'info') => setToast({ message, type });

   const refreshData = async () => {
    setLoading(true);
    await fetchDataAsync();
    showToast('Dashboard refreshed', 'success');
  };

   const fetchDataAsync = async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      const jobsRes = await apiFetch('/jobs/company');
      if (jobsRes.ok) {
        setJobs(jobsRes.data?.data || []);
      }
    } catch (e) {
      console.error('Error fetching jobs:', e);
    }
    
    await delay(300);
    
    try {
      const poolRes = await apiFetch('/talent-pool');
      if (poolRes.ok) {
        setTalentPool(poolRes.data?.data || []);
      }
    } catch (e) {
      console.error('Error fetching talent pool:', e);
    }
    
    await delay(300);
    
    try {
      const appsRes = await apiFetch('/applications/for-my-jobs');
      if (appsRes.ok) {
        setAllApplications(appsRes.data?.data || []);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    }

    try {
      const notifRes = await apiFetch('/notifications/unread-count');
      if (notifRes.ok) {
        setNotificationCount(notifRes.data?.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }

    try {
      const msgRes = await apiFetch('/messages/unread/count');
      if (msgRes.ok) {
        setUnreadMessages(msgRes.data?.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDataAsync();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchDataAsync, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApplicantAction = async (action, applicant) => {
    if (action === 'message') {
      setShowMessageModal({ open: true, recipient: applicant, template: null });
      setShowApplicantDetail(null);
      return;
    }
    
    if (action === 'schedule') {
      showToast('Opening scheduling...', 'info');
      setCurrentPage('interviews');
      setShowApplicantDetail(null);
      return;
    }
    
    if (action === 'talentpool') {
      try {
        const res = await apiFetch('/talent-pool/add', {
          method: 'POST',
          body: JSON.stringify({ candidate: applicant.userId || applicant._id, source: 'application', notes: `From application for ${applicant.jobTitle}` })
        });
        if (res.ok) {
          showToast('Added to talent pool!', 'success');
        }
      } catch (e) {
        showToast('Failed to add to talent pool', 'error');
      }
      return;
    }
    
    if (action === 'view_cv') {
      const resumeUrl = applicant.resume?.url || applicant.resume;
      if (resumeUrl) {
        const filename = resumeUrl.replace(/^\/uploads\/resumes\//, '');
        const viewUrl = getAuthUrl(`/resume/${filename}`);
        if (viewUrl) {
          window.open(viewUrl, '_blank');
        }
      }
      return;
    }
    
    const validStatuses = ['pending', 'reviewed', 'approved', 'rejected', 'cancelled'];
    if (validStatuses.includes(action)) {
      const res = await apiFetch(`/applications/${applicant._id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: action })
      });
      if (res.ok && res.data.success) {
        showToast(`Application ${action}!`, 'success');
        setShowApplicantDetail(null);
        fetchDataAsync();
      }
    }
  };

  const handleSendMessage = async (recipient, subject, body, options = {}) => {
    const toUserId = recipient.userId?._id || recipient.userId || recipient._id || recipient.id;
    
    if (!toUserId) {
      showToast('Cannot find recipient user', 'error');
      return false;
    }
    
    const sendEmail = options.sendEmail !== undefined ? options.sendEmail : true;
    const sendInApp = options.sendInApp !== undefined ? options.sendInApp : true;
    
    const res = await apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ 
        toUserId, 
        subject: subject || 'No Subject', 
        body,
        sendEmail,
        sendInApp
      })
    });
    if (res.ok && res.data.success) {
      const methods = [];
      if (sendEmail) methods.push('email');
      if (sendInApp) methods.push('in-app');
      showToast(`Message sent via ${methods.join(' & ')}!`, 'success');
      return true;
    } else {
      showToast(res.data.message || 'Failed to send message', 'error');
      return false;
    }
  };

  const handleReportProblem = async (data) => {
    const res = await apiFetch('/notifications/report-problem', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.ok && res.data.success) {
      showToast('Problem reported successfully! We will get back to you soon.', 'success');
      setShowProblemReport(false);
      return true;
    } else {
      showToast(res.data?.message || 'Failed to report problem', 'error');
      return false;
    }
  };

  const handleQuickAction = (page) => {
    setCurrentPage(page);
  };

  const getAuthUrl = (path) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return null;
    return `${BACKEND_URL}${path}?token=${token}`;
  };

  const menuGroups = {
    main: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'blue', badge: null },
      { id: 'jobs', icon: Briefcase, label: 'Jobs', color: 'emerald', badge: jobs.length || null },
      { id: 'applicants', icon: Users, label: 'Applicants', color: 'purple', badge: allApplications.length || null },
      { id: 'ai-screening', icon: Brain, label: 'AI Screening', color: 'violet', badge: null },
      { id: 'interviews', icon: Calendar, label: 'Interviews', color: 'amber', badge: null },
      { id: 'messages', icon: MessageSquare, label: 'Messages', color: 'indigo', badge: unreadMessages || null },
    ],
    management: [
      { id: 'notifications', icon: Bell, label: 'Notifications', color: 'pink', badge: notificationCount || null },
      { id: 'talent', icon: Users2, label: 'Talent Pool', color: 'violet', badge: null },
      { id: 'analytics', icon: PieChart, label: 'Analytics', color: 'rose', badge: null },
    ],
    business: [
      { id: 'payments', icon: CreditCard, label: 'Bill', color: 'green', badge: null },
      { id: 'settings', icon: Settings, label: 'Settings', color: 'slate', badge: null },
    ]
  };

  const colorMap = {
    blue: { bg: 'bg-slate-50', activeBg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', active: 'bg-slate-800' },
    emerald: { bg: 'bg-emerald-50', activeBg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', active: 'bg-emerald-600' },
    purple: { bg: 'bg-purple-50', activeBg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', active: 'bg-purple-600' },
    amber: { bg: 'bg-amber-50', activeBg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', active: 'bg-amber-600' },
    indigo: { bg: 'bg-indigo-50', activeBg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200', active: 'bg-indigo-600' },
    pink: { bg: 'bg-pink-50', activeBg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200', active: 'bg-pink-600' },
    violet: { bg: 'bg-violet-50', activeBg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', active: 'bg-violet-600' },
    rose: { bg: 'bg-rose-50', activeBg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', active: 'bg-rose-600' },
    orange: { bg: 'bg-orange-50', activeBg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', active: 'bg-orange-600' },
    green: { bg: 'bg-green-50', activeBg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', active: 'bg-green-600' },
    slate: { bg: 'bg-slate-50', activeBg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', active: 'bg-slate-600' },
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-slate-200 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-900" />
          </div>
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        user={user}
        currentPage={currentPage}
        onNavigate={handleQuickAction}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        hovered={sidebarHovered}
        setHovered={setSidebarHovered}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
         onLogout={onLogout}
         menuGroups={menuGroups}
        colorMap={colorMap}
        isPremium={isPremium}
        notificationCount={notificationCount}
        unreadMessages={unreadMessages}
      />
      
      {/* Fixed Header */}
      <DashboardHeader 
        user={user}
        notificationCount={notificationCount}
        unreadMessages={unreadMessages}
        onNavigate={handleQuickAction}
        sidebarCollapsed={sidebarCollapsed}
        onLogout={onLogout}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {/* Mobile Drawer */}
      <MobileDrawer 
        user={user}
        currentPage={currentPage}
        onNavigate={(page) => { handleQuickAction(page); setIsMobileOpen(false); }}
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        onLogout={onLogout}
        menuGroups={menuGroups}
        colorMap={colorMap}
        notificationCount={notificationCount}
        unreadMessages={unreadMessages}
      />
      
      <main className={`
        pt-20 pb-20 lg:pb-0 transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <DashboardPage user={user} showToast={showToast} onUpgrade={() => setShowPricing(true)} isPremium={isPremium} onNavigate={(page) => { handleQuickAction(page); }} />}
          {currentPage === 'jobs' && <JobsPage token={token} user={user} showToast={showToast} onViewApplicants={(job) => { setSelectedJobFilter(job); handleQuickAction('applicants'); }} onRefresh={refreshData} />}
          {currentPage === 'applicants' && <ApplicantsPage token={token} user={user} showToast={showToast} talentPool={talentPool} setTalentPool={setTalentPool} setShowApplicant={setShowApplicantDetail} setShowMessage={setShowMessageModal} setShowAIMatching={setShowAIMatching} jobs={jobs} filterJob={selectedJobFilter} onRefresh={refreshData} />}
          {currentPage === 'ai-screening' && <AIScreeningPage token={token} showNotification={showToast} user={user} />}
          {currentPage === 'interviews' && <InterviewsPage token={token} user={user} showToast={showToast} />}
          {currentPage === 'messages' && <MessagesPage token={token} user={user} showToast={showToast} templates={messageTemplates} setShowTemplates={setShowTemplates} />}
          {currentPage === 'notifications' && <NotificationsPage token={token} user={user} showToast={showToast} onNavigate={(page) => handleQuickAction(page)} />}
          {currentPage === 'talent' && <TalentPoolPage token={token} user={user} showToast={showToast} templates={messageTemplates} setTemplates={setMessageTemplates} />}
          {currentPage === 'analytics' && <AnalyticsPage token={token} user={user} showToast={showToast} />}
          {currentPage === 'settings' && <SettingsPage user={user} showToast={showToast} templates={messageTemplates} setTemplates={setMessageTemplates} onRefresh={refreshData} />}
          {currentPage === 'payments' && <PaymentsPage user={user} showToast={showToast} />}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav 
        currentPage={currentPage}
        onNavigate={(page) => { handleQuickAction(page); }}
        notificationCount={notificationCount}
        unreadMessages={unreadMessages}
        onOpenMenu={() => setIsMobileOpen(true)}
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ApplicantDetailModal 
        isOpen={!!showApplicantDetail} 
        onClose={() => setShowApplicantDetail(null)} 
        applicant={showApplicantDetail} 
        onAction={handleApplicantAction}
        showNotification={showToast}
      />
      <MessageTemplatesModal 
        isOpen={showTemplates} 
        onClose={() => setShowTemplates(false)} 
        templates={messageTemplates} 
        setTemplates={setMessageTemplates}
        onSelect={(t) => setShowMessageModal({ open: true, recipient: showApplicantDetail, template: t })}
      />
      <SendMessageModal 
        isOpen={showMessageModal.open} 
        onClose={() => setShowMessageModal({ open: false, recipient: null })}
        recipient={showMessageModal.recipient} 
        templates={messageTemplates}
        onSend={handleSendMessage}
      />
      <AIMatchingModal 
        isOpen={showAIMatching} 
        onClose={() => setShowAIMatching(false)} 
        jobs={jobs}
        applications={allApplications}
        onMatch={(m) => { setShowApplicantDetail(m.app); setShowAIMatching(false); }}
      />
      <ProblemReportModal 
        isOpen={showProblemReport} 
        onClose={() => setShowProblemReport(false)} 
        onSubmit={handleReportProblem}
      />
    </div>
  );
}

function Sidebar({ user, currentPage, onNavigate, collapsed, setCollapsed, hovered, setHovered, isMobileOpen, setIsMobileOpen, onLogout, menuGroups, colorMap, isPremium, notificationCount, unreadMessages }) {
  const groupLabels = {
    main: 'Main',
    management: 'Management',
    business: 'Business'
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-20 h-[calc(100vh-5rem)] z-50
          transition-all duration-300 ease-in-out flex-col flex
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          lg:translate-x-0 lg:w-64
          ${collapsed ? 'lg:w-20' : ''}
          bg-slate-950
        `}
      >
        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden px-2">
          {Object.entries(menuGroups).map(([groupKey, items]) => (
            <div key={groupKey} className="mb-4">
              {!collapsed && (
                <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {groupLabels[groupKey]}
                </p>
              )}
              
              <div className="space-y-1">
                {items.map((item) => {
                  const colors = colorMap[item.color];
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => { onNavigate(item.id); setIsMobileOpen(false); }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
                        ${isActive 
                          ? 'bg-white text-slate-950 shadow-lg' 
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }
                        ${collapsed ? 'justify-center px-2' : ''}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                      )}
                      
                      {/* Icon Container */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-slate-950 text-white' 
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium flex-1 text-left">
                            {item.label}
                          </span>
                          {item.badge > 0 && (
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                              isActive 
                                ? 'bg-slate-950 text-white' 
                                : 'bg-white/20 text-white'
                            }`}>
                              {item.badge > 99 ? '99+' : item.badge}
                            </span>
                          )}
                        </>
                      )}
                      
                      {collapsed && item.badge > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/10 p-3">
          {/* Collapse Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
          
          {/* User & Logout */}
          <div className={`mt-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'} p-2`}>
              <div className="relative">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400">
                    {isPremium ? (
                      <span className="text-amber-400">Premium</span>
                    ) : 'Free Plan'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <button 
              onClick={onLogout} 
              className={`
                w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 
                transition-all duration-200
              `}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ProblemReportModal({ isOpen, onClose, onSubmit }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const categories = [
    { value: 'technical', label: 'Bug Report', icon: AlertCircle, color: 'red' },
    { value: 'billing', label: 'Billing', icon: CreditCard, color: 'green' },
    { value: 'account', label: 'Account', icon: User, color: 'blue' },
    { value: 'job_posting', label: 'Job Posting', icon: Briefcase, color: 'orange' },
    { value: 'applicant', label: 'Applicant', icon: Users, color: 'purple' },
    { value: 'feature_request', label: 'Feature', icon: Lightbulb, color: 'yellow' },
    { value: 'ui_issue', label: 'UI Issue', icon: LayoutGrid, color: 'pink' },
    { value: 'other', label: 'Other', icon: HelpCircle, color: 'slate' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description) return;
    
    setSubmitting(true);
    const success = await onSubmit({ category, description, screenshots });
    if (success) {
      setCategory('');
      setDescription('');
      setScreenshots([]);
      setStep(1);
    }
    setSubmitting(false);
  };

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    const newScreenshots = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setScreenshots([...screenshots, ...newScreenshots]);
  };

  const removeScreenshot = (index) => {
    const newScreenshots = [...screenshots];
    URL.revokeObjectURL(newScreenshots[index].url);
    newScreenshots.splice(index, 1);
    setScreenshots(newScreenshots);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Report a Problem</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Select the category that best describes your issue</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      category === cat.value 
                        ? 'border-slate-900 bg-slate-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <cat.icon className={`w-5 h-5 mx-auto mb-1 ${category === cat.value ? 'text-slate-900' : 'text-slate-500'}`} />
                    <span className="text-xs font-medium block">{cat.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => category && setStep(2)}
                disabled={!category}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the problem in detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Screenshots (optional)</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                    isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                >
                  <input type="file" multiple accept="image/*" onChange={handleScreenshotUpload} className="hidden" id="screenshot-upload" />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload</p>
                  </label>
                </div>
                {screenshots.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {screenshots.map((s, i) => (
                      <div key={i} className="relative">
                        <img src={s.url} alt={s.name} className="w-12 h-12 object-cover rounded-lg" />
                        <button type="button" onClick={() => removeScreenshot(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={!description || submitting} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function DashboardHeader({ user, notificationCount, unreadMessages, onNavigate, sidebarCollapsed, onLogout, setIsMobileOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-40 h-20 bg-slate-950 border-b border-white/10
      transition-all duration-300
    `}>
      <div className="h-full flex items-center justify-between gap-4 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-300"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Logo & Welcome */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">MissionHub</h1>
            <p className="text-slate-400 text-xs">Company Dashboard</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 lg:mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, applicants, interviews..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Messages */}
          <button 
            onClick={() => onNavigate('messages')}
            className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-300 hover:text-white"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>
          
          {/* Notifications */}
          <button 
            onClick={() => onNavigate('notifications')}
            className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-300 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          
          {/* Bill */}
          <button 
            onClick={() => onNavigate('payments')}
            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-300 hover:text-white"
            title="Billing"
          >
            <CreditCard className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">Bill</span>
          </button>
          
          {/* Settings */}
          <button 
            onClick={() => onNavigate('settings')}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-300 hover:text-white"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Divider */}
          <div className="hidden lg:block h-8 w-px bg-white/20 mx-1" />
          
          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <span className="hidden lg:block text-sm font-medium text-white">{user?.name?.split(' ')[0]}</span>
            </button>
            
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-950">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => { onNavigate('settings'); setShowUserMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button 
                    onClick={() => { onNavigate('payments'); setShowUserMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                  >
                    <CreditCard className="w-4 h-4" /> Bill
                  </button>
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button 
                      onClick={() => { onLogout(); setShowUserMenu(false); }} 
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileDrawer({ user, currentPage, onNavigate, isOpen, onClose, onLogout, menuGroups, colorMap, notificationCount, unreadMessages }) {
  const mainItems = menuGroups.main || [];
  const managementItems = menuGroups.management || [];
  const businessItems = menuGroups.business || [];
  
  const getBadge = (item) => {
    if (item.id === 'messages') return unreadMessages;
    if (item.id === 'notifications') return notificationCount;
    return item.badge;
  };
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-950 z-50 lg:hidden
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-white font-bold">MissionHub</h2>
                <p className="text-slate-400 text-xs">{user?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Menu */}
          <div>
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</p>
            <div className="space-y-1">
              {mainItems.map((item) => {
                const isActive = currentPage === item.id;
                const badge = getBadge(item);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                      ${isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-white/10'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? 'bg-slate-950 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Management Menu */}
          <div>
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
            <div className="space-y-1">
              {managementItems.map((item) => {
                const isActive = currentPage === item.id;
                const badge = getBadge(item);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                      ${isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-white/10'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {badge > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isActive ? 'bg-slate-950 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Business Menu */}
          <div>
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business</p>
            <div className="space-y-1">
              {businessItems.map((item) => {
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                      ${isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                    `}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-white/10'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

function BottomNav({ currentPage, onNavigate, notificationCount, unreadMessages, onOpenMenu }) {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', badge: unreadMessages },
    { id: 'notifications', icon: Bell, label: 'Alerts', badge: notificationCount },
    { id: 'menu', icon: MoreHorizontal, label: 'More' },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const isMenu = item.id === 'menu';
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isMenu) {
                  onOpenMenu();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]
                ${isActive && !isMenu ? 'text-slate-950' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive && !isMenu ? 'bg-slate-950 text-white' : 'bg-slate-100'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
