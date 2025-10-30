// src/App.jsx
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
import jobs from './components/content';
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

  // Calculate match score between user profile and job
  calculateMatch(userProfile, job) {
    let score = 0;
    let maxPossibleScore = 100;
    let breakdown = [];

    // Skills matching (40% of total score)
    const skillsScore = this.calculateSkillsMatch(userProfile.skills, job.skills || []);
    score += skillsScore * 0.4;
    breakdown.push({ category: 'Skills', score: skillsScore, weight: 40 });

    // Experience matching (25% of total score)
    const experienceScore = this.calculateExperienceMatch(userProfile.experience, job.experience);
    score += experienceScore * 0.25;
    breakdown.push({ category: 'Experience', score: experienceScore, weight: 25 });

    // Education matching (15% of total score)
    const educationScore = this.calculateEducationMatch(userProfile.education, job.education);
    score += educationScore * 0.15;
    breakdown.push({ category: 'Education', score: educationScore, weight: 15 });

    // Location matching (10% of total score)
    const locationScore = this.calculateLocationMatch(userProfile.location, job.location);
    score += locationScore * 0.1;
    breakdown.push({ category: 'Location', score: locationScore, weight: 10 });

    // Job type matching (10% of total score)
    const typeScore = this.calculateTypeMatch(userProfile.preferredJobType, job.type);
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
    
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
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

  calculateEducationMatch(userEducation, jobEducation) {
    if (!jobEducation) return 80;
    
    const userEdLevel = this.getEducationLevel(userEducation);
    const jobEdLevel = this.getEducationLevel(jobEducation);
    
    return userEdLevel >= jobEdLevel ? 100 : 60;
  }

  getEducationLevel(education) {
    if (!education) return 0;
    
    const lowerEd = education.toLowerCase();
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

  // Analyze profile gaps for a specific job
  analyzeProfileGaps(userProfile, job) {
    const gaps = [];
    
    // Check missing skills
    if (job.skills && job.skills.length > 0) {
      const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
      const missingSkills = job.skills.filter(skill => 
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
    const userLevel = this.experienceLevels[userProfile.experience?.toLowerCase()] || 1;
    const jobLevel = this.experienceLevels[job.experience?.toLowerCase()] || 1;
    
    if (userLevel < jobLevel) {
      gaps.push({
        type: 'experience',
        message: `This role requires ${job.experience} level experience (you have ${userProfile.experience})`,
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
    salary: 50000,
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
  
  // NEW STATES: Loader and Advertiser Notifications
  const [isLoading, setIsLoading] = useState(true);
  const [systemReady, setSystemReady] = useState(false);
  const [advertiserNotification, setAdvertiserNotification] = useState(null);
  const [adNotificationTimer, setAdNotificationTimer] = useState(null);
  
  // NEW: User typing state to prevent loader during typing
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);
  
  // Enhanced user profile with more detailed information for AI matching
  const [userProfile, setUserProfile] = useState({
    name: "dadyrene",
    email: "reneniyi@gmail.com",
    phone: "+1 (555) 123-4567",
    location: "kigali",
    bio: "Experienced software engineer with a passion for creating user-friendly applications.",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"],
    experience: "5+ years",
    experienceLevel: "senior",
    education: "Bachelor's in Computer Science",
    educationLevel: "bachelor",
    preferredJobType: "full-time",
    preferredLocation: "remote",
    salaryExpectation: 90000,
    resume: null,
    linkedin: "",
    github: "",
    portfolio: "",
    certifications: ["AWS Certified Developer"],
    languages: ["English", "French"],
    availability: "immediate"
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New job match", message: "Senior React Developer at TechCorp matches your profile", read: false, date: "2 hours ago", type: "job" },
    { id: 2, title: "Application viewed", message: "Your application for Frontend Developer was viewed", read: false, date: "1 day ago", type: "application" },
    { id: 3, title: "Profile incomplete", message: "Complete your profile to get better job matches", read: true, date: "3 days ago", type: "profile" },
    { id: 4, title: "New message", message: "You have a new message from TechCorp recruiter", read: false, date: "1 week ago", type: "message" }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: "TechCorp Recruiter", subject: "Interview Invitation", preview: "We'd like to invite you for an interview...", date: "2 days ago", read: false },
    { id: 2, sender: "StartupXYZ", subject: "Application Status", preview: "Thank you for your application. We've reviewed...", date: "1 week ago", read: true },
    { id: 3, sender: "DesignCo", subject: "Job Opportunity", preview: "We saw your profile and think you'd be a great fit...", date: "2 weeks ago", read: true }
  ]);

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
    aiMatching: true // New setting for AI matching
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
    { id: 1, name: 'Resume_John_Doe.pdf', type: 'resume', size: '245 KB', uploadDate: '2023-05-15', shared: false },
    { id: 2, name: 'Cover_Letter_TechCorp.pdf', type: 'cover-letter', size: '125 KB', uploadDate: '2023-05-18', shared: true },
    { id: 3, name: 'Portfolio_Projects.pdf', type: 'portfolio', size: '3.2 MB', uploadDate: '2023-05-20', shared: false }
  ]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  // Loader and Pagination States
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(6);
  const [displayedJobs, setDisplayedJobs] = useState([]);

  const categories = [
    { id: 'all', name: 'All Jobs', icon: <Briefcase className="w-4 h-4" />, count: jobs.length },
    { id: 'technology', name: 'Technology', icon: <Code className="w-4 h-4" />, count: jobs.filter(j => j.category === 'technology').length },
    { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="w-4 h-4" />, count: jobs.filter(j => j.category === 'marketing').length },
    { id: 'finance', name: 'Finance', icon: <DollarSign className="w-4 h-4" />, count: jobs.filter(j => j.category === 'finance').length },
    { id: 'healthcare', name: 'Healthcare', icon: <Stethoscope className="w-4 h-4" />, count: jobs.filter(j => j.category === 'healthcare').length }
  ];

  const themes = {
    office: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2084&q=80',
    tech: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    meeting: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    workspace: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
    business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    interview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2088&q=80'
  };

  // NEW: System Loader Effect - Reduced to 2 seconds for better UX
  useEffect(() => {
    // Simulate system loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      setSystemReady(true);
      showNotification('System loaded successfully! Welcome to Easy Recruitz.', 'success');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // NEW: Advertiser Notification System
  useEffect(() => {
    // Clear any existing timer
    if (adNotificationTimer) {
      clearTimeout(adNotificationTimer);
    }

    // Start advertiser notifications when system is ready and user is logged in
    if (systemReady && user) {
      startAdvertiserNotifications();
    }

    return () => {
      if (adNotificationTimer) {
        clearInterval(adNotificationTimer);
      }
    };
  }, [systemReady, user]);

  // NEW: Handle user typing to prevent loader
  const handleUserTyping = (field, value) => {
    setIsUserTyping(true);
    
    // Clear existing timer
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    // Set new timer to mark typing as finished after 1 second of inactivity
    const timer = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
    
    setTypingTimer(timer);
    
    // Update the search query
    if (field === 'search') {
      setSearchQuery(value);
    } else if (field === 'location') {
      setLocationQuery(value);
    }
  };

  // NEW: Start advertiser notifications
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
        },
        {
          id: Date.now() + 2,
          title: "💼 Exclusive Job Opportunities",
          message: "Premium members get early access to top remote positions!",
          type: "jobs",
          action: "View Jobs",
          duration: 6000
        },
        {
          id: Date.now() + 3,
          title: "🎯 AI Resume Builder",
          message: "Let our AI optimize your resume for specific job applications!",
          type: "tools",
          action: "Try Now",
          duration: 6000
        }
      ];

      const randomAd = adNotifications[Math.floor(Math.random() * adNotifications.length)];
      setAdvertiserNotification(randomAd);

      // Auto-hide after duration
      setTimeout(() => {
        setAdvertiserNotification(null);
      }, randomAd.duration);
    };

    // Show first notification after 2 minutes (120000 ms)
    const timer = setTimeout(() => {
      showAdNotification();
      
      // Set interval for subsequent notifications every 3 minutes (180000 ms)
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

  // NEW: Close advertiser notification
  const closeAdvertiserNotification = () => {
    setAdvertiserNotification(null);
  };

  // Enhanced applyForJob function with AI analysis
  const applyForJob = (jobId) => {
    if (!user) {
      showNotification('Please log in to apply for a job.', 'warning');
      setLoginOpen(true);
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    
    // Run AI analysis before applying if enabled
    if (userSettings.aiMatching) {
      const matchResult = aiMatcher.calculateMatch(userProfile, job);
      const gaps = aiMatcher.analyzeProfileGaps(userProfile, job);
      
      // Store the match analysis
      setJobMatches(prev => ({
        ...prev,
        [jobId]: matchResult
      }));

      // Send notification based on match score
      if (matchResult.overallScore >= 70) {
        const matchNotification = {
          id: Date.now(),
          title: "🎯 Great Job Match!",
          message: `Your profile has a ${matchResult.overallScore}% match with ${job.title} at ${job.company}. You meet most requirements!`,
          read: false,
          date: "Just now",
          type: "ai_match",
          priority: "high",
          jobDetails: {
            title: job.title,
            company: job.company,
            location: job.location,
            matchScore: matchResult.overallScore,
            status: "high_match"
          },
          actions: [
            { label: 'View Analysis', handler: () => showMatchAnalysis(jobId, matchResult), primary: true },
            { label: 'Apply Now', handler: () => completeApplication(jobId), primary: false }
          ]
        };
        setNotifications(prev => [matchNotification, ...prev]);
      } else {
        const lowMatchNotification = {
          id: Date.now(),
          title: "⚠️ Profile Gap Detected",
          message: `Your profile has a ${matchResult.overallScore}% match with ${job.title}. Consider skill development.`,
          read: false,
          date: "Just now",
          type: "ai_analysis",
          priority: "medium",
          jobDetails: {
            title: job.title,
            company: job.company,
            location: job.location,
            matchScore: matchResult.overallScore,
            status: "needs_improvement"
          },
          actions: [
            { label: 'View Gaps', handler: () => showProfileGaps(jobId, gaps), primary: true },
            { label: 'Apply Anyway', handler: () => completeApplication(jobId), primary: false }
          ]
        };
        setNotifications(prev => [lowMatchNotification, ...prev]);
      }
    }

    completeApplication(jobId);
  };

  const completeApplication = (jobId) => {
    const newAppliedJobs = new Set(appliedJobs);
    newAppliedJobs.add(jobId);
    setAppliedJobs(newAppliedJobs);
    const job = jobs.find(j => j.id === jobId);
    
    showNotification(`Application submitted for ${job.title} at ${job.company}!`, 'success');
    
    const applicationNotification = {
      id: Date.now(),
      title: "Application submitted",
      message: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
      read: false,
      date: "Just now",
      type: "application"
    };
    setNotifications(prev => [applicationNotification, ...prev]);
  };

  const showMatchAnalysis = (jobId, matchResult) => {
    const job = jobs.find(j => j.id === jobId);
    setNotification({
      message: `🎯 Match Analysis for ${job.title}: ${matchResult.overallScore}% - ${matchResult.recommendation}`,
      type: 'info',
      id: Date.now()
    });
    
    console.log('Match Breakdown:', matchResult.breakdown);
  };

  const showProfileGaps = (jobId, gaps) => {
    const job = jobs.find(j => j.id === jobId);
    const gapMessages = gaps.map(gap => gap.message).join('; ');
    
    setNotification({
      message: `📊 Profile Gaps for ${job.title}: ${gapMessages}`,
      type: 'warning',
      id: Date.now()
    });
  };

  // Enhanced filtered jobs with AI scoring
  const filteredJobs = useMemo(() => {
    const baseFiltered = jobs.filter(job => {
      const matchesCategory = activeCategory === 'all' || job.category === activeCategory;
      const matchesType = !activeFilters.type || job.type === activeFilters.type;
      const matchesExperience = !activeFilters.experience || job.experience === activeFilters.experience;
      const matchesSalary = job.salaryMin >= activeFilters.salary;
      const allQuery = `${searchQuery} ${locationQuery}`.toLowerCase().trim();
      const matchesQuery = !allQuery || 
        job.title.toLowerCase().includes(allQuery) ||
        job.company.toLowerCase().includes(allQuery) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(allQuery))) ||
        job.location.toLowerCase().includes(locationQuery.toLowerCase().trim());
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
  }, [jobs, activeCategory, activeFilters, searchQuery, locationQuery, userSettings.aiMatching, user, userProfile]);

  // Load more jobs function
  const loadMoreJobs = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nextPage = currentPageIndex + 1;
    const startIndex = (nextPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    
    const newJobs = filteredJobs.slice(startIndex, endIndex);
    
    setDisplayedJobs(prev => [...prev, ...newJobs]);
    setCurrentPageIndex(nextPage);
    setIsLoading(false);
    
    showNotification(`Loaded ${newJobs.length} more jobs`, 'success');
  };

  // NEW: Reset pagination when filters change - only if user is not typing
  useEffect(() => {
    if (isUserTyping) return; // Don't reset while user is typing
    
    setIsLoading(true);
    const timer = setTimeout(() => {
      const initialJobs = filteredJobs.slice(0, jobsPerPage);
      setDisplayedJobs(initialJobs);
      setCurrentPageIndex(1);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filteredJobs, jobsPerPage, isUserTyping]); // Added isUserTyping dependency

  // Check if there are more jobs to load
  const hasMoreJobs = displayedJobs.length < filteredJobs.length;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Auto-analyze profile when it changes
  useEffect(() => {
    if (user && userSettings.aiMatching) {
      analyzeProfileForImprovements();
    }
  }, [userProfile, userSettings.aiMatching, user]);

  const analyzeProfileForImprovements = () => {
    const allJobs = jobs.slice(0, 10);
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

    // Send improvement notification if score is low
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 4000);
  };

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

  const toggleComparison = (job) => {
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

  const handleLogin = (loginData) => {
    setUser({
      name: loginData.name || 'John Doe',
      email: loginData.email,
      avatar: (loginData.name || 'John Doe').split(' ').map(n => n[0]).join(''),
      role: loginData.userType || 'jobSeeker'
    });
    setLoginOpen(false);
    showNotification('Successfully logged in!', 'success');
    const newNotification = {
      id: Date.now(),
      title: "Welcome back!",
      message: "You have 3 new job matches and 2 unread messages.",
      read: false,
      date: "Just now",
      type: "message"
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleRegister = (registerData, userType = 'jobSeeker') => {
    setUser({
      name: registerData.name,
      email: registerData.email,
      avatar: registerData.name.split(' ').map(n => n[0]).join(''),
      role: userType
    });
    
    setRegisterOpen(false);
    showNotification(`Account created successfully as ${userType === 'company' ? 'Company' : 'Job Seeker'}!`, 'success');
  };

  const handlePostJobClick = () => {
    if (!user) {
      showNotification('Please log in to post a job', 'warning');
      setLoginOpen(true);
    } else if (user.role !== 'company') {
      showNotification('Only company accounts can post jobs. Please create a company account.', 'warning');
    } else {
      setPostJobOpen(true);
    }
  };

  const handleImageUpload = (file) => {
    console.log('Uploading image:', file);
    showNotification('Image uploaded successfully!', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setProfileDropdownOpen(false);
    showNotification('You have been logged out', 'info');
    
    // Clear advertiser notifications on logout
    if (adNotificationTimer) {
      clearInterval(adNotificationTimer);
      setAdNotificationTimer(null);
    }
    setAdvertiserNotification(null);
  };

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    showNotification(`Theme changed to ${theme}`, 'info');
  };

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

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setExpandedJobId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIAssistant = () => {
    setAiAssistantThinking(true);
    setTimeout(() => {
      setAiAssistantThinking(false);
      showNotification('AI Assistant: Based on your profile, I found 3 new job matches!', 'success');
      setJobAlertBannerOpen(true);
      setTimeout(() => setJobAlertBannerOpen(false), 5000);
    }, 2000);
  };

  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleFilterChange = (filterName, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
    setExpandedJobId(null);
    showNotification(`Filtering by ${categories.find(c => c.id === categoryId).name}`, 'info');
  };

  const handleNewJobChange = (field, value) => {
    setNewJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.description) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    const jobToAdd = {
      id: jobs.length + 1,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      salary: newJob.salary,
      category: newJob.category,
      experience: newJob.experience,
      description: newJob.description,
      responsibilities: newJob.responsibilities.split('\n').filter(r => r.trim()),
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      benefits: newJob.benefits.split(',').map(b => b.trim()),
      remote: newJob.remote,
      urgent: newJob.urgent,
      companyLogo: newJob.company.substring(0, 2).toUpperCase(),
      matchScore: 0,
      applicants: 0,
      companySize: "Unknown",
      workCulture: "To be determined",
      featured: false,
      image: themes[newJob.category] || themes.office,
      posted: "Just now",
      skills: [],
      salaryMin: 0,
      salaryMax: 0
    };
    jobs.unshift(jobToAdd);
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
  };

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

  const handleAddDocument = (documentData) => {
    setUserDocuments(prev => [...prev, documentData]);
    showNotification('Document added successfully', 'success');
  };

  const handleToggleDocumentShare = (docId) => {
    setUserDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, shared: !doc.shared } : doc
      )
    );
    showNotification('Document sharing status updated', 'success');
  };

  const handleDeleteDocument = (docId) => {
    setUserDocuments(prev => prev.filter(doc => doc.id !== docId));
    showNotification('Document deleted', 'info');
  };

  const handlePreviewDocument = (doc) => {
    setDocumentPreview(doc);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    showNotification('All notifications marked as read', 'success');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showNotification('Notification deleted', 'info');
  };

  const markMessageAsRead = (id) => {
    setMessages(prev => 
      prev.map(m => m.id === id ? { ...m, read: true } : m)
    );
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
    showNotification('Message deleted', 'info');
  };

  const sendMessageReply = () => {
    if (!messageReply.trim() || !selectedMessage) return;
    showNotification('Reply sent successfully', 'success');
    setMessageReply('');
  };

  const updateProfile = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Trigger AI analysis when important profile fields change
    if (['skills', 'experience', 'education', 'location'].includes(field)) {
      setTimeout(() => analyzeProfileForImprovements(), 500);
    }
    
    showNotification('Profile updated', 'success');
  };

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOpen]);

  useEffect(() => {
    setTimeout(() => {
      showNotification('Welcome to Easy Recruitz! Personalized job matches are ready.', 'success');
    }, 1000);
    setTimeout(() => {
      setJobAlertBannerOpen(true);
      setTimeout(() => setJobAlertBannerOpen(false), 8000);
    }, 5000);
  }, []);

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

  // NEW: System Loader Component
  const SystemLoader = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Easy Recruitz</h2>
        <p className="text-gray-600 mb-8">Loading your career opportunities...</p>
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  // Loader Component for content loading
  const Loader = () => (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600 font-medium">Loading amazing job opportunities...</p>
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  // UPDATED: Advertiser Notification Component with strategic positioning
  const AdvertiserNotification = ({ notification, onClose }) => {
    if (!notification) return null;

    const getNotificationStyles = () => {
      switch (notification.type) {
        case 'premium':
          return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 border border-purple-300';
        case 'profile':
          return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl shadow-blue-500/30 border border-blue-300';
        case 'jobs':
          return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl shadow-green-500/30 border border-green-300';
        case 'tools':
          return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/30 border border-orange-300';
        default:
          return 'bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-2xl shadow-gray-500/30 border border-gray-400';
      }
    };

    return (
      <div className={`fixed top-24 right-6 p-4 rounded-xl z-40 max-w-sm animate-slideInRight ${getNotificationStyles()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-3">
            <h3 className="font-bold text-sm mb-1">{notification.title}</h3>
            <p className="text-xs opacity-90 mb-2 leading-relaxed">{notification.message}</p>
            <button 
              onClick={() => {
                showNotification(`Navigating to ${notification.action}...`, 'info');
                onClose();
              }}
              className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-xs font-semibold hover:bg-opacity-30 transition-all border border-white border-opacity-30 hover:scale-105 transform duration-200"
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
        {/* Progress bar */}
        <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mt-2">
          <div 
            className="h-1 bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  // Page rendering
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <div 
              className="relative py-24 bg-cover bg-center bg-fixed"
              style={{ backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9)), url(${themes[currentTheme]})` }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white relative z-10">
                <div className="text-center">
                  <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fadeIn">
                    Find Your <span className="text-white">Dream Mission & job</span>, Effortlessly
                  </h1>
                  <p className="text-xl mb-10 font-light">
                    AI-Powered Matches, Trusted by Top Companies.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row bg-white rounded-2xl p-3 shadow-2xl space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow bg-gray-50">
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
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow bg-gray-50">
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
                      className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        activeFilters.remote ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Cloud className="w-4 h-4 mr-1" /> Remote
                    </button>
                  </div>
                  <button
                    onClick={() => showNotification(`Searching for ${searchQuery || 'all jobs'} in ${locationQuery || 'all locations'}...`, 'info')}
                    className="md:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg transform hover:scale-105"
                  >
                    <Search className="w-5 h-5 inline mr-2" /> Search
                  </button>
                </div>
                {searchSuggestionsOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-full md:w-3/4 max-w-4xl bg-white rounded-xl shadow-2xl p-4 z-20">
                    <p className="text-gray-500 text-sm font-semibold mb-2">Popular Searches:</p>
                    <div className="flex flex-wrap gap-3">
                      {['React Developer', 'Data Scientist', 'Project Manager', 'Remote UX'].map(suggestion => (
                        <button 
                          key={suggestion}
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
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
              <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between z-40 animate-slideUp">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span className="font-semibold">Hot Alert!</span>
                  <span>You have **{jobAlerts.filter(a => a.new).length}** new high-match job opportunities waiting!</span>
                </div>
                <button 
                  onClick={() => setJobAlertBannerOpen(false)}
                  className="p-1 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 bg-white">
              <div className="mb-10 p-4 bg-blue-50 rounded-xl shadow-inner">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Browse by Category</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md w-32 ${
                        activeCategory === category.id 
                          ? 'bg-blue-600 text-white shadow-blue-300/50' 
                          : 'bg-white text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {React.cloneElement(category.icon, { className: `w-6 h-6 mb-2 ${activeCategory === category.id ? 'text-white' : 'text-blue-600'}` })}
                      <span className="font-semibold text-sm">{category.name}</span>
                      <span className="text-xs mt-1 opacity-75">{category.count} Jobs</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-white rounded-xl shadow border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900">
                  {/* UPDATED: Show typing indicator */}
                  {isUserTyping ? 'Typing...' : isLoading ? 'Loading...' : `${displayedJobs.length} of ${filteredJobs.length} Jobs Found`}
                </h2>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="relative">
                    <button onClick={() => showNotification('Advanced filter modal opened', 'info')} className="flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 hover:bg-blue-200">
                      <Filter className="w-5 h-5 mr-2" />
                      Advanced Filters
                      {activeFilters.type || activeFilters.experience || activeFilters.salary > 50000 || activeFilters.remote ? (
                        <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                      ) : null}
                    </button>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-red-100 rounded-full text-red-600 text-sm hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" /> Clear
                  </button>
                  <div className="flex space-x-2 p-1 bg-blue-100 rounded-full">
                    <button
                      onClick={() => setCurrentView('grid')}
                      className={`p-2 rounded-full transition-colors ${currentView === 'grid' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-200'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentView('list')}
                      className={`p-2 rounded-full transition-colors ${currentView === 'list' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-200'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* UPDATED: Jobs Grid with Loader - only show when not typing */}
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
                        <div className="col-span-full text-center p-12 bg-blue-50 rounded-xl shadow">
                          <EyeOffIcon className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900">No Jobs Match Your Filters</h3>
                          <p className="text-gray-600">Try adjusting your search query, location, or clearing some filters.</p>
                          <button 
                            onClick={clearAllFilters}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
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
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {displayedJobs.length} Jobs Loaded
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {filteredJobs.length - displayedJobs.length} more amazing opportunities waiting for you!
                        </p>
                        <button
                          onClick={loadMoreJobs}
                          disabled={isLoading}
                          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center mx-auto space-x-3"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Loading More Jobs...</span>
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
                      <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All Jobs Loaded!</h3>
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
      case 'bookmarks':
        const bookmarkedJobDetails = jobs.filter(job => bookmarkedJobs.has(job.id));
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
              <BookmarkCheck className="w-8 h-8 text-blue-600 mr-3" />
              My Bookmarked Jobs
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              A personalized list of jobs you're interested in. Never lose a great opportunity.
            </p>
            {bookmarkedJobDetails.length === 0 ? (
              <div className="text-center p-20 bg-white rounded-xl shadow-lg border border-blue-100">
                <Heart className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">No Bookmarks Yet!</h3>
                <p className="text-gray-600">Click the bookmark icon on a job card to save it for later.</p>
                <button 
                  onClick={() => handleNavigation('home')}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
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
            jobs={jobs}
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
          />

          {/* UPDATED: Adverse Advertisement Component with improved positioning */}
          <Adverse user={user} showNotification={showNotification} />

          {/* UPDATED: Advertiser Notification with strategic positioning */}
          <AdvertiserNotification 
            notification={advertiserNotification}
            onClose={closeAdvertiserNotification}
          />

          {/* AI Analysis Banner */}
          {profileAnalysis && profileAnalysis.averageMatchScore < 70 && userSettings.aiMatching && (
            <div className="fixed bottom-4 right-124 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-40 max-w-sm">
              <div className="flex items-start space-x-3">
                <Brain className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Profile Improvement Tips</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Your profile matches {profileAnalysis.averageMatchScore}% of jobs. 
                    {profileAnalysis.improvementAreas.slice(0, 1).map(area => (
                      <span key={area}> Consider: {area}</span>
                    ))}
                  </p>
                  <button 
                    onClick={() => setProfilePanelOpen(true)}
                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium mt-2"
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
              className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-2xl z-50 text-white font-semibold transition-all duration-500 ease-out animate-toastIn ${
                notification.type === 'success' ? 'bg-green-500' :
                notification.type === 'info' ? 'bg-blue-500' :
                notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
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