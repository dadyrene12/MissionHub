import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import JobCard from './components/JobCard';
import ComparisonTable from './components/ComparisonTable';
import AboutSection from './components/AboutSection';
import { UIHelpers } from './components/UIHelpers';
import { Modals } from './components/Modals';
import MobileMenu from './components/MobileMenu';
import ChatAssistant from './components/ChatAssistant';
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

// Helper function to get API base URL safely (Vite uses import.meta.env)
const getApiBaseUrl = () => {
  return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '/api';
};

// AI Profile-Job Matching Engine
class ProfileJobMatcher {
  constructor() {
    this.skillWeights = {
      'JavaScript': 1.0,
      'React': 1.2,
      'Node.js': 1.1,
      'TypeScript': 1.3,
      'Python': 1.0,
      'Java': 1.0,
      'SQL': 0.8,
      'MongoDB': 0.9,
      'AWS': 1.1,
      'Docker': 1.0,
      'Kubernetes': 1.2,
      'GraphQL': 1.1,
      'Redis': 0.8,
      'Machine Learning': 1.4,
      'Data Science': 1.3,
      'UI/UX Design': 0.9,
      'Agile': 0.7,
      'Scrum': 0.7,
      'DevOps': 1.1,
      'CI/CD': 1.0
    };

    this.experienceLevels = {
      'entry': 1,
      'junior': 2,
      'mid': 3,
      'senior': 4,
      'lead': 5,
      'principal': 6
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
  const chatEndRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [currentView, setCurrentView] = useState('grid');
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
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm here to help you find your perfect job. What type of position are you looking for?", 
      isUser: false,
      timestamp: new Date(),
      status: 'delivered'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
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
      name: "ish lick",
      position: "Software Engineer",
      company: "ishconnect",
      content: "Mission hub helped me find my dream job in just 2 weeks! The platform is incredibly user-friendly.",
      rating: 5,
      avatar: "lk"
    },
    {
      id: 2,
      name: "alfu isheja",
      position: "Product Manager",
      company: "ishconnect",
      content: "The AI matching system is amazing. It found me opportunities I wouldn't have discovered otherwise.",
      rating: 5,
      avatar: "al"
    },
    {
      id: 3,
      name: "kevin ishimwe",
      position: "full stack developer",
      company: "nestedhub",
      content: "As a designer, I appreciate the beautiful interface and seamless experience. Highly recommended!",
      rating: 4,
      avatar: "kv"
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
  const [adNotificationTimer, setAdNotificationTimer] = useState(null);
  
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
    educationLevel: null, // FIXED: Initialize as null instead of empty string
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
    // Backend specific fields
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
  const [jobsPerPage, setJobsPerPage] = useState(1000000);
  const [displayedJobs, setDisplayedJobs] = useState([]);

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

  // ✅ Fetch jobs from backend
  const fetchJobsFromBackend = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.jobs) {
        // Transform backend jobs to match frontend format
        const transformedJobs = data.jobs.map(job => ({
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
          companySize: job.companySize || "Unknown",
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
        return transformedJobs;
      }
      return [];
    } catch (error) {
      console.error('Error fetching jobs from backend:', error);
      return [];
    }
  };

  // ✅ Fetch user applications
  const fetchUserApplications = async (userToken) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/applications/my-applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.applications) {
        // jobId may be populated (object) or just an id string; normalize to id string
        const appliedJobIds = new Set(
          data.applications.map(app => {
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

  // ✅ Fetch user's posted jobs (for companies)
  const fetchUserJobs = async (userToken) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/jobs/my-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.jobs) {
        // Store user's jobs in state if needed
        console.log('User jobs:', data.jobs);
      }
    } catch (error) {
      console.error('Error fetching user jobs:', error);
    }
  };

  // ✅ Fetch company applications (for companies)
  const fetchCompanyApplications = async (userToken) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/applications/for-my-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.applications) {
        setCompanyApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching company applications:', error);
    }
  };

  // ✅ Fetch notifications from backend
  const fetchNotifications = async (userToken) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/notifications`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      if (!res.ok) {
        // Gracefully handle missing route or unauthorized without spamming errors
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

  // ✅ Fetch messages (inbox + sent) from backend
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

  // ✅ Send a message to a user (used by CompanyDashboard)
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

  // ✅ Fetch initial data
  const fetchInitialData = async (userToken) => {
    try {
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
      
      // Use backend jobs only; display all jobs
      setDisplayedJobs(backendJobsData);
      
      setTimeout(() => {
        setIsLoading(false);
        setSystemReady(true);
        showNotification(`Welcome back, ${user?.name || 'User'}!`, 'success');
      }, 1000);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setDisplayedJobs([]);
      setIsLoading(false);
      setSystemReady(true);
    }
  };

  // ✅ Check for existing token and load data on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // ✅ Safe update of user profile
      setUserProfile(prev => ({
        ...prev,
        name: userData?.name || "",
        email: userData?.email || "",
        userType: userData?.userType || "jobSeeker",
        // FIXED: Handle nested profile data safely
        ...(userData.personalInfo || {}),
        ...(userData.professionalInfo || {})
      }));
      
      // Fetch jobs and user data
      fetchInitialData(storedToken);
    } else {
      // Load jobs for guests as well
      (async () => {
        const data = await fetchJobsFromBackend();
        setDisplayedJobs(data);
        setIsLoading(false);
        setSystemReady(true);
        showNotification('Welcome to Mission Hub! Browse jobs and log in to apply.', 'info');
      })();
    }
  }, []);

  // ✅ System Loader Effect
  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setSystemReady(true);
        showNotification('System loaded successfully! Welcome to Mission Hub.', 'success');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [token]);

  // Disable advertiser notifications
  useEffect(() => {
    return () => {
      if (adNotificationTimer) {
        clearInterval(adNotificationTimer);
      }
    };
  }, [adNotificationTimer]);

  // ✅ Handle user typing to prevent loader
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

  // ✅ Start advertiser notifications
  const startAdvertiserNotifications = () => {
    const showAdNotification = () => {
      const adNotifications = [
        {
          id: Date.now(),
          title: "🚀 Premium Feature Available!",
          message: "Upgrade to Premium for unlimited job applications and AI-powered resume analysis!",
          type: "premium",
          action: "Upgrade Now",
          duration: 6000
        },
        {
          id: Date.now() + 1,
          title: "📈 Boost Your Profile Visibility",
          message: "Get 3x more profile views by completing your skills assessment!",
          type: "profile",
          action: "Take Assessment",
          duration: 6000
        }
      ];

      const randomAd = adNotifications[Math.floor(Math.random() * adNotifications.length)];
      setAdvertiserNotification(randomAd);

      setTimeout(() => {
        setAdvertiserNotification(null);
      }, randomAd.duration);
    };

    const timer = setTimeout(() => {
      showAdNotification();
      
      const interval = setInterval(showAdNotification, 180000);
      setAdNotificationTimer(interval);
    }, 120000);

    return () => {
      clearTimeout(timer);
      if (adNotificationTimer) {
        clearInterval(adNotificationTimer);
      }
    };
  };

  // ✅ Close advertiser notification
  const closeAdvertiserNotification = () => {
    setAdvertiserNotification(null);
  };

  // ✅ ENHANCED: Apply for job with comprehensive backend integration
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
      // Run AI analysis before applying if enabled
      if (userSettings.aiMatching) {
        const matchResult = aiMatcher.calculateMatch(userProfile, job);
        const gaps = aiMatcher.analyzeProfileGaps(userProfile, job);
        
        setJobMatches(prev => ({
          ...prev,
          [jobId]: matchResult
        }));

        // No local notifications
      }

      // Submit application to backend
      const response = await fetch(`${getApiBaseUrl()}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId,
          jobTitle: job.title,
          company: job.company,
          coverLetter: applicationData.coverLetter || '',
          resume: userProfile.resume,
          answers: applicationData.answers || [],
          ...applicationData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newAppliedJobs = new Set(appliedJobs);
        newAppliedJobs.add(jobId);
        setAppliedJobs(newAppliedJobs);
        
        showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success');
        
        // Refresh applications list
        fetchUserApplications(token);
      } else {
        showNotification(data.message || 'Failed to submit application', 'error');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showNotification('Network error. Please try again.', 'error');
    }
  };

  // ✅ FIXED: Enhanced filtered jobs with AI scoring and safe access (backend only)
  const filteredJobs = useMemo(() => {
    // Use backend jobs only
    const jobsToFilter = backendJobs;
    
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

    // Apply AI matching if enabled
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

  // ✅ Load more jobs function
  const loadMoreJobs = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Show all jobs: no-op
    setDisplayedJobs(filteredJobs);
    setIsLoading(false);
  };

  // ✅ Reset pagination when filters change
  useEffect(() => {
    if (isUserTyping) return;
    
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDisplayedJobs(filteredJobs);
      setCurrentPageIndex(1);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filteredJobs, jobsPerPage, isUserTyping]);

  // ✅ Check if there are more jobs to load
  const hasMoreJobs = false;
  const totalPages = 1;

  // ✅ Auto-analyze profile when it changes
  useEffect(() => {
    if (user && userSettings.aiMatching) {
      analyzeProfileForImprovements();
    }
  }, [userProfile, userSettings.aiMatching, user]);

  const analyzeProfileForImprovements = () => {
    const allJobs = filteredJobs.slice(0, 10);
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

    if (averageScore < 60 && improvementAreas.size > 0) {
      const improvementNotification = {
        id: Date.now(),
        title: "📈 Profile Improvement Needed",
        message: `Your profile has an average ${averageScore}% match with jobs. Consider working on: ${Array.from(improvementAreas).slice(0, 2).join(', ')}`,
        read: false,
        date: "Just now",
        type: "profile_improvement",
        priority: "medium"
      };
      setNotifications(prev => [improvementNotification, ...prev]);
    }
  };

  // ✅ Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

  // ✅ Toggle bookmark function
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

  // ✅ Toggle comparison function
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

  // ✅ Toggle voice search function
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

  // ✅ Send chat message function
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const userMessage = {
      id: chatMessages.length + 1,
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
      status: 'sent'
    };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setAiThinking(true);
    setTimeout(() => {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 500);
    setTimeout(() => {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 1000);
    setTimeout(() => {
      const responses = [
        "I found several positions matching your criteria. Would you like me to show you the top matches?",
        "Based on your profile, I recommend focusing on senior-level positions in technology.",
        "I can help you refine your search. What specific skills are you looking to use?",
        "Great! I've updated your job preferences. Let me find the perfect matches for you."
      ];
      const aiResponse = {
        id: chatMessages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
        status: 'delivered'
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setAiThinking(false);
    }, 2000);
  };

  // ✅ ENHANCED: Login handler with proper backend integration and safe access
  const handleLogin = async (loginData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store token based on remember me preference
        if (loginData.rememberMe) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        
        setUser(data.user);
        setToken(data.token);
        
        // ✅ Safe profile update with backend data
        setUserProfile(prev => ({
          ...prev,
          // FIXED: Handle nested profile data safely
          ...(data.user.personalInfo || {}),
          ...(data.user.professionalInfo || {}),
          name: data.user?.name || "",
          email: data.user?.email || "",
          userType: data.user?.userType || "jobSeeker"
        }));
        
        setLoginOpen(false);
        showNotification('Successfully logged in!', 'success');
        
        // Fetch user's jobs and applications
        fetchUserJobs(data.token);
        fetchUserApplications(data.token);
        
        // Fetch company applications if user is a company
        if (data.user.userType === 'company') {
          fetchCompanyApplications(data.token);
        }
        
        const newNotification = {
          id: Date.now(),
          title: "Welcome back!",
          message: "You have 3 new job matches and 2 unread messages.",
          read: false,
          date: "Just now",
          type: "message"
        };
        setNotifications(prev => [newNotification, ...prev]);
      } else {
        // Better guidance on common 401: unverified email
        const msg = data?.message || data?.error || 'Login failed';
        if (response.status === 401 && /verify/i.test(msg)) {
          showNotification('Please verify your email. We sent a 6-digit code during registration (check backend console in dev).', 'warning');
          // Optionally, open register modal to surface verification UI
          setRegisterOpen(true);
        } else {
          showNotification(msg, 'error');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Network error. Please check if the backend server is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENHANCED: Register handler with proper backend integration
  const handleRegister = async (registerData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          userType: registerData.userType || 'jobSeeker',
          personalInfo: {
            location: registerData.location || "",
            phone: registerData.phone || ""
          },
          professionalInfo: {
            title: registerData.title || "",
            industry: registerData.industry || "",
            experience: registerData.experience || "",
            educationLevel: registerData.educationLevel || null // FIXED: Use null instead of empty string
          }
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showNotification('Registration successful! Please check your email for verification.', 'success');
        
        // Auto-login if autoLogin is enabled
        if (registerData.autoLogin) {
          handleLogin({
            email: registerData.email,
            password: registerData.password,
            rememberMe: true
          });
        }
        
        setRegisterOpen(false);
        
      } else {
        showNotification(data.message || data.error || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Network error. Please check if the backend server is running.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle post job click
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

  // ✅ Handle image upload
  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Persist as base64 data URL so backend can store it in Mongo
      handleNewJobChange('image', reader.result);
      showNotification('Image uploaded successfully!', 'success');
    };
    reader.onerror = () => {
      showNotification('Failed to read image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // ✅ ENHANCED: Logout handler with backend integration
  const handleLogout = async () => {
    try {
      // Call logout endpoint if available
      if (token) {
        await fetch(`${getApiBaseUrl()}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      setUser(null);
      setToken(null);
      setProfileDropdownOpen(false);
      showNotification('You have been logged out', 'info');
      
      // Clear advertiser notifications on logout
      if (adNotificationTimer) {
        clearInterval(adNotificationTimer);
        setAdNotificationTimer(null);
      }
      setAdvertiserNotification(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if backend call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setProfileDropdownOpen(false);
      showNotification('You have been logged out', 'info');
    }
  };

  // ✅ Change theme function
  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    showNotification(`Theme changed to ${theme}`, 'info');
  };

  // ✅ Clear all filters function
  const clearAllFilters = () => {
    setActiveFilters({
      category: 'all',
      type: '',
      experience: '',
      salary: 50000,
      location: '',
      remote: false
    });
    setSearchQuery('');
    setLocationQuery('');
    setActiveCategory('all');
    showNotification('All filters cleared', 'info');
  };

  // ✅ Handle navigation function
  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setExpandedJobId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Handle AI assistant function
  const handleAIAssistant = () => {
    setAiAssistantThinking(true);
    setTimeout(() => {
      setAiAssistantThinking(false);
      showNotification('AI Assistant: Based on your profile, I found 3 new job matches!', 'success');
      setJobAlertBannerOpen(true);
      setTimeout(() => setJobAlertBannerOpen(false), 5000);
    }, 2000);
  };

  // ✅ Toggle job details function
  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  // ✅ Handle filter change function
  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // ✅ Handle category filter function
  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
    setExpandedJobId(null);
    showNotification(`Filtering by ${categories.find(c => c.id === categoryId)?.name || 'category'}`, 'info');
  };

  // ✅ Handle new job change function
  const handleNewJobChange = (field, value) => {
    setNewJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ ENHANCED: Handle post job function with backend integration
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
          applicationUrl: newJob.applicationUrl,
          image: newJob.image || '',
          skills: newJob.skills || [],
          salaryMin: newJob.salaryMin || 0,
          salaryMax: newJob.salaryMax || 0
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add the new job to local state
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
          image: newJob.image || '',
          companyLogo: newJob.company.substring(0, 2).toUpperCase(),
          matchScore: 0,
          applicants: 0,
          companySize: "Unknown",
          workCulture: "To be determined",
          featured: false,
          image: themes[newJob.category] || themes.office,
          posted: "Just now",
          skills: newJob.skills || [],
          salaryMin: newJob.salaryMin || 0,
          salaryMax: newJob.salaryMax || 0
        };
        
        // Add to beginning of backend jobs array
        setBackendJobs(prev => [jobToAdd, ...prev]);
        
        // Reset form
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
        
        const newNotification = {
          id: Date.now(),
          title: "New job posted",
          message: `Your job listing for ${jobToAdd.title} is now live.`,
          read: false,
          date: "Just now",
          type: "job"
        };
        setNotifications(prev => [newNotification, ...prev]);
      } else {
        showNotification(data.message || 'Failed to post job', 'error');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      showNotification('Network error. Please try again.', 'error');
    }
  };

  // ✅ Handle file upload function
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please upload a PDF or Word document', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error');
      return;
    }
    setUploadedFile(file);
    showNotification('File uploaded successfully', 'success');
  };

  // ✅ Handle add document function
  const handleAddDocument = (documentData) => {
    setUserDocuments(prev => [...prev, documentData]);
    showNotification('Document added successfully', 'success');
  };

  // ✅ Handle toggle document share function
  const handleToggleDocumentShare = (docId) => {
    setUserDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, shared: !doc.shared } : doc
      )
    );
    showNotification('Document sharing status updated', 'success');
  };

  // ✅ Handle delete document function
  const handleDeleteDocument = (docId) => {
    setUserDocuments(prev => prev.filter(doc => doc.id !== docId));
    showNotification('Document deleted', 'info');
  };

  // ✅ Handle preview document function
  const handlePreviewDocument = (doc) => {
    setDocumentPreview(doc);
  };

  // ✅ Mark notification as read function
  const markNotificationAsRead = async (id) => {
    try {
      await fetch(`${getApiBaseUrl()}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  // ✅ Mark all notifications as read function
  const markAllNotificationsAsRead = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showNotification('All notifications marked as read', 'success');
    } catch (e) {
      console.error('Error marking all notifications read:', e);
    }
  };

  // ✅ Delete notification function
  const deleteNotification = async (id) => {
    try {
      await fetch(`${getApiBaseUrl()}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
      showNotification('Notification deleted', 'info');
    } catch (e) {
      console.error('Error deleting notification:', e);
    }
  };

  // ✅ Mark message as read function
  const markMessageAsRead = async (id) => {
    try {
      await fetch(`${getApiBaseUrl()}/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => (m._id === id || m.id === id) ? { ...m, read: true } : m));
    } catch (e) {
      console.error('Error marking message read:', e);
    }
  };

  // ✅ Delete message function
  const deleteMessage = (id) => {
    // No backend delete route yet; just remove locally
    setMessages(prev => prev.filter(m => (m._id || m.id) !== id));
    if (selectedMessage && (selectedMessage._id === id || selectedMessage.id === id)) {
      setSelectedMessage(null);
    }
    showNotification('Message deleted', 'info');
  };

  // ✅ Send message reply function
  const sendMessageReply = async () => {
    if (!messageReply.trim() || !selectedMessage) return;
    try {
      const toUserId = selectedMessage.fromUserId?._id || selectedMessage.fromUserId || selectedMessage.toUserId?._id || selectedMessage.toUserId;
      const jobId = selectedMessage.jobId?._id || selectedMessage.jobId;
      const applicationId = selectedMessage.applicationId?._id || selectedMessage.applicationId;
      const res = await fetch(`${getApiBaseUrl()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId, jobId, applicationId, body: messageReply, subject: selectedMessage.subject || '' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Reply sent successfully', 'success');
        setMessageReply('');
        // Refresh inbox quickly
        fetchMessages(token);
        fetchNotifications(token);
      } else {
        showNotification(data.message || 'Failed to send reply', 'error');
      }
    } catch (e) {
      console.error('Error sending reply:', e);
      showNotification('Network error while sending reply', 'error');
    }
  };

  // ✅ ENHANCED: Update profile function with backend integration
  const updateProfile = async (field, value) => {
    try {
      // FIXED: Handle nested fields properly
      let updateData = {};
      
      if (field.includes('.')) {
        // Handle nested fields like "personalInfo.phone"
        const [parent, child] = field.split('.');
        updateData[parent] = { [child]: value };
      } else if (field === 'fullProfile') {
        // Handle full profile update
        updateData = value;
      } else {
        // Handle top-level fields
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
        // Update local state
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
        
        // Update user in storage
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        
        if (localStorage.getItem('token')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        // Trigger AI analysis when important profile fields change
        if (['skills', 'experience', 'educationLevel', 'location'].includes(field)) {
          setTimeout(() => analyzeProfileForImprovements(), 500);
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

  // ✅ Update settings function
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

  // ✅ Scroll progress effect
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

  // ✅ Scroll to chat end effect
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

  // ✅ Initial notifications effect
  useEffect(() => {
    setTimeout(() => {
      showNotification('Welcome to Mission Hub! Personalized job matches are ready.', 'success');
    }, 1000);
    setTimeout(() => {
      setJobAlertBannerOpen(true);
      setTimeout(() => setJobAlertBannerOpen(false), 8000);
    }, 5000);
  }, []);

  // ✅ Format timestamp function
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

  // ✅ System Loader Component
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

  // ✅ Loader Component for content loading
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

  // ✅ Advertiser Notification Component
  const AdvertiserNotification = ({ notification, onClose }) => {
    if (!notification) return null;

    const getNotificationStyles = () => {
      switch (notification.type) {
        case 'premium':
          return 'bg-gray-900 text-white shadow-xl border border-gray-700';
        case 'profile':
          return 'bg-gray-800 text-white shadow-xl border border-gray-600';
        case 'jobs':
          return 'bg-gray-900 text-white shadow-xl border border-gray-700';
        case 'tools':
          return 'bg-gray-800 text-white shadow-xl border border-gray-600';
        default:
          return 'bg-gray-900 text-white shadow-xl border border-gray-700';
      }
    };

    return (
      <div className={`fixed top-24 right-6 p-4 rounded-lg z-40 max-w-sm animate-slideInRight ${getNotificationStyles()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-3">
            <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
            <p className="text-xs opacity-90 mb-2 leading-relaxed">{notification.message}</p>
            <button 
              onClick={() => {
                showNotification(`Navigating to ${notification.action}...`, 'info');
                onClose();
              }}
              className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-xs font-medium hover:bg-opacity-30 transition-all border border-white border-opacity-30 hover:scale-105 transform duration-200"
            >
              {notification.action}
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors flex-shrink-0 hover:scale-110 transform duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mt-2">
          <div 
            className="h-1 bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  // ✅ Page rendering function
  const renderPage = () => {
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
                {searchSuggestionsOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-full md:w-3/4 max-w-4xl bg-white rounded-xl shadow-xl p-4 z-20">
                    <p className="text-gray-500 text-sm font-medium mb-2">Popular Searches:</p>
                    <div className="flex flex-wrap gap-3">
                      {['React Developer', 'Data Scientist', 'Project Manager', 'Remote UX'].map(suggestion => (
                        <button 
                          key={suggestion}
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {jobAlertBannerOpen && (
              <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-4 rounded-xl shadow-xl flex items-center justify-between z-40 animate-slideUp">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span className="font-medium">Hot Alert!</span>
                  <span>You have **{jobAlerts.filter(a => a.new).length}** new high-match mission opportunities waiting!</span>
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
              <div className="mb-10 p-4 bg-gray-50 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Browse by Category</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md w-32 ${
                        activeCategory === category.id 
                          ? 'bg-gray-900 text-white shadow-gray-300/50' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {React.cloneElement(category.icon, { className: `w-6 h-6 mb-2 ${activeCategory === category.id ? 'text-white' : 'text-gray-900'}` })}
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className="text-xs mt-1 opacity-75">{category.count} missions</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isUserTyping ? 'Typing...' : isLoading ? 'Loading...' : `${displayedJobs.length} of ${filteredJobs.length} mission Found`}
                </h2>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="relative">
                    <button onClick={() => showNotification('Advanced filter modal opened', 'info')} className="flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200">
                      <Filter className="w-5 h-5 mr-2" />
                      Advanced Filters
                      {activeFilters.type || activeFilters.experience || activeFilters.salary > 50000 || activeFilters.remote ? (
                        <span className="ml-2 w-2 h-2 bg-gray-900 rounded-full"></span>
                      ) : null}
                    </button>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm hover:bg-gray-200"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" /> Clear
                  </button>
                  <div className="flex space-x-2 p-1 bg-gray-100 rounded-full">
                    <button
                      onClick={() => setCurrentView('grid')}
                      className={`p-2 rounded-full transition-colors ${currentView === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentView('list')}
                      className={`p-2 rounded-full transition-colors ${currentView === 'list' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Jobs Grid with Loader */}
              {isLoading && !isUserTyping && displayedJobs.length === 0 ? (
                <Loader />
              ) : (
                <>
                  <div className={`grid gap-8 ${currentView === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
                    {displayedJobs.length > 0 ? (
                      displayedJobs.map(job => (
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
                          aiMatchScore={job.aiMatchScore}
                          isGoodMatch={job.isGoodMatch}
                          isExcellentMatch={job.isExcellentMatch}
                        />
                      ))
                    ) : (
                      !isUserTyping && (
                        <div className="col-span-full text-center p-12 bg-gray-50 rounded-xl shadow-sm">
                          <EyeOffIcon className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900">No mission Match Your Filters</h3>
                          <p className="text-gray-600">Try adjusting your search query, location, or clearing some filters.</p>
                          <button 
                            onClick={clearAllFilters}
                            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
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
                      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {displayedJobs.length} mission Loaded
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {filteredJobs.length - displayedJobs.length} more amazing opportunities waiting for you!
                        </p>
                        <button
                          onClick={loadMoreJobs}
                          disabled={isLoading}
                          className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center mx-auto space-x-3"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading More mission...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span>Load More Jobs</span>
                              <ChevronDown className="w-5 h-5" />
                            </>
                          )}
                        </button>
                        <div className="mt-4 flex justify-center items-center space-x-4 text-sm text-gray-500">
                          <span>Page {currentPageIndex} of {totalPages}</span>
                          <span>•</span>
                          <span>{jobsPerPage} jobs per load</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Jobs Loaded Message */}
                  {!hasMoreJobs && displayedJobs.length > 0 && !isUserTyping && (
                    <div className="mt-12 text-center">
                      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                        <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All mission Loaded!</h3>
                        <p className="text-gray-600">
                          You've seen all {displayedJobs.length} jobs matching your criteria. 
                          {displayedJobs.length > 10 && " Try adjusting your filters to see more opportunities."}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <AboutSection 
                aboutStats={aboutStats}
                testimonials={testimonials}
                StatCard={StatCard}
                TestimonialCard={TestimonialCard}
              />
            </div>
          </>
        );
      case 'company-dashboard':
        return (
          <CompanyDashboard
            user={user}
            showNotification={showNotification}
            jobs={backendJobs}
            setJobs={setBackendJobs}
            applications={companyApplications}
            onSendMessage={sendMessageToUser}
          />
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
                  Start Browsing missions
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
            <AboutSection 
              aboutStats={aboutStats}
              testimonials={testimonials}
              StatCard={StatCard}
              TestimonialCard={TestimonialCard}
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
    <div className="min-h-screen bg-white text-gray-900">
      {/* System Loader */}
      {isLoading && <SystemLoader />}
      
      {/* Main App Content */}
      {!isLoading && (
        <>
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
          
          <main className="min-h-[70vh]">
            {renderPage()}
          </main>
          
          <Footer />

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
            handleFileUpload={handleFileUpload}
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

          <ChatAssistant 
            chatOpen={chatOpen}
            setChatOpen={setChatOpen}
            chatMessages={chatMessages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            aiThinking={aiThinking}
            chatEndRef={chatEndRef}
            formatTimestamp={formatTimestamp}
          />

          <ProfilePanel 
            profilePanelOpen={profilePanelOpen}
            setProfilePanelOpen={setProfilePanelOpen}
            userProfile={userProfile}
            updateProfile={updateProfile}
            appliedJobs={appliedJobs}
            jobs={backendJobs}
            showNotification={showNotification}
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
            // Add these required props that were missing
            userId={user?._id || user?.id}
            token={token}
            userType={user?.userType || 'jobSeeker'}
          />

          {/* Company Applications Panel (simple inline list) */}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'accepted' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{app.status}</span>
                        <button
                          onClick={() => sendMessageToUser({
                            toUserId: app.userId?._id || app.userId,
                            jobId: app.jobId?._id || app.jobId,
                            applicationId: app._id || app.id,
                            subject: `Regarding your application for ${app.jobTitle}`,
                            body: `Hello ${app.applicantName},\n\nThank you for applying for ${app.jobTitle}. We'd like to follow up regarding your application.`
                          })}
                          className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                        >
                          Message Applicant
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Adverse Advertisement Component */}
          <Adverse user={user} showNotification={showNotification} />

          {/* Advertiser Notification */}
          <AdvertiserNotification 
            notification={advertiserNotification}
            onClose={closeAdvertiserNotification}
          />

          {/* AI Analysis Banner */}
          {profileAnalysis && profileAnalysis.averageMatchScore < 70 && userSettings.aiMatching && (
            <div className="fixed bottom-4 right-224 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-lg z-40 max-w-sm">
              <div className="flex items-start space-x-3">
                <Brain className="w-6 h-6 text-gray-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Profile Improvement Tips</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Your profile matches {profileAnalysis.averageMatchScore}% of jobs. 
                    {profileAnalysis.improvementAreas.slice(0, 1).map(area => (
                      <span key={area}> Consider: {area}</span>
                    ))}
                  </p>
                  <button 
                    onClick={() => setProfilePanelOpen(true)}
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium mt-2"
                  >
                    Improve Profile →
                  </button>
                </div>
              </div>
            </div>
          )}

          {notification && (
            <div 
              key={notification.id}
              className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-xl z-50 text-white font-medium transition-all duration-500 ease-out animate-toastIn ${
                notification.type === 'success' ? 'bg-gray-900' :
                notification.type === 'info' ? 'bg-gray-800' :
                notification.type === 'warning' ? 'bg-gray-700' : 'bg-gray-900'
              }`}
            >
              {notification.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;