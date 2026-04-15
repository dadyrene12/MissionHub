import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { apiRequest } from './utils/api.js';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import JobCard from './components/JobCard';
import JobFilter from './components/JobFilter';
import ComparisonTable from './components/ComparisonTable';
import AboutSection from './components/AboutSection';
import { UIHelpers } from './components/UIHelpers';
import { Modals } from './components/Modals';
import MobileMenu from './components/MobileMenu';
import ProfilePanel from './components/ProfilePanel';
import NotificationInboxSettingsPanels from './components/NotificationInboxSettingsPanels';
import Adverse from './components/adverse';
import CompanyDashboard from './components/CompanyDashboard';

// Icons
import {
  Search, MapPin, Bell, User, ChevronDown, Menu, X,
  Bookmark, BookmarkCheck, Send, MessageCircle,
  Star, TrendingUp, Users, Briefcase, GraduationCap,
  Target, DollarSign, Clock, Phone, Mail, Map,
  CheckCircle, Sparkles, Mic, MicOff, Heart,
  Zap, Shield, Award, Globe, Cpu, Palette,
  Sun, Moon, Filter, Grid, List, ThumbsUp,
  BarChart3, Camera, Video, Calendar, Eye,
  Building, HeartHandshake, Rocket, Code, PaintBucket,
  Database, Cloud, Smartphone, Server, TestTube,
  Scale, Stethoscope, School, Car, Plane,
  Truck, Coffee, Utensils, Home, Wifi,
  Laptop, Monitor, Printer, HardDrive, Cctv,
  LogOut, HelpCircle, Settings, FileText,
  Linkedin, Github, Twitter, Facebook, Instagram,
  ShieldCheck, Share2, BookOpen, Headphones,
  ChevronRight, ExternalLink, Play, Pause,
  Download, Upload, File, Folder, Image, Music,
  ThumbsDown, Flag, Share, Copy, Edit,
  Trash2, Plus, Minus, ShoppingCart, CreditCard,
  Lock, Unlock, EyeOff, DownloadCloud, UploadCloud,
  CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
  Wind, Cloudy, Inbox, Archive, UserCircle, 
  Activity, AlertCircle, Info, CheckSquare, Square,
  MessageSquare, Reply, Forward, Paperclip, AtSign,
  FilePlus, PaperclipIcon, Check, CheckCheck,
  Brain, Target as TargetIcon, Award as AwardIcon,
  Loader2, ChevronLeft, EyeOff as EyeOffIcon
} from 'lucide-react';

const { StatCard, TestimonialCard, QuoteIcon } = UIHelpers;

// Helper function to get API base URL safely
const getApiBaseUrl = () => {
  // Use relative path to leverage Vite proxy in dev, or absolute in prod
  if (import.meta.env.MODE === "development") {
    return "/api";
  }
  return "https://missionhubbackend.onrender.com/api";
};

// AI Profile-Job Matching Engine
class ProfileJobMatcher {
  constructor() {
    this.skillWeights = {
      'JavaScript': 1.0, 'React': 1.2, 'Node.js': 1.1, 'TypeScript': 1.3,
      'Python': 1.0, 'Java': 1.0, 'SQL': 0.8, 'MongoDB': 0.9,
      'AWS': 1.1, 'Docker': 1.0, 'Kubernetes': 1.2, 'GraphQL': 1.1
    };

    this.experienceLevels = {
      'entry': 1, 'junior': 2, 'mid': 3, 'senior': 4, 'lead': 5, 'principal': 6
    };
  }

  calculateMatch(userProfile, job) {
    const safeUserProfile = userProfile || {};
    const safeJob = job || {};
    
    let score = 0;
    let breakdown = [];

    // Skills matching (40% of total score)
    const skillsScore = this.calculateSkillsMatch(safeUserProfile.skills, safeJob.skills || []);
    score += skillsScore * 0.4;
    breakdown.push({ category: 'Skills', score: skillsScore, weight: 40 });

    // Experience matching (25% of total score)
    const experienceScore = this.calculateExperienceMatch(safeUserProfile.experience, safeJob.experience);
    score += experienceScore * 0.25;
    breakdown.push({ category: 'Experience', score: experienceScore, weight: 25 });

    // Education matching (15% of total score)
    const educationScore = this.calculateEducationMatch(safeUserProfile.educationLevel, safeJob.education);
    score += educationScore * 0.15;
    breakdown.push({ category: 'Education', score: educationScore, weight: 15 });

    // Location matching (10% of total score)
    const locationScore = this.calculateLocationMatch(safeUserProfile.location, safeJob.location);
    score += locationScore * 0.1;
    breakdown.push({ category: 'Location', score: locationScore, weight: 10 });

    // Job type matching (10% of total score)
    const typeScore = this.calculateTypeMatch(safeUserProfile.preferredJobType, safeJob.type);
    score += typeScore * 0.1;
    breakdown.push({ category: 'Job Type', score: typeScore, weight: 10 });

    return {
      overallScore: Math.round(score),
      breakdown,
      isGoodMatch: score >= 70,
      isExcellentMatch: score >= 85,
      recommendation: this.generateRecommendation(score, breakdown)
    };
  }

  calculateSkillsMatch(userSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 80;
    
    const userSkillsLower = userSkills?.map(skill => skill.toLowerCase()) || [];
    const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
    
    let matchedSkills = 0;
    let totalWeight = 0;
    
    jobSkillsLower.forEach(jobSkill => {
      const weight = this.skillWeights[jobSkill] || 1.0;
      totalWeight += weight;
      
      if (userSkillsLower.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      )) {
        matchedSkills += weight;
      }
    });
    
    return totalWeight > 0 ? (matchedSkills / totalWeight) * 100 : 0;
  }

  calculateExperienceMatch(userExperience, jobExperience) {
    const userLevel = this.experienceLevels[userExperience?.toLowerCase()] || 1;
    const jobLevel = this.experienceLevels[jobExperience?.toLowerCase()] || 1;
    
    if (userLevel >= jobLevel) return 100;
    if (userLevel >= jobLevel - 1) return 75;
    if (userLevel >= jobLevel - 2) return 50;
    return 25;
  }

  calculateEducationMatch(userEducationLevel, jobEducation) {
    if (!jobEducation) return 80;
    
    const userEdLevel = this.getEducationLevel(userEducationLevel);
    const jobEdLevel = this.getEducationLevel(jobEducation);
    
    return userEdLevel >= jobEdLevel ? 100 : 60;
  }

  getEducationLevel(educationLevel) {
    if (!educationLevel) return 0;
    
    const lowerEd = educationLevel.toLowerCase();
    if (lowerEd.includes('phd') || lowerEd.includes('doctorate')) return 4;
    if (lowerEd.includes('master')) return 3;
    if (lowerEd.includes('bachelor') || lowerEd.includes('undergraduate')) return 2;
    if (lowerEd.includes('associate') || lowerEd.includes('diploma')) return 1;
    return 0;
  }

  calculateLocationMatch(userLocation, jobLocation) {
    if (!userLocation || !jobLocation) return 50;
    
    const userLoc = userLocation.toLowerCase();
    const jobLoc = jobLocation.toLowerCase();
    
    if (jobLoc.includes('remote')) return 100;
    if (userLoc === jobLoc) return 100;
    if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 80;
    
    return 30;
  }

  calculateTypeMatch(userPreferredType, jobType) {
    if (!userPreferredType || !jobType) return 70;
    return userPreferredType === jobType ? 100 : 70;
  }

  generateRecommendation(score, breakdown) {
    if (score >= 85) {
      return "Excellent match! Your profile strongly aligns with this position.";
    } else if (score >= 70) {
      return "Good match! You meet most requirements for this role.";
    } else if (score >= 50) {
      return "Fair match. Consider developing additional skills for better alignment.";
    } else {
      return "Limited match. This role may require significant skill development.";
    }
  }

  analyzeProfileGaps(userProfile, job) {
    const safeUserProfile = userProfile || {};
    const safeJob = job || {};
    const gaps = [];
    
    // Check missing skills
    if (safeJob.skills && safeJob.skills.length > 0) {
      const userSkillsLower = (safeUserProfile.skills || []).map(s => s?.toLowerCase() || '');
      const missingSkills = safeJob.skills.filter(skill => 
        !userSkillsLower.some(userSkill => 
          userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
        )
      );
      
      if (missingSkills.length > 0) {
        gaps.push({
          type: 'skills',
          message: `Missing required skills: ${missingSkills.join(', ')}`,
          priority: missingSkills.length > 2 ? 'high' : 'medium'
        });
      }
    }
    
    // Check experience gap
    const userLevel = this.experienceLevels[safeUserProfile.experience?.toLowerCase()] || 1;
    const jobLevel = this.experienceLevels[safeJob.experience?.toLowerCase()] || 1;
    
    if (userLevel < jobLevel) {
      gaps.push({
        type: 'experience',
        message: `This role requires ${safeJob.experience} level experience (you have ${safeUserProfile.experience})`,
        priority: userLevel <= jobLevel - 2 ? 'high' : 'medium'
      });
    }
    
    return gaps;
  }
}

// Initialize the AI matcher
const aiMatcher = new ProfileJobMatcher();

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
  const [comparisonJobs, setComparisonJobs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('office');
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    type: '',
    experience: '',
    salary: 0,
    location: '',
    remote: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [jobAlerts] = useState([
    { id: 1, title: "Senior React Developer", company: "TechCorp", match: 95, new: true },
    { id: 2, title: "Full Stack Engineer", company: "StartupXYZ", match: 87, new: true },
    { id: 3, title: "UX Designer", company: "DesignCo", match: 92, new: true }
  ]);
  const [currentPage, setCurrentPage] = useState('home');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [aboutStats] = useState({
    jobs: 12500,
    companies: 2400,
    candidates: 85000,
    successRate: 92
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [aiAssistantThinking, setAiAssistantThinking] = useState(false);
  const [jobAlertBannerOpen, setJobAlertBannerOpen] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [testimonials] = useState([
    {
      id: 1,
      name: "joseph",
      position: "Software Engineer",
      company: "FUTUREHub inovation",
      content: "Mission hub helped me find my dream job in just 2 weeks! The platform is incredibly user-friendly.",
      rating: 5,
      avatar: "JP"
    },
    {
      id: 2,
      name: "alfu isheja",
      position: "Product Manager",
      company: "FUtureHub inovation",
      content: "The AI matching system is amazing. It found me opportunities I wouldn't have discovered otherwise.",
      rating: 5,
      avatar: "al"
    },
    {
      id: 3,
      name: "Dadyrene",
      position: "full stack developer",
      company: "FUtureHub innovation",
      content: "As a designer, I appreciate the beautiful interface and seamless experience. Highly recommended!",
      rating: 4,
      avatar: "dr"
    }
  ]);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [inboxPanelOpen, setInboxPanelOpen] = useState(false);
  const [postJobOpen, setPostJobOpen] = useState(false);
  const [documentShareOpen, setDocumentShareOpen] = useState(false);
  
  // Loader and Advertiser Notifications
  const [isLoading, setIsLoading] = useState(true);
  const [systemReady, setSystemReady] = useState(false);
  const [advertiserNotification, setAdvertiserNotification] = useState(null);
  
  // User typing state to prevent loader during typing
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);

  // Backend jobs state
  const [backendJobs, setBackendJobs] = useState([]);
  
  // Enhanced user profile with proper initialization for backend
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    experience: "",
    experienceLevel: "",
    education: "",
    educationLevel: "",
    preferredJobType: "full-time",
    preferredLocation: "",
    salaryExpectation: 0,
    resume: null,
    linkedin: "",
    github: "",
    portfolio: "",
    certifications: [],
    languages: [],
    availability: "immediate",
    userType: "jobSeeker",
    title: "",
    industry: "",
    company: "",
    yearsOfExperience: 0,
    currentSalary: 0,
    desiredSalary: 0,
    noticePeriod: "immediate",
    workAuthorization: "",
    relocation: false,
    securityClearance: false
  });

  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [companyApplications, setCompanyApplications] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReply, setMessageReply] = useState('');
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    messageAlerts: true,
    profileVisibility: true,
    showSalary: true,
    autoApply: false,
    darkMode: false,
    aiMatching: true
  });

  // AI Matching State
  const [jobMatches, setJobMatches] = useState({});
  const [profileAnalysis, setProfileAnalysis] = useState(null);

  // New job state
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    category: 'technology',
    experience: 'mid',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    remote: false,
    urgent: false,
    contactEmail: '',
    contactPhone: '',
    applicationUrl: ''
  });

  const [userDocuments, setUserDocuments] = useState([
    { id: 1, name: 'Resume.pdf', type: 'resume', size: '245 KB', uploadDate: '2023-05-15', shared: false },
    { id: 2, name: 'Cover_Letter.pdf', type: 'cover-letter', size: '125 KB', uploadDate: '2023-05-18', shared: true },
    { id: 3, name: 'Portfolio.pdf', type: 'portfolio', size: '3.2 MB', uploadDate: '2023-05-20', shared: false }
  ]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  // Loader and Pagination States
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(3);
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const [showAllJobs, setShowAllJobs] = useState(false);

  const categories = useMemo(() => {
    const list = backendJobs;
    return [
      { id: 'all', name: 'All Jobs', icon: <Briefcase className="w-4 h-4" />, count: list.length },
      { id: 'technology', name: 'Technology', icon: <Code className="w-4 h-4" />, count: list.filter(j => j.category === 'technology').length },
      { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="w-4 h-4" />, count: list.filter(j => j.category === 'marketing').length },
      { id: 'finance', name: 'Finance', icon: <DollarSign className="w-4 h-4" />, count: list.filter(j => j.category === 'finance').length },
      { id: 'healthcare', name: 'Healthcare', icon: <Stethoscope className="w-4 h-4" />, count: list.filter(j => j.category === 'healthcare').length }
    ];
  }, [backendJobs]);

  const themes = {
    office: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2084&q=80',
    tech: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    meeting: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    workspace: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
    business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    interview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2088&q=80'
  };

  // Fetch jobs from backend
  const fetchJobsFromBackend = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both response formats: { success: true, jobs: [] } or { success: true, data: [] }
      const jobs = data.jobs || data.data || [];
      
      if (data.success && jobs.length > 0) {
        const transformedJobs = jobs.map(job => ({
          id: job._id || job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary,
          category: job.category,
          experience: job.experience,
          description: job.description,
          responsibilities: job.responsibilities || [],
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          remote: job.remote || false,
          urgent: job.urgent || false,
          companyLogo: job.companyLogo || job.company.substring(0, 2).toUpperCase(),
          matchScore: job.matchScore || 0,
          applicants: job.applicants || 0,
          companySize: job.companySize || "",
          workCulture: job.workCulture || "To be determined",
          featured: job.featured || false,
          image: job.image || themes.office,
          posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently",
          skills: job.skills || [],
          salaryMin: job.salaryMin || 0,
          salaryMax: job.salaryMax || 0,
          postedBy: job.postedBy?._id || job.postedBy || null
        }));
        
        setBackendJobs(transformedJobs);
        
        // Add job match notifications automatically after jobs load
        if (token && transformedJobs.length > 0) {
          setTimeout(() => {
            // Get first 5 jobs and add as job matches
            const newNotifs = transformedJobs.slice(0, 5).map((job, index) => ({
              id: `job_match_${job.id}_${Date.now()}`,
              type: 'job_match',
              title: `${job.title} Matches Your Profile!`,
              message: `Great opportunity at ${job.company}. ${job.location}. ${job.type}.`,
              date: new Date().toISOString(),
              read: false,
              jobId: job.id,
              relatedId: job.id,
              relatedType: 'job',
              jobDetails: { jobId: job.id, title: job.title, company: job.company, location: job.location, salary: job.salary },
              priority: 'normal'
            }));
            
            setNotifications(prev => [...newNotifs, ...prev]);
            setNotificationPanelOpen(true);
            showNotification('Found job matches!', 'success');
          }, 3000);
        }
        
        return transformedJobs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching jobs from backend:', error);
      return [];
    }
  };

  // Fetch user applications
  const fetchUserApplications = async (userToken) => {
    if (!userToken) {
      console.log('No token provided for fetchUserApplications');
      return;
    }
    try {
      const response = await fetch(`${getApiBaseUrl()}/applications/my-applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        console.log('No applications found or not authorized');
        return;
      }
      
      const data = await response.json();
      console.log('User applications response:', data);
      
      if (data.success) {
        const apps = data.applications || data.data || [];
        
        const appliedJobIds = new Set(
          apps.map(app => {
            const jobRef = app.jobId;
            if (!jobRef) return undefined;
            return typeof jobRef === 'string' ? jobRef : jobRef._id || jobRef.id;
          }).filter(Boolean)
        );
        setAppliedJobs(appliedJobIds);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  // Fetch user's posted jobs (for companies)
  const fetchUserJobs = async (userToken) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/jobs/my-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        console.log('No jobs posted by user or not authorized');
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.jobs) {
        console.log('User jobs:', data.jobs);
      }
    } catch (error) {
      console.error('Error fetching user jobs:', error);
    }
  };

  // Fetch company applications (for companies)
  const fetchCompanyApplications = async (userToken) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/applications/for-my-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!response.ok) {
        console.log('No company applications found');
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.applications) {
        setCompanyApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching company applications:', error);
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async (userToken) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/notifications`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (!res.ok) {
        if (res.status !== 404) {
          console.error('Notifications fetch failed with status', res.status);
        }
        return;
      }
      
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  // Fetch messages (inbox + sent) from backend
  const fetchMessages = async (userToken) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/messages`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      
      if (!res.ok) {
        if (res.status !== 404) {
          console.error('Messages fetch failed with status', res.status);
        }
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        const combined = [
          ...(data.inbox || []).map(m => ({ ...m, _box: 'inbox' })),
          ...(data.sent || []).map(m => ({ ...m, _box: 'sent' }))
        ];
        setMessages(combined);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  };

  // Send a message to a user (used by CompanyDashboard)
  const sendMessageToUser = async ({ toUserId, jobId, applicationId, body, subject = '' }) => {
    if (!token) {
      showNotification('Please log in to send messages.', 'warning');
      setLoginOpen(true);
      return;
    }
    
    if (!toUserId || !body) {
      showNotification('Recipient and message body are required', 'error');
      return;
    }
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId, jobId, applicationId, subject, body })
      });
      
      const data = await res.json();
      
      if (data.success) {
        showNotification('Message sent', 'success');
        fetchMessages(token);
        fetchNotifications(token);
      } else {
        showNotification(data.message || 'Failed to send message', 'error');
      }
    } catch (e) {
      console.error('Error sending message:', e);
      showNotification('Network error while sending message', 'error');
    }
  };

  // Fetch initial data
  const fetchInitialData = async (userToken) => {
    try {
      setIsLoading(true);
      
      const jobsPromise = fetchJobsFromBackend();
      const appsPromise = userToken ? fetchUserApplications(userToken) : Promise.resolve();
      const notifsPromise = userToken ? fetchNotifications(userToken) : Promise.resolve();
      const messagesPromise = userToken ? fetchMessages(userToken) : Promise.resolve();
      const companyAppsPromise = (userToken && user?.userType === 'company') ? fetchCompanyApplications(userToken) : Promise.resolve();

      const [backendJobsData] = await Promise.all([
        jobsPromise,
        appsPromise,
        notifsPromise,
        messagesPromise,
        companyAppsPromise
      ]);
      
      setDisplayedJobs(backendJobsData || []);
      
      // Run job matching after data loads
      if (userToken && user?.userType === 'jobSeeker') {
        setTimeout(async () => {
          try {
            await fetch(`${getApiBaseUrl()}/ai-matching/analyze-jobs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
              body: JSON.stringify({ minMatchScore: 50 })
            });
          } catch (e) {}
        }, 5000);
      }
      
      setTimeout(() => {
        setIsLoading(false);
        setSystemReady(true);
        showNotification(`Welcome back, ${user?.name || 'User'}!`, 'success');
      }, 300);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setDisplayedJobs([]);
      setIsLoading(false);
      setSystemReady(true);
      showNotification('System loaded with limited functionality', 'warning');
    }
  };

  // Check for existing token and load data on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        setUserProfile(prev => ({
          ...prev,
          name: userData?.name || "",
          email: userData?.email || "",
          userType: userData?.userType || "jobSeeker",
          profile: userData?.profile || {},
          ...(userData.personalInfo || {}),
          ...(userData.professionalInfo || {})
        }));
        
        // Fetch full profile with resume
        fetch(`${getApiBaseUrl()}/users/me`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        })
        .then(res => res.json())
        .then(profileData => {
          if (profileData.success && profileData.data) {
            const userData = profileData.data.user || profileData.data;
            setUserProfile(prev => ({
              ...prev,
              ...userData,
              profile: userData.profile || profileData.data.profile || {}
            }));
            // Also update user state with profile photo
            if (userData.profile?.profilePhoto) {
              setUser(prev => prev ? { ...prev, profilePhoto: userData.profile.profilePhoto } : prev);
            }
          }
        })
        .catch(console.error);
        
        // Navigate to dashboard if user is company
        if (userData?.userType === 'company') {
          setShowDashboard(true);
        }
        
        // Fetch initial data (backend creates notifications in database for new users)
        fetchInitialData(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setIsLoading(false);
        setSystemReady(true);
      }
    } else {
      (async () => {
        try {
          const data = await fetchJobsFromBackend();
          setDisplayedJobs(data || []);
          setIsLoading(false);
          setSystemReady(true);
          showNotification('Welcome to Mission Hub! Browse jobs and log in to apply.', 'info');
        } catch (error) {
          console.error('Error loading initial jobs:', error);
          setIsLoading(false);
          setSystemReady(true);
        }
      })();
    }
  }, []);

  // System Loader Effect
  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setSystemReady(true);
        showNotification('System loaded successfully! Welcome to Mission Hub.', 'success');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [token]);

  // Handle user typing to prevent loader
  const handleUserTyping = (field, value) => {
    setIsUserTyping(true);
    
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    const timer = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
    
    setTypingTimer(timer);
    
    if (field === 'search') {
      setSearchQuery(value);
    } else if (field === 'location') {
      setLocationQuery(value);
    }
  };

  // Apply for job with comprehensive backend integration
  const applyForJob = async (jobId, applicationData = {}) => {
    if (!user) {
      showNotification('Please log in to apply for a job.', 'warning');
      setLoginOpen(true);
      return;
    }

    const job = backendJobs.find(j => j.id === jobId);
    if (!job) {
      showNotification('Job not found.', 'error');
      return;
    }
    
    try {
      if (userSettings.aiMatching) {
        const matchResult = aiMatcher.calculateMatch(userProfile, job);
        const gaps = aiMatcher.analyzeProfileGaps(userProfile, job);
        
        setJobMatches(prev => ({
          ...prev,
          [jobId]: matchResult
        }));

        if (matchResult.overallScore < 50) {
          showNotification(`Low match score (${matchResult.overallScore}%). Consider improving your profile.`, 'warning');
        }
      }

      const response = await fetch(`${getApiBaseUrl()}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId,
          coverLetter: applicationData.coverLetter || '',
          resume: userProfile.resume
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newAppliedJobs = new Set(appliedJobs);
        newAppliedJobs.add(jobId);
        setAppliedJobs(newAppliedJobs);
        
        showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success');
        fetchUserApplications(token);
      } else {
        showNotification(data.message || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showNotification(error.message || 'Network error. Please try again.', 'error');
    }
  };

  // Contact company - send message
  const contactCompany = async (job) => {
    if (!user) {
      showNotification('Please log in to contact the company.', 'warning');
      setLoginOpen(true);
      return;
    }

    const messageSubject = `Inquiry about ${job.title} position`;
    const messageBody = `Hi,\n\nI'm interested in the ${job.title} position at ${job.company} and would like to learn more about the opportunity.\n\nThank you for your time!`;

    try {
      const response = await fetch(`${getApiBaseUrl()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: job.postedBy,
          subject: messageSubject,
          body: messageBody,
          jobId: job.id
        })
      });

      const data = await response.json();

      if (data.success) {
        showNotification(`Message sent to ${job.company}! Check your email for confirmation.`, 'success');
      } else {
        showNotification(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message. Please try again.', 'error');
    }
  };

  // Enhanced filtered jobs with AI scoring and safe access
  const filteredJobs = useMemo(() => {
    const jobsToFilter = backendJobs || [];
    
    const baseFiltered = jobsToFilter.filter(job => {
      const matchesCategory = activeCategory === 'all' || job.category === activeCategory;
      const matchesType = !activeFilters.type || job.type === activeFilters.type;
      const matchesExperience = !activeFilters.experience || job.experience === activeFilters.experience;
      const matchesSalary = job.salaryMin >= activeFilters.salary;
      const allQuery = `${searchQuery} ${locationQuery}`.toLowerCase().trim();
      const matchesQuery = !allQuery || 
        job.title?.toLowerCase().includes(allQuery) ||
        job.company?.toLowerCase().includes(allQuery) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(allQuery))) ||
        job.location?.toLowerCase().includes(locationQuery.toLowerCase().trim());
      const matchesRemote = !activeFilters.remote || job.remote === activeFilters.remote;
      return matchesCategory && matchesType && matchesExperience && 
             matchesSalary && matchesRemote && matchesQuery;
    });

    if (userSettings.aiMatching && user) {
      return baseFiltered
        .map(job => {
          const matchResult = aiMatcher.calculateMatch(userProfile, job);
          return {
            ...job,
            aiMatchScore: matchResult.overallScore,
            aiBreakdown: matchResult.breakdown,
            isGoodMatch: matchResult.isGoodMatch,
            isExcellentMatch: matchResult.isExcellentMatch,
            matchRecommendation: matchResult.recommendation
          };
        })
        .sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
    }

    return baseFiltered;
  }, [backendJobs, activeCategory, activeFilters, searchQuery, locationQuery, userSettings.aiMatching, user, userProfile]);

  // Load more jobs function
  const loadMoreJobs = async () => {
    setShowAllJobs(true);
    setDisplayedJobs(filteredJobs);
  };

  const hasMoreJobs = !showAllJobs && filteredJobs.length > jobsPerPage;
  const totalPages = 1;

  // Auto-analyze profile when it changes
  useEffect(() => {
    if (user && userSettings.aiMatching) {
      analyzeProfileForImprovements();
    }
  }, [userProfile, userSettings.aiMatching, user]);

  const analyzeProfileForImprovements = () => {
    const allJobs = (filteredJobs || []).slice(0, 10);
    if (allJobs.length === 0) return;
    
    let totalScore = 0;
    let improvementAreas = new Set();
    
    allJobs.forEach(job => {
      const matchResult = aiMatcher.calculateMatch(userProfile, job);
      totalScore += matchResult.overallScore;
      
      const gaps = aiMatcher.analyzeProfileGaps(userProfile, job);
      gaps.forEach(gap => {
        if (gap.priority === 'high') {
          improvementAreas.add(gap.message);
        }
      });
    });
    
    const averageScore = Math.round(totalScore / allJobs.length);
    
    setProfileAnalysis({
      averageMatchScore: averageScore,
      improvementAreas: Array.from(improvementAreas),
      lastAnalyzed: new Date()
    });
  };

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle bookmark function
  const toggleBookmark = (jobId) => {
    const newBookmarks = new Set(bookmarkedJobs);
    if (newBookmarks.has(jobId)) {
      newBookmarks.delete(jobId);
      showNotification('Job removed from bookmarks', 'info');
    } else {
      newBookmarks.add(jobId);
      showNotification('Job bookmarked successfully!', 'success');
    }
    setBookmarkedJobs(newBookmarks);
  };

  // Toggle comparison function
  const toggleComparison = (job) => {
    if (!job) return;
    
    if (comparisonJobs.find(j => j.id === job.id)) {
      setComparisonJobs(comparisonJobs.filter(j => j.id !== job.id));
      showNotification(`${job.title} removed from comparison`, 'info');
    } else {
      if (comparisonJobs.length < 3) {
        setComparisonJobs([...comparisonJobs, job]);
        showNotification(`${job.title} added to comparison`, 'success');
        if (comparisonJobs.length === 0) {
          setComparisonOpen(true);
        }
      } else {
        showNotification('Maximum 3 jobs can be compared', 'info');
      }
    }
  };

  // Toggle voice search function
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showNotification('Voice search is not supported by your browser.', 'error');
      return;
    }
    
    if (!isListening) {
      setIsListening(true);
      showNotification('Listening... Speak now', 'info');
      setTimeout(() => {
        setIsListening(false);
        const sampleQueries = ['software engineer', 'remote jobs', 'marketing positions'];
        const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
        setSearchQuery(randomQuery);
        showNotification(`Searching for "${randomQuery}"`, 'success');
      }, 3000);
    } else {
      setIsListening(false);
      showNotification('Voice search stopped', 'info');
    }
  };

  // Login handler
  const handleLogin = async (loginData) => {
    try {
      console.log('📤 Sending login request:', loginData.email);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: {
          email: loginData.email,
          password: loginData.password
        }
      });
      
      console.log('📥 Login response:', data);
      
      if (data.success) {
        console.log('✅ Login successful!');
        const storage = loginData.rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setToken(data.token);
        
        setUserProfile(prev => ({
          ...prev,
          ...(data.user.personalInfo || {}),
          ...(data.user.professionalInfo || {}),
          name: data.user?.name || "",
          email: data.user?.email || "",
          userType: data.user?.userType || "jobSeeker",
          profile: data.user?.profile || {}
        }));
        
        setLoginOpen(false);
        
        // Navigate to dashboard for company users only
        if (data.user.userType === 'company') {
          console.log('🏢 Company user - showing dashboard');
          setShowDashboard(true);
          // Company dashboard will fetch its own data asynchronously
        } else {
          // Fetch user data in background for non-company users
          fetchUserJobs(data.token).catch(console.error);
          fetchUserApplications(data.token).catch(console.error);
          
          // Auto-analyze jobs for matching after login
          setTimeout(async () => {
            try {
              await fetch(`${getApiBaseUrl()}/ai-matching/analyze-jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` },
                body: JSON.stringify({ minMatchScore: 50 })
              });
            } catch (e) { console.error('Job matching error:', e); }
          }, 3000);
        }
        
        // Show welcome message (backend now creates notifications in database)
        showNotification(`Welcome, ${data.user.name}!`, 'success');
        
        return { success: true, user: data.user };
      } else {
        console.log('❌ Login failed:', data.message);
        const msg = data?.message || 'Login failed';
        throw new Error(msg);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Register handler
  const handleRegister = async (registerData) => {
    try {
      setIsLoading(true);
      
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: {
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          userType: registerData.userType || 'jobSeeker'
        }
      });
      
      if (data.success) {
        showNotification('Registration successful! Check console/email for verification code.', 'success');
        setRegisterOpen(false);
      } else {
        showNotification(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(error.message || 'Network error. Please check if the backend server is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle post job click
  const handlePostJobClick = () => {
    if (!user) {
      showNotification('Please log in to post a job', 'warning');
      setLoginOpen(true);
    } else if (user.userType !== 'company') {
      showNotification('Only company accounts can post jobs. Please create a company account.', 'warning');
    } else {
      setPostJobOpen(true);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file || !token) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/upload/profile-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Profile photo uploaded successfully!', 'success');
        setUserProfile(prev => ({ ...prev, profilePhoto: data.imageUrl }));
      } else {
        showNotification('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Network error during image upload', 'error');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      setUser(null);
      setToken(null);
      setShowDashboard(false);
      setProfileDropdownOpen(false);
      showNotification('You have been logged out', 'info');
      
      setAppliedJobs(new Set());
      setCompanyApplications([]);
      setNotifications([]);
      setMessages([]);
      
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setShowDashboard(false);
      setProfileDropdownOpen(false);
      showNotification('You have been logged out', 'info');
    }
  };

  // Change theme function
  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    showNotification(`Theme changed to ${theme}`, 'info');
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setActiveFilters({
      category: 'all',
      type: '',
      experience: '',
      salary: 0,
      location: '',
      remote: false
    });
    setSearchQuery('');
    setLocationQuery('');
    setActiveCategory('all');
    showNotification('All filters cleared', 'info');
  };

  // Handle navigation function
  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setExpandedJobId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle AI assistant function
  const handleAIAssistant = () => {
    setAiAssistantThinking(true);
    setTimeout(() => {
      setAiAssistantThinking(false);
      showNotification('AI Assistant: Based on your profile, I found some job matches!', 'success');
      setJobAlertBannerOpen(true);
      setTimeout(() => setJobAlertBannerOpen(false), 5000);
    }, 2000);
  };

  // Toggle job details function
  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // Handle filter change function
  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle category filter function
  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
    setExpandedJobId(null);
    showNotification(`Filtering by ${categories.find(c => c.id === categoryId)?.name || 'category'}`, 'info');
  };

  // Handle new job change function
  const handleNewJobChange = (field, value) => {
    setNewJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle post job function with backend integration
  const handlePostJob = async (e) => {
    e.preventDefault();
    
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.description) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          type: newJob.type,
          salary: newJob.salary,
          category: newJob.category,
          experience: newJob.experience,
          description: newJob.description,
          responsibilities: newJob.responsibilities?.split('\n').filter(r => r.trim()) || [],
          requirements: newJob.requirements?.split('\n').filter(r => r.trim()) || [],
          benefits: newJob.benefits?.split(',').map(b => b.trim()) || [],
          remote: newJob.remote,
          urgent: newJob.urgent,
          contactEmail: newJob.contactEmail,
          contactPhone: newJob.contactPhone,
          applicationUrl: newJob.applicationUrl
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const jobToAdd = {
          id: data.job._id || data.job.id,
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          type: newJob.type,
          salary: newJob.salary,
          category: newJob.category,
          experience: newJob.experience,
          description: newJob.description,
          responsibilities: newJob.responsibilities?.split('\n').filter(r => r.trim()) || [],
          requirements: newJob.requirements?.split('\n').filter(r => r.trim()) || [],
          benefits: newJob.benefits?.split(',').map(b => b.trim()) || [],
          remote: newJob.remote,
          urgent: newJob.urgent,
          companyLogo: newJob.company.substring(0, 2).toUpperCase(),
          matchScore: 0,
          applicants: 0,
          companySize: "",
          workCulture: "To be determined",
          featured: false,
          image: themes[newJob.category] || themes.office,
          posted: "Just now",
          skills: [],
          salaryMin: 0,
          salaryMax: 0,
          postedBy: user?._id || user?.id
        };
        
        setBackendJobs(prev => [jobToAdd, ...prev]);
        
        setNewJob({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          salary: '',
          category: 'technology',
          experience: 'mid',
          description: '',
          responsibilities: '',
          requirements: '',
          benefits: '',
          remote: false,
          urgent: false,
          contactEmail: '',
          contactPhone: '',
          applicationUrl: ''
        });
        
        setPostJobOpen(false);
        showNotification('Job posted successfully!', 'success');
        
      } else {
        showNotification(data.message || 'Failed to post job', 'error');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      showNotification('Network error. Please try again.', 'error');
    }
  };

  // Handle add document
  const handleAddDocument = async (file, type) => {
    if (!file) {
      showNotification('Please select a file', 'warning');
      return;
    }
    
    const newDoc = {
      id: Date.now(),
      name: file.name,
      type: type || 'other',
      size: (file.size / 1024).toFixed(1) + ' KB',
      uploadDate: new Date().toISOString().split('T')[0],
      shared: false,
      file: file
    };
    
    setUserDocuments(prev => [newDoc, ...prev]);
    showNotification(`${file.name} added successfully`, 'success');
  };

  // Handle toggle document share
  const handleToggleDocumentShare = (docId) => {
    setUserDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const newShared = !doc.shared;
        showNotification(`Document ${newShared ? 'shared' : 'unshared'} successfully`, 'success');
        return { ...doc, shared: newShared };
      }
      return doc;
    }));
  };

  // Handle delete document
  const handleDeleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setUserDocuments(prev => prev.filter(doc => doc.id !== docId));
      showNotification('Document deleted successfully', 'success');
    }
  };

  // Handle preview document
  const handlePreviewDocument = (doc) => {
    setDocumentPreview(doc);
    showNotification(`Previewing: ${doc.name}`, 'info');
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      if (token) {
        await fetch(`${getApiBaseUrl()}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      if (token) {
        await fetch(`${getApiBaseUrl()}/notifications/read-all`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showNotification('All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      if (token) {
        await fetch(`${getApiBaseUrl()}/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showNotification('Notification deleted', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Manual trigger function
  const triggerMatchingNow = async (jobsToMatch = backendJobs) => {
    alert('Running AI Matching for ' + (jobsToMatch?.length || 0) + ' jobs with profile: ' + JSON.stringify(userProfile));
    
    if (!token || !jobsToMatch?.length) {
      return;
    }
    
    console.log('Starting matching with profile:', userProfile);
    
    const userSkills = Array.isArray(userProfile?.skills) 
      ? userProfile.skills.map(s => String(s).toLowerCase()) 
      : [];
    const userExp = userProfile?.experience || userProfile?.yearsOfExperience || 0;
    console.log('Running matching with', userSkills.length, 'skills');
    
    const matches = [];
    
    for (const job of jobsToMatch) {
      const jobSkills = Array.isArray(job?.skills) 
        ? job.skills.map(s => String(s).toLowerCase()) 
        : [];
      
      const matched = userSkills.length > 0 
        ? userSkills.filter(s => jobSkills.some(js=> (js||'').includes(s) || (s||'').includes(js)))
        : [];
      
      const jobExpText = (job.experience || '').toLowerCase();
      let expScore = 50;
      if (jobExpText.includes('entry') || jobExpText.includes('junior')) expScore = 100;
      else if (jobExpText.includes('mid')) expScore = userExp >= 2 ? 100 : 50;
      else if (jobExpText.includes('senior')) expScore = userExp >= 5 ? 100 : 30;
      
      const skillScore = jobSkills.length > 0 && matched.length > 0 ? (matched.length / jobSkills.length) * 100 : 70;
      const totalScore = (skillScore * 0.6) + (expScore * 0.3) + 10;
      
      if (totalScore >= 60) {
        matches.push({ ...job, matchedSkills: matched, matchScore: totalScore });
      }
    }
    
    matches.sort((a, b) => b.matchScore - a.matchScore);
    const top5 = matches.slice(0, 5);
    
    for (const job of top5) {
      // Check for existing notification - use state directly
      const currentNotifs = notifications || [];
      const hasNotif = currentNotifs.some(n => n.jobId === job.id && n.type === 'job_match');
      // Check for existing notification
      if (!hasNotif) {
        const notif = {
          id: `ai_${job.id}_${Date.now()}`,
          type: 'job_match',
          title: `${job.title} Matches Your Profile!`,
          message: `Great match! ${job.title} at ${job.company}. You match ${job.matchedSkills.length} skills.`,
          date: new Date().toISOString(),
          read: false,
          jobId: job.id,
          relatedId: job.id,
          relatedType: 'job',
          jobDetails: { jobId: job.id, title: job.title, company: job.company, location: job.location, salary: job.salary },
          priority: job.matchScore >= 80 ? 'high' : 'normal'
        };
        
        setNotifications(prev => {
          console.log('Adding notification for job', job.id);
          return [notif, ...prev];
        });
        
        // Skip saving to backend since endpoint doesn't exist - just use local state
        // try {
        //   await fetch(`${getApiBaseUrl()}/notifications`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        //     body: JSON.stringify(notif)
        //   });
        // } catch (e) {}
      }
    }
  };

  // Trigger AI job matching when jobs or profile changes
  React.useEffect(() => {
    console.log('AI Effect check', { 
      token: !!token, 
      jobs: backendJobs.length, 
      profile: !!userProfile,
      skills: userProfile?.skills,
      experience: userProfile?.experience 
    });
    
    if (!token || !backendJobs.length || !userProfile) return;
    
    const doMatching = async () => {
      console.log('Matching started, userProfile:', userProfile);
      const userSkills = Array.isArray(userProfile?.skills) && userProfile.skills.length > 0
        ? userProfile.skills.map(s => String(s).toLowerCase()) 
        : [];
      const userExp = userProfile?.experience || userProfile?.yearsOfExperience || 0;
      console.log('User skills:', userSkills, 'Experience:', userExp);
      
      // Create matches for ANY jobs since profile might not have skills yet
      const matches = [];
      
      for (const job of backendJobs) {
        const jobSkills = Array.isArray(job.skills) 
          ? job.skills.map(s => String(s).toLowerCase()) 
          : [];
        
        const matched = userSkills.length > 0 
          ? userSkills.filter(s => jobSkills.some(js => (js || '').includes(s) || (s || '').includes(js)))
          : [];
        
        const jobExp = (job.experience || '').toLowerCase();
        let expScore = 50;
        if (jobExp.includes('entry') || jobExp.includes('junior')) expScore = 100;
        else if (jobExp.includes('mid')) expScore = userExp >= 2 ? 100 : 50;
        else if (jobExp.includes('senior')) expScore = userExp >= 5 ? 100 : 30;
        
        const skillScore = jobSkills.length > 0 && matched.length > 0 ? (matched.length / jobSkills.length) * 100 : 70;
        // Lower threshold to 40 to match more jobs
        const totalScore = (skillScore * 0.6) + (expScore * 0.3) + 10;
        
        // Accept any job with score >= 40 OR if user has no skills, match all jobs
        if (totalScore >= 40 || userSkills.length === 0) {
          matches.push({ ...job, matchedSkills: matched, matchScore: Math.max(totalScore, 60) });
        }
      }
      
      matches.sort((a, b) => b.matchScore - a.matchScore);
      const top5 = matches.slice(0, 5);
      
      console.log('Found matches:', top5.length);
      
      for (const job of top5) {
        const hasNotif = notifications.some(n => n.jobId === job.id && n.type === 'job_match');
        
        if (!hasNotif) {
          const notif = {
            id: `ai_${job.id}_${Date.now()}`,
            type: 'job_match',
            title: `${job.title} Matches Your Profile!`,
            message: `Great match! ${job.title} at ${job.company}. You match ${job.matchedSkills.length} skills.`,
            date: new Date().toISOString(),
            read: false,
            jobId: job.id,
            relatedId: job.id,
            relatedType: 'job',
            jobDetails: { jobId: job.id, title: job.title, company: job.company, location: job.location, salary: job.salary },
            priority: job.matchScore >= 80 ? 'high' : 'normal'
          };
          
          // Only save to local state - backend notification system handled separately
        }
      }
    };
    
    const timer = setTimeout(doMatching, 3000);
    return () => clearTimeout(timer);
  }, [token, backendJobs, userProfile]);

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      if (token) {
        await fetch(`${getApiBaseUrl()}/messages/${messageId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setMessages(prev => prev.map(m => 
        m.id === messageId || m._id === messageId ? { ...m, read: true } : m
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      if (token) {
        await fetch(`${getApiBaseUrl()}/messages/${messageId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setMessages(prev => prev.filter(m => m.id !== messageId && m._id !== messageId));
      showNotification('Message deleted', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Fetch conversation with a specific user
  const fetchConversation = async (otherUserId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return { success: true, messages: data.data || [] };
      }
      return { success: false, messages: [] };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return { success: false, messages: [] };
    }
  };

  // Send message reply
  const sendMessageReply = async () => {
    if (!messageReply.trim() || !selectedMessage) return;
    
    try {
      const recipientId = selectedMessage.fromUserId?._id || selectedMessage.fromUserId;
      
      if (token) {
        const response = await fetch(`${getApiBaseUrl()}/messages/reply/${selectedMessage._id || selectedMessage.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ body: messageReply })
        });
        
        if (response.ok) {
          showNotification('Reply sent successfully', 'success');
          setMessageReply('');
          fetchMessages(token);
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showNotification('Failed to send reply', 'error');
    }
  };

  // Update profile function with backend integration
  const updateProfile = async (field, value) => {
    if (!token) {
      showNotification('Please log in to update profile', 'warning');
      return;
    }
    
    try {
      let updateData = {};
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updateData[parent] = { [child]: value };
      } else if (field === 'fullProfile') {
        updateData = value;
      } else {
        updateData[field] = value;
      }
      
      const response = await fetch(`${getApiBaseUrl()}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          setUserProfile(prev => ({
            ...prev,
            [parent]: {
              ...(prev[parent] || {}),
              [child]: value
            }
          }));
        } else if (field === 'fullProfile') {
          setUserProfile(prev => ({ ...prev, ...value }));
        } else {
          setUserProfile(prev => ({ ...prev, [field]: value }));
        }
        
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        
        if (localStorage.getItem('token')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        showNotification('Profile updated successfully', 'success');
      } else {
        showNotification(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Network error. Please try again.', 'error');
    }
  };

  // Update settings function
  const updateSettings = (field, value) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'aiMatching' && value) {
      showNotification('AI Job Matching enabled! Your profile will be analyzed for better matches.', 'success');
      setTimeout(() => analyzeProfileForImprovements(), 1000);
    }
    
    showNotification('Settings saved', 'success');
  };

  // Scroll progress effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(scrollPercent);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial notifications effect
  useEffect(() => {
    setTimeout(() => {
      showNotification('Welcome to Mission Hub! Personalized job matches are ready.', 'success');
    }, 1000);
    
    setTimeout(() => {
      setJobAlertBannerOpen(true);
      setTimeout(() => setJobAlertBannerOpen(false), 8000);
    }, 5000);
  }, []);

  // Format timestamp function
  const formatTimestamp = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // System Loader Component
  const SystemLoader = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gray-900" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Mission Hub</h2>
        <p className="text-gray-600 mb-8">Loading your career opportunities...</p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  // Loader Component for content loading
  const Loader = () => (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-gray-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading amazing job opportunities...</p>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  // Page rendering function - Show dashboard for logged-in users or regular pages
  const renderPage = () => {
    console.log('🔍 renderPage - user:', user?.name, '| userType:', user?.userType, '| token:', token ? 'present' : 'missing');
    // Show company dashboard for company users only when we have both user and token
    if (user?.userType === 'company' && token) {
      console.log('✅ Rendering CompanyDashboard');
      return (
        <CompanyDashboard user={user} token={token} />
      );
    }

    // For non-company users (job seekers or guests), show regular pages
    switch (currentPage) {
      case 'home':
        return (
          <>
            <div 
              className="relative py-24 bg-cover bg-center bg-fixed"
              style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${themes[currentTheme]})` }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white relative z-10">
                <div className="text-center">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">
                    Find Your <span className="text-white">Dream Mission & job</span>, Effortlessly
                  </h1>
                  <p className="text-xl mb-10 font-light">
                    AI-Powered Matches, Trusted by Top Companies.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row bg-white rounded-2xl p-3 shadow-xl space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-gray-900 transition-shadow bg-gray-50">
                    <Search className="w-6 h-6 text-gray-400 mx-3" />
                    <input
                      type="text"
                      placeholder="Job Title, Keywords, or Company..."
                      value={searchQuery}
                      onChange={(e) => handleUserTyping('search', e.target.value)}
                      onFocus={() => setSearchSuggestionsOpen(true)}
                      onBlur={() => setTimeout(() => setSearchSuggestionsOpen(false), 200)}
                      className="flex-1 outline-none text-lg text-gray-800 bg-transparent"
                    />
                    <button
                      onClick={toggleVoiceSearch}
                      className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                      title="Voice Search"
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-gray-900 transition-shadow bg-gray-50">
                    <MapPin className="w-6 h-6 text-gray-400 mx-3" />
                    <input
                      type="text"
                      placeholder="Location (e.g., Remote, NYC)"
                      value={locationQuery}
                      onChange={(e) => handleUserTyping('location', e.target.value)}
                      className="flex-1 outline-none text-lg text-gray-800 bg-transparent"
                    />
                    <button
                      onClick={() => handleFilterChange('remote', !activeFilters.remote)}
                      className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeFilters.remote ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Cloud className="w-4 h-4 mr-1" /> Remote
                    </button>
                  </div>
                  <button
                    onClick={() => showNotification(`Searching for ${searchQuery || 'all jobs'} in ${locationQuery || 'all locations'}...`, 'info')}
                    className="md:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg transform hover:scale-105"
                  >
                    <Search className="w-5 h-5 inline mr-2" /> Search
                  </button>
                </div>
              </div>
            </div>

            {jobAlertBannerOpen && (
              <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-4 rounded-xl shadow-xl flex items-center justify-between z-40 animate-slideUp">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span className="font-medium">Hot Alert!</span>
                  <span>You have new job opportunities waiting!</span>
                </div>
                <button 
                  onClick={() => setJobAlertBannerOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 bg-white">
              <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-slate-900">Browse by Category</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-sm w-32 ${
                        activeCategory === category.id 
                          ? 'bg-slate-900 text-white border border-slate-900' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      {React.cloneElement(category.icon, { className: `w-6 h-6 mb-2 ${activeCategory === category.id ? 'text-white' : 'text-slate-600'}` })}
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className="text-xs mt-1 opacity-75">{category.count} jobs</span>
                    </button>
                  ))}
                </div>
              </div>

              <JobFilter
                searchQuery={searchQuery}
                onSearchChange={handleUserTyping}
                locationQuery={locationQuery}
                onLocationChange={handleUserTyping}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryFilter}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearAllFilters}
                currentView={currentView}
                onViewChange={setCurrentView}
                jobCount={filteredJobs.length}
                isLoading={isLoading}
                isTyping={isUserTyping}
                categories={categories}
              />

              {/* Jobs Grid with Loader */}
              {isLoading && !isUserTyping && displayedJobs.length === 0 ? (
                <Loader />
              ) : (
                <div className="mt-10">
                  <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-slate-900 font-semibold">
                        {displayedJobs.length} jobs found
                      </p>
                      <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                          onClick={() => setCurrentView('grid')}
                          className={`p-2 rounded-lg transition-all ${currentView === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
                          title="Grid View"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentView('list')}
                          className={`p-2 rounded-lg transition-all ${currentView === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}
                          title="List View (horizontal)"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`grid gap-4 ${currentView === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
                    {displayedJobs.length > 0 ? (
                      (showAllJobs ? displayedJobs : displayedJobs.slice(0, jobsPerPage)).map(job => (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          view={currentView}
                          bookmarkedJobs={bookmarkedJobs}
                          appliedJobs={appliedJobs}
                          comparisonJobs={comparisonJobs}
                          expandedJobId={expandedJobId}
                          toggleBookmark={toggleBookmark}
                          toggleComparison={toggleComparison}
                          applyForJob={applyForJob}
                          toggleJobDetails={toggleJobDetails}
                          contactCompany={contactCompany}
                          aiMatchScore={job.aiMatchScore}
                          isGoodMatch={job.isGoodMatch}
                          isExcellentMatch={job.isExcellentMatch}
                        />
                      ))
                    ) : (
                      !isUserTyping && (
                        <div className="col-span-full text-center p-12 bg-slate-50 rounded-xl border border-slate-200">
                          <EyeOffIcon className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-slate-900">No Jobs Match Your Filters</h3>
                          <p className="text-slate-600">Try adjusting your search query, location, or clearing some filters.</p>
                          <button 
                            onClick={clearAllFilters}
                            className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* Load More Section */}
                  {hasMoreJobs && !isUserTyping && (
                    <div className="mt-12 text-center">
                      <div className="bg-white rounded-2xl p-8 border border-slate-200">
                        <button
                          onClick={loadMoreJobs}
                          className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg transform hover:scale-105 flex items-center mx-auto space-x-3"
                        >
                          <span>Load More ({filteredJobs.length - jobsPerPage} more)</span>
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* All Jobs Loaded Message */}
                  {!hasMoreJobs && displayedJobs.length > 0 && !isUserTyping && showAllJobs && (
                    <div className="mt-12 text-center">
                      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">All Jobs Loaded!</h3>
                        <p className="text-slate-600">
                          You've seen all {displayedJobs.length} jobs matching your criteria. 
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}

              <div className="mt-16"></div>

              <AboutSection 
                aboutStats={aboutStats}
              />
            </div>
          </>
        );
      case 'jobs':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">All Jobs</h1>
              <p className="text-lg text-slate-600">Browse all available job opportunities</p>
            </div>
            
            <JobFilter
              searchQuery={searchQuery}
              onSearchChange={handleUserTyping}
              locationQuery={locationQuery}
              onLocationChange={handleUserTyping}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryFilter}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearAllFilters}
              currentView={currentView}
              onViewChange={setCurrentView}
              jobCount={filteredJobs.length}
              isLoading={isLoading}
              isTyping={isUserTyping}
              categories={categories}
            />

            {/* Jobs Grid */}
            {isLoading && filteredJobs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    bookmarkedJobs={bookmarkedJobs}
                    appliedJobs={appliedJobs}
                    comparisonJobs={comparisonJobs}
                    expandedJobId={expandedJobId}
                    toggleBookmark={toggleBookmark}
                    toggleComparison={toggleComparison}
                    applyForJob={applyForJob}
                    toggleJobDetails={toggleJobDetails}
                    contactCompany={contactCompany}
                    aiMatchScore={job.aiMatchScore}
                    isGoodMatch={job.isGoodMatch}
                    isExcellentMatch={job.isExcellentMatch}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900">No Jobs</h3>
                <p className="text-slate-600">Try adjusting your search criteria</p>
                <button 
                  onClick={() => handleCategoryFilter('all')}
                  className="mt-4 px-6 py-2 bg-slate-950 text-white rounded-lg hover:bg-slate-900"
                >
                  View All Jobs
                </button>
              </div>
            )}
          </div>
        );
      case 'bookmarks':
        const bookmarkedJobDetails = backendJobs.filter(job => bookmarkedJobs.has(job.id));
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 flex items-center">
              <BookmarkCheck className="w-8 h-8 text-gray-900 mr-3" />
              My Bookmarked Jobs
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              A personalized list of jobs you're interested in. Never lose a great opportunity.
            </p>
            {bookmarkedJobDetails.length === 0 ? (
              <div className="text-center p-20 bg-white rounded-xl shadow-sm border border-gray-200">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">No Bookmarks Yet!</h3>
                <p className="text-gray-600">Click the bookmark icon on a job card to save it for later.</p>
                <button 
                  onClick={() => handleNavigation('home')}
                  className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Start Browsing Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {bookmarkedJobDetails.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    view="list"
                    bookmarkedJobs={bookmarkedJobs}
                    appliedJobs={appliedJobs}
                    comparisonJobs={comparisonJobs}
                    expandedJobId={expandedJobId}
                    toggleBookmark={toggleBookmark}
                    toggleComparison={toggleComparison}
                    applyForJob={applyForJob}
                    toggleJobDetails={toggleJobDetails}
                    contactCompany={contactCompany}
                    aiMatchScore={job.aiMatchScore}
                    isGoodMatch={job.isGoodMatch}
                    isExcellentMatch={job.isExcellentMatch}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'about':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-900">
            <div className="mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">About MissionHub</h2>
              <p className="text-white/70 text-center text-lg max-w-3xl mx-auto">Connecting talented job seekers with their dream careers and helping companies build their perfect teams.</p>
            </div>
            <AboutSection 
              aboutStats={aboutStats}
            />
          </div>
        );
      case 'comparison':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
            <ComparisonTable 
              comparisonJobs={comparisonJobs}
              setComparisonJobs={setComparisonJobs}
              toggleComparison={toggleComparison}
              appliedJobs={appliedJobs}
              applyForJob={applyForJob}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white text-gray-900">
        {/* System Loader */}
        {isLoading && <SystemLoader />}
        
        {/* Main App Content */}
        {!isLoading && (
        <>
          {/* Conditionally render Header only for non-company users */}
          {user?.userType !== 'company' && (
            <Header 
              currentPage={currentPage}
              handleNavigation={handleNavigation}
              user={user}
              notifications={notifications}
              messages={messages}
              setLoginOpen={setLoginOpen}
              setRegisterOpen={setRegisterOpen}
              setPostJobOpen={setPostJobOpen}
              showNotification={showNotification}
              setNotificationPanelOpen={setNotificationPanelOpen}
              setInboxPanelOpen={setInboxPanelOpen}
              setProfileDropdownOpen={setProfileDropdownOpen}
              profileDropdownOpen={profileDropdownOpen}
              setProfilePanelOpen={setProfilePanelOpen}
              setDocumentShareOpen={setDocumentShareOpen}
              setSettingsPanelOpen={setSettingsPanelOpen}
              handleLogout={handleLogout}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              handlePostJobClick={handlePostJobClick}
            />
          )}
          
          <main className={user?.userType === 'company' ? "min-h-screen" : "min-h-[70vh]"}>
            {renderPage()}
            
            {/* Test Button */}
            
          </main>
          
          {/* Conditionally render Footer only for non-company users */}
          {user?.userType !== 'company' && <Footer />}

          <Modals 
            loginOpen={loginOpen}
            setLoginOpen={setLoginOpen}
            registerOpen={registerOpen}
            setRegisterOpen={setRegisterOpen}
            postJobOpen={postJobOpen}
            setPostJobOpen={setPostJobOpen}
            documentShareOpen={documentShareOpen}
            setDocumentShareOpen={setDocumentShareOpen}
            documentPreview={documentPreview}
            setDocumentPreview={setDocumentPreview}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            handlePostJob={handlePostJob}
            handleFileUpload={handleImageUpload}
            uploadedFile={uploadedFile}
            handleAddDocument={handleAddDocument}
            userDocuments={userDocuments}
            handleToggleDocumentShare={handleToggleDocumentShare}
            handleDeleteDocument={handleDeleteDocument}
            handlePreviewDocument={handlePreviewDocument}
            showNotification={showNotification}
            handleImageUpload={handleImageUpload}
            newJob={newJob}
            handleNewJobChange={handleNewJobChange}
            user={user}
            token={token}
          />

          <MobileMenu 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            currentPage={currentPage}
            handleNavigation={handleNavigation}
            user={user}
            setPostJobOpen={setPostJobOpen}
            setLoginOpen={setLoginOpen}
            setRegisterOpen={setRegisterOpen}
            handleLogout={handleLogout}
          />

          <ProfilePanel 
            profilePanelOpen={profilePanelOpen}
            setProfilePanelOpen={setProfilePanelOpen}
            userProfile={userProfile}
            user={user}
            updateProfile={updateProfile}
            appliedJobs={appliedJobs}
            jobs={backendJobs}
            showNotification={showNotification}
            token={token}
          />

          <NotificationInboxSettingsPanels 
            notificationPanelOpen={notificationPanelOpen}
            setNotificationPanelOpen={setNotificationPanelOpen}
            inboxPanelOpen={inboxPanelOpen}
            setInboxPanelOpen={setInboxPanelOpen}
            settingsPanelOpen={settingsPanelOpen}
            setSettingsPanelOpen={setSettingsPanelOpen}
            notifications={notifications}
            messages={messages}
            userSettings={userSettings}
            updateSettings={updateSettings}
            markNotificationAsRead={markNotificationAsRead}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
            deleteNotification={deleteNotification}
            setSelectedMessage={setSelectedMessage}
            selectedMessage={selectedMessage}
            markMessageAsRead={markMessageAsRead}
            deleteMessage={deleteMessage}
            messageReply={messageReply}
            setMessageReply={setMessageReply}
            sendMessageReply={sendMessageReply}
            fetchConversation={fetchConversation}
            userId={user?._id || user?.id}
            token={token}
            userType={user?.userType || 'jobSeeker'}
          />

          {/* Company Applications Panel - only show for company users and if there are applications */}
          {user?.userType === 'company' && companyApplications.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications To Your Jobs</h3>
                <div className="divide-y">
                  {companyApplications.map(app => (
                    <div key={app._id || app.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{app.applicantName} <span className="text-gray-500 text-sm">({app.applicantEmail})</span></p>
                        <p className="text-sm text-gray-600">Applied for <span className="font-medium">{app.jobTitle}</span> at <span className="font-medium">{app.company}</span></p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{app.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Banner */}
          {notification && (
            <div 
              key={notification.id}
              className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl z-50 text-white font-medium transition-all duration-500 ease-out animate-toastIn ${
                notification.type === 'success' ? 'bg-green-600' :
                notification.type === 'info' ? 'bg-blue-600' :
                notification.type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
              }`}
            >
              {notification.message}
            </div>
          )}
        </>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default App;