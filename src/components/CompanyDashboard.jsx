import React, { useState, useEffect, useRef } from 'react';
import {
  Building, Users, FileText, MessageSquare, CheckCircle,
  XCircle, Mail, Phone, MapPin, Calendar, Download,
  Filter, Search, Plus, Eye, Edit, Trash2, Send,
  Briefcase, DollarSign, Clock, Award, BarChart3, ChevronDown, ChevronUp,
  Star, Share2, Copy, ExternalLink, MoreVertical, TrendingUp, TrendingDown,
  Heart, Bookmark, DownloadCloud, Upload, Settings, Bell, User, Image,
  Menu, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const CompanyDashboard = ({ user, showNotification, jobs, setJobs, onSendMessage = () => {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [animatingStats, setAnimatingStats] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState('30d');
  const [selectedApplicants, setSelectedApplicants] = useState(new Set());
  const [quickTemplates] = useState([
    {
      id: 1,
      name: 'Interview Invite',
      content: `Hello, thank you for applying to our company. We were impressed with your background and would like to invite you for an interview. Please let us know your availability for next week.`
    },
    {
      id: 2,
      name: 'Rejection',
      content: `Thank you for your interest in our company and for taking the time to apply. Unfortunately, we have decided to move forward with other candidates whose experience more closely matches our current needs.`
    },
    {
      id: 3,
      name: 'Application Received',
      content: `We've received your application and will review it carefully. Our team will get back to you within the next 5-7 business days. Thank you for your patience.`
    }
  ]);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Messaging states
  const [messages, setMessages] = useState({ inbox: [], sent: [] });
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [messageRecipients, setMessageRecipients] = useState([]);
  const [newMessage, setNewMessage] = useState({ toUserId: '', subject: '', body: '' });
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Image upload state
  const [jobImage, setJobImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // CV viewing state
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [cvLoading, setCvLoading] = useState(false);

  // API configuration
  const getApiBaseUrl = () => import.meta.env?.VITE_API_URL || '/api';
  const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  // Animation effects
  useEffect(() => {
    setAnimatingStats(true);
    const timer = setTimeout(() => setAnimatingStats(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch applications from the database
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/applications/for-my-jobs`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.applications) {
            // Transform the data to match the expected format
            const mappedApplications = data.applications.map(app => ({
              id: app._id || app.id,
              name: app.userId?.name || 'Unknown',
              email: app.userId?.email || 'unknown@example.com',
              phone: app.userId?.profile?.phone || '+1 (555) 123-4567',
              location: app.userId?.profile?.location || 'New York, NY',
              appliedDate: app.createdAt || new Date().toISOString(),
              status: app.status || 'pending',
              jobId: (app.jobId && (app.jobId._id || app.jobId)) || undefined,
              resume: app.resume || app.userId?.profile?.resume || null,
              coverLetter: app.coverLetter || 'Experienced professional with 5+ years in the industry.',
              experience: app.userId?.profile?.experience || '5+ years',
              education: app.userId?.profile?.education || "Bachelor's Degree",
              skills: app.userId?.profile?.skills || ['React', 'JavaScript', 'Node.js'],
              lastContact: null,
              rating: Math.floor(Math.random() * 5) + 1,
              notes: app.notes || '',
              jobTitle: app.jobTitle || 'Unknown Position',
              company: app.company || 'Unknown Company',
              raw: app
            }));
            setApplicants(mappedApplications);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        showNotification('Failed to fetch applications', 'error');
      }
    };

    if (user && user.userType === 'company') {
      fetchApplications();
    }
  }, [user, showNotification]);

  // Fetch messages when messages tab is active
  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages();
      fetchUnreadCount();
    }
  }, [activeTab]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages({
            inbox: data.inbox || [],
            sent: data.sent || []
          });
          
          // Extract unique recipients for new message composition
          const recipients = new Set();
          data.inbox.forEach(msg => recipients.add(JSON.stringify({
            id: msg.fromUserId._id,
            name: msg.fromUserId.name,
            email: msg.fromUserId.email
          })));
          data.sent.forEach(msg => recipients.add(JSON.stringify({
            id: msg.toUserId._id,
            name: msg.toUserId.name,
            email: msg.toUserId.email
          })));
          
          setMessageRecipients(Array.from(recipients).map(r => JSON.parse(r)));
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('Failed to fetch messages', 'error');
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch conversation
  const fetchConversation = async (userId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConversationMessages(data.messages);
          setSelectedConversation(userId);
          // Refresh messages to update read status
          fetchMessages();
          fetchUnreadCount();
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      showNotification('Failed to fetch conversation', 'error');
    }
  };

  // Send new message
  const handleSendNewMessage = async () => {
    if (!newMessage.toUserId || !newMessage.body.trim()) {
      showNotification('Please select a recipient and enter a message', 'error');
      return;
    }
    
    try {
      const success = await handleSendMessage({
        toUserId: newMessage.toUserId,
        subject: newMessage.subject || 'New Message',
        body: newMessage.body
      });
      
      if (success) {
        setNewMessage({ toUserId: '', subject: '', body: '' });
        setShowComposeModal(false);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message', 'error');
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('Message deleted successfully', 'success');
        fetchMessages();
        if (selectedConversation) {
          fetchConversation(selectedConversation);
        }
      } else {
        showNotification(data.message || 'Failed to delete message', 'error');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification('Failed to delete message', 'error');
    }
  };

  // View CV function
  const handleViewCv = async (applicant) => {
    if (!applicant.resume || !applicant.resume.url) {
      showNotification('No CV available for this applicant', 'error');
      return;
    }

    setCvLoading(true);
    try {
      // Get the resume URL from the applicant data
      let resumeUrl = applicant.resume.url;
      
      // If the URL is relative, construct the full URL
      if (!resumeUrl.startsWith('http')) {
        resumeUrl = `${getApiBaseUrl()}${resumeUrl}`;
      }
      
      setCvUrl(resumeUrl);
      setShowCvModal(true);
    } catch (error) {
      console.error('Error fetching CV:', error);
      showNotification('Failed to load CV', 'error');
    } finally {
      setCvLoading(false);
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.skills.some(skill => 
                           skill.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    const matchesJob = !selectedJob || applicant.jobId === selectedJob.id;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const companyJobs = (jobs || []).filter(job => 
    (job.postedBy === (user?._id || user?.id)) || 
    (job.postedBy?._id === (user?._id || user?.id))
  );

  // CSV Export Function
  const exportApplicantsCsv = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Status', 'Applied Date', 'Job Title', 'Skills'];
    const rows = filteredApplicants.map(applicant => [
      applicant.name,
      applicant.email,
      applicant.phone,
      applicant.location,
      applicant.status,
      new Date(applicant.appliedDate).toLocaleDateString(),
      applicant.jobTitle,
      applicant.skills.join('; ')
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applicants-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Applicants exported successfully!', 'success');
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      
      setJobImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async () => {
    if (!jobImage) return '';
    
    const formData = new FormData();
    formData.append('image', jobImage);
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.imageUrl;
        }
      }
      
      showNotification('Failed to upload image', 'error');
      return '';
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Error uploading image', 'error');
      return '';
    }
  };

  // API handlers
  const handleApplicationStatus = async (applicantId, status) => {
    setIsLoading(true);
    const target = applicants.find(a => a.id === applicantId);
    if (!target?.raw?._id && !target?.raw?.id) return;

    try {
      const res = await fetch(`${getApiBaseUrl()}/applications/${target.raw._id || target.raw.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      if (data.success) {
        setApplicants(prev => prev.map(app => 
          app.id === applicantId ? { ...app, status } : app
        ));
        showNotification(
          `Application ${status === 'approved' ? 'approved' : 'rejected'}!`, 
          status === 'approved' ? 'success' : 'info'
        );
      } else {
        showNotification(data.message || `Failed to ${status} application`, 'error');
      }
    } catch (error) {
      showNotification(`Network error while ${status}ing application`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobMutation = async (jobData, method = 'POST', jobId = null) => {
    setIsLoading(true);
    const url = jobId ? 
      `${getApiBaseUrl()}/jobs/${jobId}` : 
      `${getApiBaseUrl()}/jobs`;

    try {
      // Upload image if present
      let imageUrl = jobData.image || '';
      if (jobImage && !imageUrl) {
        imageUrl = await uploadImage();
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          ...jobData,
          image: imageUrl,
          skills: jobData.skills || [],
          salaryMin: jobData.salaryMin || 0,
          salaryMax: jobData.salaryMax || 0
        })
      });
      const data = await res.json();
      
      if (data.success && data.job) {
        const job = data.job;
        const mappedJob = {
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
          companyLogo: job.companyLogo || (job.company ? job.company.substring(0,2).toUpperCase() : 'C'),
          matchScore: job.matchScore || 0,
          applicants: job.applicants || 0,
          companySize: job.companySize || 'Unknown',
          workCulture: job.workCulture || 'To be determined',
          featured: job.featured || false,
          image: job.image || '',
          posted: job.createdAt,
          skills: job.skills || [],
          salaryMin: job.salaryMin || 0,
          salaryMax: job.salaryMax || 0,
          postedBy: job.postedBy?._id || job.postedBy || null
        };

        if (method === 'POST') {
          setJobs(prev => [mappedJob, ...prev]);
        } else {
          setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...jobData } : j));
        }

        setShowJobModal(false);
        setEditingJob(null);
        setJobImage(null);
        setImagePreview('');
        showNotification(
          `Job ${method === 'POST' ? 'posted' : 'updated'} successfully!`, 
          'success'
        );
      } else {
        showNotification(data.message || `Failed to ${method === 'POST' ? 'post' : 'update'} job`, 'error');
      }
    } catch (error) {
      showNotification(`Network error while ${method === 'POST' ? 'posting' : 'updating'} job`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
        showNotification('Job deleted successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to delete job', 'error');
      }
    } catch (error) {
      showNotification('Network error while deleting job', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to applicant
  const handleSendMessage = async (messageData) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(messageData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        showNotification('Message sent successfully!', 'success');
        return true;
      } else {
        showNotification(data.message || 'Failed to send message', 'error');
        return false;
      }
    } catch (error) {
      showNotification('Network error while sending message', 'error');
      return false;
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action, applicantIds) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'approve':
          await Promise.all(applicantIds.map(id => handleApplicationStatus(id, 'approved')));
          break;
        case 'reject':
          await Promise.all(applicantIds.map(id => handleApplicationStatus(id, 'rejected')));
          break;
        default:
          break;
      }
      setSelectedApplicants(new Set());
    } catch (error) {
      showNotification('Error performing bulk action', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareJob = async (jobId) => {
    const job = companyJobs.find(j => j.id === jobId);
    if (job && navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job opportunity: ${job.title} at ${job.company}`,
          url: `${window.location.origin}/jobs/${jobId}`
        });
      } catch (error) {
        navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`);
        showNotification('Job link copied to clipboard!', 'success');
      }
    }
  };

  const toggleApplicantSelection = (applicantId) => {
    const newSelection = new Set(selectedApplicants);
    if (newSelection.has(applicantId)) {
      newSelection.delete(applicantId);
    } else {
      newSelection.add(applicantId);
    }
    setSelectedApplicants(newSelection);
  };

  const selectAllApplicants = () => {
    if (selectedApplicants.size === filteredApplicants.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(filteredApplicants.map(app => app.id)));
    }
  };

  // Stats calculation
  const stats = {
    totalJobs: companyJobs.length,
    totalApplicants: applicants.length,
    pendingApplications: applicants.filter(app => app.status === 'pending').length,
    approvedApplications: applicants.filter(app => app.status === 'approved').length,
    conversionRate: applicants.length > 0 ? 
      Math.round((applicants.filter(app => app.status === 'approved').length / applicants.length) * 100) : 0,
    avgResponseTime: 2.5
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'jobs', label: 'Job Posts', icon: Briefcase },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl border border-gray-200 animate-pulse">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-900 rounded-xl shadow-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <button
            onClick={() => setShowJobModal(true)}
            className="p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)}></div>
          <div className="relative flex flex-col w-64 max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                      {tab.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-900 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Company Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage your jobs and applicants</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium shadow-sm hover:shadow-md">
                <Share2 className="w-4 h-4 mr-2" />
                Share Dashboard
              </button>
              <button
                onClick={() => setShowJobModal(true)}
                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold group"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Post New Job
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg whitespace-nowrap min-w-max ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900 bg-gray-50 shadow-sm'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            applicants={applicants}
            animatingStats={animatingStats}
            onViewApplicant={setSelectedApplicant}
            companyJobs={companyJobs}
          />
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <JobsTab
            jobs={companyJobs}
            applicants={applicants}
            onEditJob={(job) => {
              setEditingJob(job);
              setShowJobModal(true);
            }}
            onDeleteJob={handleDeleteJob}
            onShareJob={handleShareJob}
          />
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <ApplicantsTab
            applicants={filteredApplicants}
            companyJobs={companyJobs}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            selectedJob={selectedJob}
            selectedApplicants={selectedApplicants}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onJobFilterChange={setSelectedJob}
            onToggleApplicantSelection={toggleApplicantSelection}
            onSelectAllApplicants={selectAllApplicants}
            onApprove={(id) => handleApplicationStatus(id, 'approved')}
            onReject={(id) => handleApplicationStatus(id, 'rejected')}
            onMessage={setSelectedApplicant}
            onExport={exportApplicantsCsv}
            onBulkAction={handleBulkAction}
            onViewCv={handleViewCv}
          />
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <MessagesTab
            messages={messages}
            unreadCount={unreadCount}
            selectedConversation={selectedConversation}
            conversationMessages={conversationMessages}
            messageRecipients={messageRecipients}
            newMessage={newMessage}
            showComposeModal={showComposeModal}
            onFetchConversation={fetchConversation}
            onSetSelectedConversation={setSelectedConversation}
            onDeleteMessage={handleDeleteMessage}
            onSetShowComposeModal={setShowComposeModal}
            onSetNewMessage={setNewMessage}
            onHandleSendMessage={handleSendNewMessage}
            user={user}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            stats={stats}
            applicants={applicants}
            companyJobs={companyJobs}
            timeRange={analyticsTimeRange}
            onTimeRangeChange={setAnalyticsTimeRange}
          />
        )}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          expandedCards={expandedCards}
          messageText={messageText}
          quickTemplates={quickTemplates}
          onClose={() => setSelectedApplicant(null)}
          onToggleExpand={toggleCardExpansion}
          onMessageChange={setMessageText}
          onSendMessage={() => {
            if (messageText.trim() && selectedApplicant?.raw) {
              handleSendMessage({
                toUserId: selectedApplicant.raw.userId?._id || selectedApplicant.raw.userId,
                jobId: selectedApplicant.raw.jobId?._id || selectedApplicant.raw.jobId,
                applicationId: selectedApplicant.raw._id || selectedApplicant.raw.id,
                subject: `Regarding your application for ${selectedApplicant.raw.jobTitle}`,
                body: messageText
              }).then(success => {
                if (success) {
                  setMessageText('');
                  setSelectedApplicant(null);
                }
              });
            }
          }}
          onUseTemplate={(template) => setMessageText(template.content)}
          onViewCv={handleViewCv}
        />
      )}

      {/* CV Modal */}
      {showCvModal && (
        <CvModal
          cvUrl={cvUrl}
          isLoading={cvLoading}
          onClose={() => setShowCvModal(false)}
        />
      )}

      {/* Job Post Modal */}
      {showJobModal && (
        <JobPostModal
          job={editingJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
            setJobImage(null);
            setImagePreview('');
          }}
          onSubmit={(jobData) => editingJob ? 
            handleJobMutation(jobData, 'PUT', editingJob.id) : 
            handleJobMutation(jobData, 'POST')
          }
          showNotification={showNotification}
          jobImage={jobImage}
          imagePreview={imagePreview}
          onImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <ComposeMessageModal
          recipients={messageRecipients}
          newMessage={newMessage}
          onClose={() => setShowComposeModal(false)}
          onSubmit={handleSendNewMessage}
          onChange={(field, value) => setNewMessage(prev => ({ ...prev, [field]: value }))}
        />
      )}
    </div>
  );
};

// Sub-components
const OverviewTab = ({ stats, applicants, animatingStats, onViewApplicant, companyJobs }) => {
  const recentActivity = applicants
    .slice(0, 8)
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Briefcase}
          label="Active Jobs"
          value={stats.totalJobs}
          change={+2}
          color="blue"
          animating={animatingStats}
        />
        <StatCard
          icon={Users}
          label="Total Applicants"
          value={stats.totalApplicants}
          change={+15}
          color="green"
          animating={animatingStats}
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pendingApplications}
          change={-3}
          color="yellow"
          animating={animatingStats}
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion Rate"
          value={`${stats.conversionRate}%`}
          change={+5}
          color="purple"
          animating={animatingStats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applicants */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Applicants</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {applicants.length} total
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentActivity.map(applicant => (
              <ApplicantRow 
                key={applicant.id} 
                applicant={applicant} 
                onView={onViewApplicant}
              />
            ))}
          </div>
        </div>

        {/* Job Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Job Performance</h3>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {companyJobs.slice(0, 4).map(job => {
              const jobApplicants = applicants.filter(app => app.jobId === job.id);
              const approvalRate = jobApplicants.length > 0 ? 
                Math.round((jobApplicants.filter(app => app.status === 'approved').length / jobApplicants.length) * 100) : 0;
              
              return (
                <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{job.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{jobApplicants.length} applicants</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center justify-end text-sm text-green-600 font-medium">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {approvalRate}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Approval rate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, change, color, animating }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
  };

  const colors = colorClasses[color];
  const isPositive = change > 0;

  return (
    <div className={`bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
      animating ? 'animate-pulse' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 ${colors.bg} rounded-xl shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicantRow = ({ applicant, onView }) => (
  <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 group cursor-pointer" onClick={() => onView(applicant)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          {applicant.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
            {applicant.name}
          </h4>
          <p className="text-gray-600 text-sm">{applicant.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-gray-500 text-xs">
              Applied {new Date(applicant.appliedDate).toLocaleDateString()}
            </p>
            {applicant.rating > 0 && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-500 ml-1">{applicant.rating}.0</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <StatusBadge status={applicant.status} />
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const JobsTab = ({ jobs, applicants, onEditJob, onDeleteJob, onShareJob }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Your Job Posts</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
            {jobs.length} jobs
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {jobs.map(job => (
          <JobRow 
            key={job.id} 
            job={job} 
            applicants={applicants}
            onEdit={onEditJob}
            onDelete={onDeleteJob}
            onShare={onShareJob}
          />
        ))}
        {jobs.length === 0 && <EmptyState icon={Briefcase} message="No job posts yet" />}
      </div>
    </div>
  </div>
);

const JobRow = ({ job, applicants, onEdit, onDelete, onShare }) => {
  const jobApplicants = applicants.filter(app => app.jobId === job.id);

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 group">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-semibold text-gray-900 text-lg group-hover:text-gray-800 transition-colors duration-200">
              {job.title}
            </h4>
            {job.featured && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
            {job.urgent && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Urgent
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              {job.salary || 'Not specified'}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Posted {new Date(job.posted).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {jobApplicants.length} applicants
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onShare(job.id)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Share Job"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-110"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicantsTab = ({
  applicants,
  companyJobs,
  searchTerm,
  statusFilter,
  selectedJob,
  selectedApplicants,
  onSearchChange,
  onStatusFilterChange,
  onJobFilterChange,
  onToggleApplicantSelection,
  onSelectAllApplicants,
  onApprove,
  onReject,
  onMessage,
  onExport,
  onBulkAction,
  onViewCv
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Filters with Bulk Actions */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={selectedJob?.id || ''}
              onChange={(e) => onJobFilterChange(companyJobs.find(job => String(job.id) === String(e.target.value)) || null)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
            >
              <option value="">All Jobs</option>
              {companyJobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {selectedApplicants.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">
                  {selectedApplicants.size} selected
                </span>
                <select
                  onChange={(e) => onBulkAction(e.target.value, Array.from(selectedApplicants))}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm"
                >
                  <option value="">Bulk Actions</option>
                  <option value="approve">Approve Selected</option>
                  <option value="reject">Reject Selected</option>
                </select>
              </div>
            )}
            <button 
              onClick={onExport}
              className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 text-gray-700 font-medium shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Applicants ({applicants.length})
            </h3>
            {applicants.length > 0 && (
              <div className="flex items-center space-x-3">
                <label className="flex items-center text-sm text-gray-600 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedApplicants.size === applicants.length && applicants.length > 0}
                    onChange={onSelectAllApplicants}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 mr-2"
                  />
                  Select All
                </label>
              </div>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {applicants.map(applicant => (
            <ApplicantDetailRow
              key={applicant.id}
              applicant={applicant}
              isSelected={selectedApplicants.has(applicant.id)}
              onSelect={() => onToggleApplicantSelection(applicant.id)}
              onApprove={onApprove}
              onReject={onReject}
              onMessage={onMessage}
              onViewCv={onViewCv}
            />
          ))}
          {applicants.length === 0 && (
            <EmptyState icon={Users} message="No applicants found" subMessage="Try adjusting your filters" />
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicantDetailRow = ({ applicant, isSelected, onSelect, onApprove, onReject, onMessage, onViewCv }) => (
  <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
    <div className="flex flex-col space-y-4">
      <div className="flex items-start space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 mt-1"
        />
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
          {applicant.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <div className="flex items-center space-x-3">
              <h4 className="font-semibold text-gray-900">
                {applicant.name}
              </h4>
              <StatusBadge status={applicant.status} />
              {applicant.rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{applicant.rating}.0</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {applicant.email}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {applicant.phone}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {applicant.location}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {applicant.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
            {applicant.skills.length > 3 && (
              <span className="text-sm text-gray-500 font-medium">
                +{applicant.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end ml-16">
        {applicant.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(applicant.id)}
              className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 text-sm transform hover:scale-105 font-medium shadow-sm hover:shadow-md"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </button>
            <button
              onClick={() => onReject(applicant.id)}
              className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 text-sm transform hover:scale-105 font-medium shadow-sm hover:shadow-md"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </button>
          </>
        )}
        <button
          onClick={() => onMessage(applicant)}
          className="flex items-center justify-center px-3 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 text-sm transform hover:scale-105 font-medium shadow-sm hover:shadow-md"
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          Message
        </button>
        <button
          onClick={() => onViewCv(applicant)}
          className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm transform hover:scale-105 font-medium shadow-sm hover:shadow-md"
        >
          <FileText className="w-4 h-4 mr-1" />
          View CV
        </button>
        {applicant.resume && (
          <button
            onClick={() => window.open(applicant.resume.url.startsWith('http') ? applicant.resume.url : `${import.meta.env?.VITE_API_URL || '/api'}${applicant.resume.url}`, '_blank')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110"
            title="Download Resume"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  </div>
);

const MessagesTab = ({
  messages,
  unreadCount,
  selectedConversation,
  conversationMessages,
  messageRecipients,
  newMessage,
  showComposeModal,
  onFetchConversation,
  onSetSelectedConversation,
  onDeleteMessage,
  onSetShowComposeModal,
  onSetNewMessage,
  onHandleSendMessage,
  user
}) => {
  const [activeView, setActiveView] = useState('inbox');
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Message List */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <button
              onClick={() => onSetShowComposeModal(true)}
              className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveView('inbox')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'inbox' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inbox {unreadCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('sent')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'sent' 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
          {activeView === 'inbox' ? (
            messages.inbox.length > 0 ? (
              messages.inbox.map(message => (
                <div
                  key={message._id}
                  onClick={() => onFetchConversation(message.fromUserId._id)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !message.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                      {message.fromUserId.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {message.fromUserId.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(message.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.body}
                      </p>
                    </div>
                    {!message.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No messages in your inbox</p>
              </div>
            )
          ) : (
            messages.sent.length > 0 ? (
              messages.sent.map(message => (
                <div
                  key={message._id}
                  onClick={() => onFetchConversation(message.toUserId._id)}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                      {message.toUserId.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          To: {message.toUserId.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(message.sentAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No sent messages</p>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Conversation View */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {messageRecipients.find(r => r.id === selectedConversation)?.name || 'Conversation'}
                </h3>
                <button
                  onClick={() => onSetSelectedConversation(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {conversationMessages.map(message => (
                <div
                  key={message._id}
                  className={`mb-4 flex ${
                    message.fromUserId._id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.fromUserId._id === user.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="font-medium text-sm mb-1">{message.subject}</p>
                    <p>{message.body}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {new Date(message.sentAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => onDeleteMessage(message._id)}
                        className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onHandleSendMessage({
                        toUserId: selectedConversation,
                        subject: 'Re: Message',
                        body: e.target.value
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Type a message..."]');
                    if (input && input.value.trim()) {
                      onHandleSendMessage({
                        toUserId: selectedConversation,
                        subject: 'Re: Message',
                        body: input.value
                      });
                      input.value = '';
                    }
                  }}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Select a conversation to start messaging</p>
            <p className="text-gray-400 text-sm mt-2">
              Choose a message from the list or compose a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalyticsTab = ({ stats, applicants, companyJobs, timeRange, onTimeRangeChange }) => {
  const getTimeRangeData = () => {
    return {
      applicationsOverTime: [65, 78, 90, 81, 56, 55, 40],
      approvalRates: [25, 30, 45, 35, 40, 50, 55],
      topPerformingJobs: companyJobs.slice(0, 3)
    };
  };

  const analyticsData = getTimeRangeData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Over Time</h3>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.applicationsOverTime.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gray-900 rounded-t-lg transition-all duration-500 hover:bg-gray-700 cursor-pointer"
                  style={{ height: `${(value / 100) * 200}px` }}
                />
                <span className="text-xs text-gray-500 mt-2">Day {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
          <div className="space-y-4">
            {analyticsData.topPerformingJobs.map(job => {
              const jobApplicants = applicants.filter(app => app.jobId === job.id);
              const approvalRate = jobApplicants.length > 0 ? 
                Math.round((jobApplicants.filter(app => app.status === 'approved').length / jobApplicants.length) * 100) : 0;
              
              return (
                <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{job.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{jobApplicants.length} applicants</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
                    <p className="text-xs text-gray-500 mt-1">Approval rate</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message, subMessage }) => (
  <div className="p-12 text-center">
    <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500 text-lg font-medium">{message}</p>
    {subMessage && <p className="text-gray-400 text-sm mt-1">{subMessage}</p>}
  </div>
);

const ApplicantDetailModal = ({ 
  applicant, 
  expandedCards, 
  messageText, 
  quickTemplates,
  onClose, 
  onToggleExpand, 
  onMessageChange, 
  onSendMessage,
  onUseTemplate,
  onViewCv
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-2xl border border-gray-200">
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Applicant Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Personal Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Personal Information</h4>
            <button
              onClick={() => onToggleExpand('personal')}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {expandedCards['personal'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${expandedCards['personal'] ? 'block' : 'hidden'}`}>
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">{applicant.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{applicant.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900">{applicant.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <p className="mt-1 text-gray-900">{applicant.location}</p>
            </div>
          </div>
        </div>

        {/* CV Section */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Resume/CV</h4>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                {applicant.resume?.name || 'resume.pdf'}
              </p>
              <p className="text-xs text-gray-500">
                Last updated: {applicant.resume?.uploadDate ? new Date(applicant.resume.uploadDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={() => onViewCv(applicant)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm transform hover:scale-105 font-medium shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4 mr-2" />
              View CV
            </button>
            {applicant.resume && (
              <button
                onClick={() => window.open(applicant.resume.url.startsWith('http') ? applicant.resume.url : `${import.meta.env?.VITE_API_URL || '/api'}${applicant.resume.url}`, '_blank')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-110"
                title="Download Resume"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Templates */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Quick Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => onUseTemplate(template)}
                className="p-3 text-left border border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 bg-white"
              >
                <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                <div className="text-gray-600 text-xs mt-1 line-clamp-2">{template.content}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Send Message</h4>
          <textarea
            value={messageText}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
            placeholder="Type your message here..."
          />
          <div className="flex justify-end space-x-3 mt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSendMessage}
              disabled={!messageText.trim()}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CvModal = ({ cvUrl, isLoading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 shadow-2xl border border-gray-200">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Applicant CV</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 h-[70vh] overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <iframe
              src={cvUrl}
              className="w-full h-full border-0"
              title="Applicant CV"
            />
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
            <a
              href={cvUrl}
              download
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CV
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobPostModal = ({ 
  job, 
  onClose, 
  onSubmit, 
  showNotification,
  jobImage,
  imagePreview,
  onImageUpload,
  fileInputRef
}) => {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || '',
    location: job?.location || '',
    salary: job?.salary || '',
    type: job?.type || 'full-time',
    description: job?.description || '',
    requirements: job?.requirements || '',
    benefits: job?.benefits || '',
    image: job?.image || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.location) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 shadow-2xl border border-gray-200">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {job ? 'Edit Job Post' : 'Create Job Post'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                placeholder="Your company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                placeholder="e.g. Remote, New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
                placeholder="e.g. $80,000 - $120,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </button>
              </div>
              {imagePreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="Job preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload an image to make your job post more attractive (max 5MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleChange('requirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              placeholder="List the required skills, experience, and qualifications..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200"
              placeholder="Describe the benefits and perks of working at your company..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {job ? 'Update Job' : 'Post Job'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ComposeMessageModal = ({ 
  recipients, 
  newMessage, 
  onClose, 
  onSubmit, 
  onChange 
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full transform transition-all duration-300 scale-100 shadow-2xl border border-gray-200">
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Compose Message</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient
          </label>
          <select
            value={newMessage.toUserId}
            onChange={(e) => onChange('toUserId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Select a recipient</option>
            {recipients.map(recipient => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.name} ({recipient.email})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={newMessage.subject}
            onChange={(e) => onChange('subject', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Message subject"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={newMessage.body}
            onChange={(e) => onChange('body', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Type your message here..."
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default CompanyDashboard;