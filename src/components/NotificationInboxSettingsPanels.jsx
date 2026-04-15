import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Briefcase, FileText, UserCircle, MessageSquare, CheckSquare, Trash2, Inbox, Reply, Forward, Send,
  Clock, MapPin, DollarSign, Building, Bell, Search, Eye, EyeOff, CheckCheck, Circle, Phone, Video,
  Megaphone, Lock, Key, Shield, User, Mail, AlertTriangle, LogOut, ChevronRight, Check, Archive,
  Globe, Moon, Sun, Fingerprint, Smartphone, Palette, BellRing, Filter, Smile, SmilePlus, XCircle,
  Settings
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Notification Panel with beautiful design
const NotificationPanel = ({
  notificationPanelOpen,
  setNotificationPanelOpen,
  notifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  navigateToRelatedContent,
  unreadCount,
  token: propToken
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const token = propToken || localStorage.getItem('token') || '';

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMins = Math.ceil(diffTime / (1000 * 60));
          return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
        }
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };

  // Filter notifications based on current filter and search term
  const filteredNotifications = notifications.filter(notification => {
    if (!notification) return false;
    
    // Apply type filter
    if (filter === 'unread') {
      return !notification.read;
    }
    if (filter !== 'all' && notification.type !== filter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (notification.title && notification.title.toLowerCase().includes(searchLower)) ||
        (notification.message && notification.message.toLowerCase().includes(searchLower)) ||
        (notification.jobDetails?.title && notification.jobDetails.title.toLowerCase().includes(searchLower)) ||
        (notification.jobDetails?.company && notification.jobDetails.company.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-white" />;
      case 'application':
        return <FileText className="w-4 h-4 text-white" />;
      case 'profile':
        return <UserCircle className="w-4 h-4 text-white" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-white" />;
      case 'reply':
        return <Reply className="w-4 h-4 text-white" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-white" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job':
        return 'bg-white/10 text-white border border-white/20';
      case 'application':
        return 'bg-white/10 text-white border border-white/20';
      case 'profile':
        return 'bg-white/10 text-white border border-white/20';
      case 'message':
        return 'bg-white/10 text-white border border-white/20';
      case 'reply':
        return 'bg-white/10 text-white border border-white/20';
      case 'announcement':
        return 'bg-white/10 text-white border border-white/20';
      default:
        return 'bg-white/10 text-white border border-white/20';
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-screen w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${notificationPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header with slate background */}
      <div className="sticky top-0 bg-slate-800 p-5 z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-slate-400 text-xs">Stay updated on your activities</p>
            </div>
          </div>
          <button 
            onClick={() => setNotificationPanelOpen(false)}
            className="p-2.5 rounded-xl hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-slate-100 rounded-full">
              <h3 className="text-sm font-bold text-slate-700 flex items-center">
                {filteredNotifications.filter(n => !n.read).length} Unread
              </h3>
            </div>
            <p className="text-xs text-slate-500">Updates & alerts</p>
          </div>
          <div className="flex gap-2">
            {markAllNotificationsAsRead && <button 
              onClick={markAllNotificationsAsRead}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-xs font-medium flex items-center"
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </button>}
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 font-semibold mb-1">No notifications</h3>
              <p className="text-slate-500 text-sm">You're all caught up!</p>
            </div>
          ) : filteredNotifications.map(notification => (
            <div 
              key={notification.id || notification._id} 
              className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer group ${
                notification.read 
                  ? 'bg-white border-slate-200 hover:border-slate-300' 
                  : 'bg-white border-l-4 border-l-slate-600 border-slate-200'
              } ${
                notification.priority === 'high' ? 'border-l-red-500 bg-red-50' : ''
              }`}
              onClick={() => {
                const jobId = notification.relatedId || notification.jobDetails?.jobId;
                if (jobId) {
                  navigateToRelatedContent(notification.relatedType || 'job', jobId);
                }
                if (!notification.read) {
                  markNotificationAsRead(notification.id || notification._id);
                }
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center flex-1">
                  <div className={`p-3 rounded-xl mr-3 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(notification.date || notification.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1.5 ml-2">
                  {!notification.read && (
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                  )}
                  {!notification.read && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notification.id || notification._id);
                      }}
                      className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                      title="Mark as read"
                    >
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id || notification._id);
                    }}
                    className="p-1.5 rounded-full hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                {notification.message}
              </p>

              {/* Job/Application Specific Details */}
              {notification.jobDetails && (
                <div 
                  className="bg-white rounded-xl p-3 border border-slate-100 mb-3 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (notification.relatedId && notification.relatedType) {
                      navigateToRelatedContent(notification.relatedType, notification.relatedId);
                    } else if (notification.jobDetails?.jobId) {
                      navigateToRelatedContent('job', notification.jobDetails.jobId);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {notification.jobDetails.title || 'Untitled Job'}
                    </span>
                    {notification.jobDetails.salary && (
                      <span className="flex items-center text-green-600 text-xs font-bold">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {notification.jobDetails.salary}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 space-x-3">
                    {notification.jobDetails.company ? (
                      <span className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {notification.jobDetails.company}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        Company not specified
                      </span>
                    )}
                    {notification.jobDetails.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {notification.jobDetails.location}
                      </span>
                    )}
                  </div>
                  {notification.jobDetails.status && (
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${
                      notification.jobDetails.status === 'approved' ? 'bg-green-100 text-green-700' :
                      notification.jobDetails.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      notification.jobDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      notification.jobDetails.status === 'high_match' ? 'bg-green-100 text-green-700' :
                      notification.jobDetails.status === 'needs_improvement' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {notification.jobDetails.status === 'high_match' ? 'Great Match!' :
                       notification.jobDetails.status === 'needs_improvement' ? 'Needs Improvement' :
                       notification.jobDetails.status}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-400 flex items-center">
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Click to view job
                  </div>
                </div>
              )}

              {/* Message Reply Specific Details */}
              {notification.messageDetails && (
                <div className="bg-white rounded-xl p-3 border border-slate-100 mb-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      Re: {notification.messageDetails.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {notification.messageDetails.preview}
                  </p>
                </div>
              )}

              {/* Action Buttons for Notifications */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex space-x-2 pt-2 border-t border-slate-200">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof action.handler === 'function') {
                          action.handler();
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        action.primary 
                          ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 to-slate-900' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {searchTerm ? 'No notifications found' : 'No notifications yet'}
              </h3>
              <p className="text-slate-500 text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'We\'ll notify you about important updates here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Inbox Panel with beautiful chat design
const InboxPanel = ({
  inboxPanelOpen,
  setInboxPanelOpen,
  messages,
  selectedMessage,
  setSelectedMessage,
  markMessageAsRead,
  deleteMessage,
  messageReply,
  setMessageReply,
  sendMessageReply,
  fetchConversation,
  userType,
  setNotificationPanelOpen,
  userId,
  token,
  fetchMessages
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState(false);
  
  const commonEmojis = ['😊', '👍', '❤️', '🎉', '🙏', '💼', '📋', '✅', '❌', '⭐', '🚀', '💪'];

  const addEmoji = (emoji) => {
    setMessageReply(prev => prev + emoji);
  };
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedMessage) {
      scrollToBottom();
    }
  }, [selectedMessage, messageReply]);

  // Helper function to safely get user ID
  const getUserId = useCallback((user) => {
    if (!user) return null;
    if (typeof user === 'string') return user;
    return user._id || user.id || user.userId;
  }, []);

  // Helper function to safely get user name
  const getUserName = useCallback((user) => {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return user;
    return user.name || user.email || user.firstName || user.lastName || 'Unknown User';
  }, []);

  // Extract users from existing messages
  const extractUsersFromMessages = useCallback(() => {
    const uniqueUsers = new Map();
    
    messages.forEach(message => {
      if (message.fromUserId && getUserId(message.fromUserId) !== userId) {
        const fromUser = message.fromUserId;
        const fromUserId = getUserId(fromUser);
        if (fromUserId && !uniqueUsers.has(fromUserId)) {
          uniqueUsers.set(fromUserId, fromUser);
        }
      }
      
      if (message.toUserId && getUserId(message.toUserId) !== userId) {
        const toUser = message.toUserId;
        const toUserId = getUserId(toUser);
        if (toUserId && !uniqueUsers.has(toUserId)) {
          uniqueUsers.set(toUserId, toUser);
        }
      }
    });
    
    return Array.from(uniqueUsers.values());
  }, [messages, userId, getUserId]);

  // Fetch users for new message form
  useEffect(() => {
    if (showNewMessageForm) {
      setLoadingUsers(true);
      setUsersError(null);
      
      const extractedUsers = extractUsersFromMessages();
      
      if (extractedUsers.length > 0) {
        setUsers(extractedUsers);
        setLoadingUsers(false);
      } else {
        setUsersError("No previous conversations found. Start a conversation by replying to an existing message.");
        setLoadingUsers(false);
      }
    }
  }, [showNewMessageForm, extractUsersFromMessages]);

  // Filter messages to only show those related to the current user
  const userMessages = messages.filter(message => {
    if (!message) return false;
    
    const fromUserId = getUserId(message.fromUserId);
    const toUserId = getUserId(message.toUserId);
    
    return fromUserId === userId || toUserId === userId;
  });

  // Apply filters and search
  const filteredMessages = userMessages.filter(message => {
    // Apply tab filter
    if (activeTab === 'unread' && message.read) return false;
    if (activeTab === 'jobs' && message.type !== 'job_related') return false;
    if (activeTab === 'applications' && message.type !== 'application_related') return false;
    
    // Apply search filter
    if (messageSearch) {
      const searchLower = messageSearch.toLowerCase();
      return (
        (message.subject && message.subject.toLowerCase().includes(searchLower)) ||
        (message.body && message.body.toLowerCase().includes(searchLower)) ||
        (message.content && message.content.toLowerCase().includes(searchLower)) ||
        (getUserName(message.fromUserId).toLowerCase().includes(searchLower)) ||
        (getUserName(message.toUserId).toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const formatMessageDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setSelectedMessage(message);
    setMessageReply('');
    setForwardingMessage(null);
    setShowNewMessageForm(false);
  };

  const [forwardRecipient, setForwardRecipient] = useState('');
  const [forwardRecipientsList, setForwardRecipientsList] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [sendingForward, setSendingForward] = useState(false);

  const handleForward = (message) => {
    setForwardingMessage(message);
    setReplyingTo(null);
    setMessageReply('');
    setShowNewMessageForm(false);
    setShowForwardModal(true);
    
    // Build list of potential recipients from messages
    const potentialRecipients = new Map();
    messages.forEach(m => {
      if (m.fromUserId && getUserId(m.fromUserId) !== userId) {
        const uid = getUserId(m.fromUserId);
        if (!potentialRecipients.has(uid)) {
          potentialRecipients.set(uid, m.fromUserId);
        }
      }
      if (m.toUserId && getUserId(m.toUserId) !== userId) {
        const uid = getUserId(m.toUserId);
        if (!potentialRecipients.has(uid)) {
          potentialRecipients.set(uid, m.toUserId);
        }
      }
    });
    setForwardRecipientsList(Array.from(potentialRecipients.values()));
  };

  // Forward modal handler
  const handleSendForward = async () => {
    if (!forwardRecipient.trim() || !forwardingMessage) return;
    
    const recipient = forwardRecipientsList.find(u => 
      getUserName(u).toLowerCase().includes(forwardRecipient.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(forwardRecipient.toLowerCase()))
    );
    
    if (!recipient) {
      setUsersError("Recipient not found. Please select from the list.");
      return;
    }
    
    setSendingForward(true);
    setUsersError(null);
    
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: getUserId(recipient),
          subject: `Fwd: ${forwardingMessage.subject || 'No Subject'}`,
          body: `-------- Forwarded Message --------\n\nFrom: ${getUserName(forwardingMessage.fromUserId)}\n\n${forwardingMessage.body || forwardingMessage.content || 'No content'}`,
          isForwarded: true,
          originalMessageId: forwardingMessage._id || forwardingMessage.id
        })
      });
      
      if (response.ok) {
        setForwardingMessage(null);
        setForwardRecipient('');
        setShowForwardModal(false);
        await fetchMessages();
      } else {
        const errorData = await response.json();
        setUsersError(errorData.message || 'Failed to forward message');
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
      setUsersError('Network error. Please try again.');
    } finally {
      setSendingForward(false);
    }
  };

  const handleSendReply = async () => {
    if (replyingTo && messageReply.trim()) {
      setSendingMessage(true);
      try {
        await sendMessageReply(replyingTo._id || replyingTo.id, messageReply, 'reply');
        setReplyingTo(null);
        setMessageReply('');
      } catch (error) {
        console.error('Error sending reply:', error);
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleSendNewMessage = async () => {
    if (newMessage.trim() && newMessageSubject.trim() && newMessageRecipient.trim()) {
      setSendingMessage(true);
      try {
        const recipient = users.find(u => 
          getUserName(u).toLowerCase().includes(newMessageRecipient.toLowerCase()) ||
          (u.email && u.email.toLowerCase().includes(newMessageRecipient.toLowerCase()))
        );
        
        if (!recipient) {
          setUsersError("Recipient not found. Please select a user from your previous conversations.");
          setSendingMessage(false);
          return;
        }
        
        const response = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            toUserId: getUserId(recipient),
            subject: newMessageSubject,
            body: newMessage
          })
        });
        
        if (response.ok) {
          setNewMessage('');
          setNewMessageSubject('');
          setNewMessageRecipient('');
          setShowNewMessageForm(false);
          setUsersError(null);
        } else {
          const errorData = await response.json();
          setUsersError(errorData.message || 'Failed to send message');
        }
      } catch (error) {
        console.error('Error sending new message:', error);
        setUsersError('Network error. Please try again.');
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    
    if (!message.read && getUserId(message.toUserId) === userId) {
      await markMessageAsRead(message._id || message.id);
    }
    
    if (fetchConversation && typeof fetchConversation === 'function') {
      const otherUserId = getUserId(message.fromUserId) === userId 
        ? getUserId(message.toUserId)
        : getUserId(message.fromUserId);
      
      if (otherUserId) {
        fetchConversation(otherUserId);
      }
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-screen w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${inboxPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header with slate background */}
      <div className="sticky top-0 bg-slate-800 p-5 z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <p className="text-slate-400 text-xs">Communicate with others</p>
            </div>
          </div>
          <button 
            onClick={() => setInboxPanelOpen(false)}
            className="p-2.5 rounded-xl hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Message Tabs */}
      <div className="px-5 py-4 bg-white border-b border-slate-200">
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
          {[
            { id: 'all', label: 'All', count: userMessages.length },
            { id: 'unread', label: 'Unread', count: userMessages.filter(m => !m.read).length },
            { id: 'jobs', label: 'Jobs', count: userMessages.filter(m => m.type === 'job_related').length },
            { id: 'applications', label: 'Applications', count: userMessages.filter(m => m.type === 'application_related').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        {/* New Message Button */}
        {!selectedMessage && !showNewMessageForm && (
          <button
            onClick={() => setShowNewMessageForm(true)}
            className="w-full mb-4 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-medium flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Compose New Message
          </button>
        )}

        {/* Forward Modal */}
      {showForwardModal && forwardingMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Forward className="w-6 h-6 mr-2 text-slate-600" />
                Forward Message
              </h3>
              <button 
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardingMessage(null);
                  setForwardRecipient('');
                  setUsersError(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            {/* Original Message Preview */}
            <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-900 mb-2">Original Message:</p>
              <p className="text-sm text-slate-600 line-clamp-3">
                {forwardingMessage.body || forwardingMessage.content || 'No content'}
              </p>
              <p className="text-xs text-slate-400 mt-2">From: {getUserName(forwardingMessage.fromUserId)}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Forward to</label>
                {forwardRecipientsList.length > 0 ? (
                  <>
                    <input
                      type="text"
                      value={forwardRecipient}
                      onChange={(e) => setForwardRecipient(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Start typing recipient name..."
                      list="forward-users"
                    />
                    <datalist id="forward-users">
                      {forwardRecipientsList.map(user => (
                        <option key={getUserId(user)} value={getUserName(user)}>
                          {user.email || 'No email'}
                        </option>
                      ))}
                    </datalist>
                  </>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">No recipients available. Start a conversation first.</p>
                  </div>
                )}
              </div>
              
              {usersError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{usersError}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardingMessage(null);
                  setForwardRecipient('');
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendForward}
                disabled={sendingForward || !forwardRecipient.trim() || forwardRecipientsList.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-700 to-slate-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sendingForward ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewMessageForm ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-slate-600" />
              New Message
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                {loadingUsers ? (
                  <div className="flex justify-center py-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700"></div>
                  </div>
                ) : usersError ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">{usersError}</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newMessageRecipient}
                      onChange={(e) => setNewMessageRecipient(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Start typing recipient name..."
                      list="users"
                    />
                    <datalist id="users">
                      {users.map(user => (
                        <option key={getUserId(user)} value={getUserName(user)}>
                          {user.email || 'No email'}
                        </option>
                      ))}
                    </datalist>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  rows={4}
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSendNewMessage}
                  disabled={sendingMessage || !newMessage.trim() || !newMessageSubject.trim() || !newMessageRecipient.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-700 to-slate-900 transition-all font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowNewMessageForm(false);
                    setUsersError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedMessage ? (
          <ErrorBoundary>
            <MessageDetailView
              message={selectedMessage}
              onBack={() => setSelectedMessage(null)}
              messageReply={messageReply}
              setMessageReply={setMessageReply}
              sendMessageReply={sendMessageReply}
              deleteMessage={deleteMessage}
              fetchConversation={fetchConversation}
              userType={userType}
              userId={userId}
              token={token}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              forwardingMessage={forwardingMessage}
              setForwardingMessage={setForwardingMessage}
              handleReply={handleReply}
              handleForward={handleForward}
              handleSendReply={handleSendReply}
              messagesEndRef={messagesEndRef}
              getUserId={getUserId}
              getUserName={getUserName}
              commonEmojis={commonEmojis}
              showForwardModal={showForwardModal}
              setShowForwardModal={setShowForwardModal}
              forwardRecipient={forwardRecipient}
              setForwardRecipient={setForwardRecipient}
              forwardRecipientsList={forwardRecipientsList}
              handleSendForward={handleSendForward}
              usersError={usersError}
              setUsersError={setUsersError}
              sendingForward={sendingForward}
              fetchMessages={fetchMessages}
            />
          </ErrorBoundary>
        ) : (
          <MessageListView
            messages={filteredMessages}
            onSelectMessage={handleSelectMessage}
            deleteMessage={deleteMessage}
            activeTab={activeTab}
            formatMessageDate={formatMessageDate}
            handleReply={handleReply}
            handleForward={handleForward}
            userId={userId}
            getUserId={getUserId}
            getUserName={getUserName}
            searchTerm={messageSearch}
          />
        )}
      </div>
    </div>
  );
};

// Message List View Component
const MessageListView = ({ 
  messages, 
  onSelectMessage, 
  deleteMessage, 
  activeTab, 
  formatMessageDate, 
  handleReply, 
  handleForward, 
  userId, 
  getUserId, 
  getUserName,
  searchTerm 
}) => {
  return (
    <div className="space-y-3">
      {messages.map(message => {
        if (!message) return null;
        
        // Determine if this message is from the current user
        const isUserMessage = getUserId(message.fromUserId) === userId;
        
        // Get the other user's name
        const otherUserName = isUserMessage 
          ? getUserName(message.toUserId)
          : getUserName(message.fromUserId);
        
        // Get initials for avatar
        const getInitials = (name) => {
          return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        };

        return (
          <div 
            key={message.id || message._id} 
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
              message.read 
                ? 'bg-white border-slate-200' 
                : 'bg-gradient-to-r from-blue-50 to-slate-50 border-l-4 border-l-blue-500'
            }`}
            onClick={() => onSelectMessage(message)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                  isUserMessage 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white'
                }`}>
                  {isUserMessage ? 'Y' : getInitials(otherUserName)}
                </div>
                {!message.read && !isUserMessage && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold text-sm ${!message.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {isUserMessage ? 'You' : otherUserName}
                  </h4>
                  <span className={`text-xs ${!message.read ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                    {formatMessageDate(message.sentAt || message.createdAt)}
                  </span>
                </div>
                <p className={`text-sm truncate mt-0.5 ${!message.read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                  {message.subject || 'No Subject'}
                </p>
                {message.jobId && message.jobId.title && (
                  <div className="flex items-center mt-1">
                    <Briefcase className="w-3 h-3 text-slate-400 mr-1" />
                    <span className="text-xs text-slate-500">{message.jobId.title}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMessage(message._id || message.id);
                }}
                className="p-2 rounded-full hover:bg-red-50 transition-colors ml-2"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {message.body || message.content || 'No content'}
            </p>

            {/* Quick Actions */}
            <div className="flex space-x-2 mt-3 pt-3 border-t border-slate-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReply(message);
                }}
                className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-xs font-medium"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleForward(message);
                }}
                className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-xs font-medium"
              >
                <Forward className="w-3 h-3 mr-1" />
                Forward
              </button>
            </div>
          </div>
        );
      })}
      
      {messages.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Inbox className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {searchTerm 
              ? 'No messages found' 
              : activeTab === 'all' ? 'No messages yet' :
                activeTab === 'unread' ? 'No unread messages' :
                activeTab === 'jobs' ? 'No job messages' : 'No application messages'
            }
          </h3>
          <p className="text-slate-500 text-sm">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : activeTab === 'all' ? 'Your messages will appear here' :
                activeTab === 'unread' ? 'You\'re all caught up!' :
                'Messages related to this category will appear here'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Message Detail View Component
const MessageDetailView = ({ 
  message, 
  onBack, 
  messageReply, 
  setMessageReply, 
  sendMessageReply, 
  deleteMessage,
  fetchConversation,
  userType,
  userId,
  token,
  replyingTo,
  setReplyingTo,
  forwardingMessage,
  setForwardingMessage,
  handleReply,
  handleForward,
  handleSendReply,
  messagesEndRef,
  getUserId,
  getUserName,
  commonEmojis,
  showForwardModal,
  setShowForwardModal,
  forwardRecipient,
  setForwardRecipient,
  forwardRecipientsList,
  handleSendForward,
  usersError,
  setUsersError,
  sendingForward,
  fetchMessages
}) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addEmoji = (emoji) => {
    setMessageReply(prev => prev + emoji);
  };

  const handleSendReplyClick = async () => {
    if (!messageReply.trim()) return;
    setSendingReply(true);
    try {
      // Find recipient from the current message
      const isFromCurrentUser = getUserId(message.fromUserId) === userId;
      const recipientId = isFromCurrentUser 
        ? getUserId(message.toUserId) 
        : getUserId(message.fromUserId);
      
      if (recipientId) {
        const response = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            toUserId: recipientId,
            subject: `Re: ${message.subject || 'Message'}`,
            body: messageReply,
            replyToMessageId: message._id || message.id
          })
        });
        
        if (response.ok) {
          setMessageReply('');
          // Refresh conversation
          if (fetchConversation && typeof fetchConversation === 'function') {
            const conversationData = await fetchConversation(recipientId);
            setConversationHistory(conversationData.messages || conversationData || []);
          }
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  // Determine if this message is from the current user
  const isUserMessage = getUserId(message.fromUserId) === userId;
  
  // Get the other user's name
  const otherUserName = isUserMessage 
    ? getUserName(message.toUserId)
    : getUserName(message.fromUserId);

  useEffect(() => {
    if (message) {
      setLoading(true);
      setError(null);
      
      const fetchConversationHistory = async () => {
        if (fetchConversation && typeof fetchConversation === 'function') {
          const otherUserId = isUserMessage 
            ? getUserId(message.toUserId)
            : getUserId(message.fromUserId);
          
          if (otherUserId) {
            try {
              const data = await fetchConversation(otherUserId);
              // Sort oldest first (newest at bottom of chat)
              const sorted = (data.messages || data || []).sort((a, b) => 
                new Date(a.sentAt || a.createdAt || 0) - new Date(b.sentAt || b.createdAt || 0)
              );
              setConversationHistory(sorted);
            } catch (err) {
              console.error('Error fetching conversation:', err);
              setError('Failed to load conversation history');
              setConversationHistory([message]);
            }
          } else {
            setConversationHistory([message]);
          }
        } else {
          setConversationHistory([message]);
        }
        setLoading(false);
      };

      fetchConversationHistory();
    }
  }, [message, fetchConversation, isUserMessage, getUserId]);

  const formatMessageDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };

  const handleSendReplyEnhanced = async () => {
    if (replyingTo && messageReply.trim()) {
      setSendingReply(true);
      try {
        // Get the recipient from the message being replied to
        const isFromCurrentUser = getUserId(replyingTo.fromUserId) === userId;
        const recipientId = isFromCurrentUser 
          ? getUserId(replyingTo.toUserId) 
          : getUserId(replyingTo.fromUserId);
        
        // Send the reply as a new message
        const response = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            toUserId: recipientId,
            subject: `Re: ${replyingTo.subject || 'Message'}`,
            body: messageReply,
            replyToMessageId: replyingTo._id || replyingTo.id
          })
        });
        
        if (response.ok) {
          setReplyingTo(null);
          setMessageReply('');
          
          // Refresh conversation history
          if (fetchConversation && typeof fetchConversation === 'function') {
            const otherUserId = isUserMessage 
              ? getUserId(message.toUserId)
              : getUserId(message.fromUserId);
            
            if (otherUserId) {
              const data = await fetchConversation(otherUserId);
              setConversationHistory(data.messages || data || []);
            }
          }
        } else {
          console.error('Failed to send reply');
          setError('Failed to send reply');
        }
      } catch (error) {
        console.error('Error sending reply:', error);
        setError('Failed to send reply');
      } finally {
        setSendingReply(false);
      }
    }
  };

  if (error && !conversationHistory.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={onBack}
            className="flex items-center text-slate-900 hover:text-slate-700 font-medium text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Back to inbox
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-slate-950 text-white rounded-md hover:bg-slate-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4" data-message-detail="true">
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-900 hover:text-slate-700 font-medium text-sm"
        >
          <X className="w-4 h-4 mr-1" />
          Back to inbox
        </button>
        <button 
          onClick={() => deleteMessage(message._id || message.id)}
          className="p-2 rounded-full hover:bg-red-50 transition-colors"
          title="Delete conversation"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Conversation Header */}
      <div className="border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">{message.subject || 'No Subject'}</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Voice call">
              <Phone className="w-4 h-4 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Video call">
              <Video className="w-4 h-4 text-slate-600" />
            </button>
            <button 
              onClick={() => deleteMessage(message._id || message.id)}
              className="p-2 rounded-full hover:bg-red-50 transition-colors"
              title="Delete conversation"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-3 ${
              isUserMessage 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white'
            }`}>
              {isUserMessage ? 'Y' : otherUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {isUserMessage ? 'You' : otherUserName}
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                {isUserMessage ? (userType === 'jobSeeker' ? 'Candidate' : 'Employer') : (userType === 'jobSeeker' ? 'Employer' : 'Candidate')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              {formatMessageDate(message.sentAt || message.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Job Context */}
        {message.jobId && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 text-sm">{message.jobId.title}</span>
            </div>
            <div className="flex items-center text-xs text-slate-600 space-x-3">
              {message.jobId.company && (
                <span className="flex items-center">
                  <Building className="w-3 h-3 mr-1" />
                  {message.jobId.company}
                </span>
              )}
              {message.jobId.location && (
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {message.jobId.location}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Conversation History */}
      <div className="mb-5 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        <h4 className="font-medium text-slate-900 text-sm mb-3 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Conversation History
        </h4>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-950"></div>
          </div>
        ) : (
          (Array.isArray(conversationHistory) ? conversationHistory : []).map((msg, index) => {
            if (!msg) return null;
            
            const msgIsUserMessage = getUserId(msg.fromUserId) === userId;
            const msgOtherUserName = msgIsUserMessage 
              ? getUserName(msg.toUserId)
              : getUserName(msg.fromUserId);
            
            const showDateSeparator = index === 0 || (
              conversationHistory[index - 1]?.sentAt && 
              new Date(conversationHistory[index - 1].sentAt).toDateString() !== new Date(msg.sentAt).toDateString()
            );
            
            return (
              <div key={msg._id || msg.id}>
                {showDateSeparator && (
                  <div className="text-center text-xs text-slate-400 my-3">
                    <span className="bg-slate-100 px-3 py-1 rounded-full">
                      {new Date(msg.sentAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                <div className={`flex ${msgIsUserMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${msgIsUserMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    {!msgIsUserMessage && (
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {msgOtherUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                      msgIsUserMessage
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-br-md'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <div className={`text-xs mt-1 flex items-center gap-1 ${msgIsUserMessage ? 'text-green-100' : 'text-slate-400'}`}>
                        {msgIsUserMessage && <CheckCheck className="w-3 h-3" />}
                        <span>{formatMessageDate(msg.sentAt || msg.createdAt)}</span>
                      </div>
                    </div>
                    {msgIsUserMessage && (
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">Y</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply/Forward Section */}
      <div className="border-t pt-4">
        {/* Forwarding indicator */}
        {forwardingMessage && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-900 flex items-center">
                <Forward className="w-4 h-4 mr-2 text-blue-600" />
                Forwarding to someone
              </span>
              <button 
                onClick={() => setForwardingMessage(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 mb-2">
              Original: {(forwardingMessage.subject || forwardingMessage.body || '').substring(0, 80)}...
            </div>
          </div>
        )}

        {!replyingTo && !forwardingMessage && (
          <div className="flex items-center space-x-2 mb-4">
            <button 
              onClick={() => handleReply(message)}
              className="flex items-center px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button 
              onClick={() => handleForward(message)}
              className="flex items-center px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </button>
          </div>
        )}

        {replyingTo && (
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-900">Replying to {otherUserName}</span>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-600 mb-2">
              "{(replyingTo.body || replyingTo.content || '').substring(0, 100)}{(replyingTo.body || replyingTo.content || '').length > 100 ? '...' : ''}"
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Emoji Quick Access */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
            {commonEmojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <SmilePlus className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          
          {/* Full Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <div className="grid grid-cols-6 gap-1">
                {commonEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => { addEmoji(emoji); setShowEmojiPicker(false); }}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Reply Textarea */}
          <div className="flex space-x-2">
            <textarea
              placeholder={
                replyingTo 
                  ? "Type your reply..." 
                  : forwardingMessage 
                    ? "Add a note for the forwarded message..."
                    : "Type your message..."
              }
              value={messageReply}
              onChange={(e) => setMessageReply(e.target.value)}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-950 transition-colors resize-none"
              rows={3}
            />
            <button 
              onClick={() => {
                if (replyingTo) {
                  handleSendReplyEnhanced();
                } else if (forwardingMessage) {
                  // Open forward modal - showForwardModal is handled by InboxPanel showing the modal
                  // when both showForwardModal and forwardingMessage are set
                  setShowForwardModal(true);
                } else {
                  handleSendReplyClick();
                }
              }}
              disabled={sendingReply || !messageReply.trim()}
              className="px-6 py-3 bg-slate-950 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingReply ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Settings Panel with Account Security & More Features
const SettingsPanel = ({
  settingsPanelOpen,
  setSettingsPanelOpen,
  userSettings,
  updateSettings,
  userData,
  token,
  onLogout,
  onPasswordChange,
  onDeleteAccount
}) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const settingsSections = {
    notifications: [
      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates', icon: Mail },
      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications', icon: BellRing },
      { key: 'jobAlerts', label: 'Job Alerts', desc: 'New job matches', icon: Briefcase },
      { key: 'messageAlerts', label: 'Message Alerts', desc: 'New messages', icon: MessageSquare },
      { key: 'replyAlerts', label: 'Reply Notifications', desc: 'Replies to your messages', icon: Reply },
      { key: 'applicationUpdates', label: 'Application Updates', desc: 'Status changes', icon: FileText }
    ],
    messages: [
      { key: 'autoReply', label: 'Auto-Reply', desc: 'Send automatic replies', icon: Send },
      { key: 'messageFiltering', label: 'Smart Filtering', desc: 'Filter low-priority messages', icon: Filter },
      { key: 'messagePreview', label: 'Message Preview', desc: 'Show message preview in notifications', icon: Eye },
      { key: 'readReceipts', label: 'Read Receipts', desc: 'Let others know when you read', icon: CheckCheck },
      { key: 'typingIndicators', label: 'Typing Indicators', desc: 'Show when you are typing', icon: Smile }
    ],
    account: [
      { key: 'changePassword', label: 'Change Password', desc: 'Update your password', icon: Key, action: 'password' },
      { key: 'twoFactorAuth', label: 'Two-Factor Authentication', desc: 'Add extra security', icon: Fingerprint },
      { key: 'connectedDevices', label: 'Connected Devices', desc: 'Manage your devices', icon: Smartphone },
      { key: 'exportData', label: 'Export My Data', desc: 'Download your data', icon: Archive },
      { key: 'deleteAccount', label: 'Delete Account', desc: 'Permanently delete your account', icon: Trash2, action: 'delete', danger: true }
    ]
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError('');
    
    try {
      if (onPasswordChange) {
        await onPasswordChange(passwordForm.currentPassword, passwordForm.newPassword);
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }
    
    try {
      if (onDeleteAccount) {
        await onDeleteAccount(deleteReason);
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-screen w-full md:w-[420px] bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${settingsPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header with bg-slate-950 only */}
      <div className="sticky top-0 bg-slate-950 p-5 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <p className="text-white/60 text-xs">Manage your preferences & account</p>
            </div>
          </div>
          <button 
            onClick={() => setSettingsPanelOpen(false)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors border border-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Profile Summary */}
        {userData && (
          <div className="mt-4 flex items-center p-3 bg-slate-900 rounded-xl border border-white/10">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold border border-white/10">
              {userData.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="font-semibold text-white text-sm">{userData.name || 'User'}</p>
              <p className="text-xs text-white/60">{userData.email || ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Tabs */}
      <div className="px-4 py-3 bg-slate-950 border-b border-white/10">
        <div className="flex space-x-1 bg-slate-900 rounded-xl p-1 overflow-x-auto">
          {[
            { id: 'notifications', label: 'Notifications' },
            { id: 'messages', label: 'Messages' },
            { id: 'account', label: 'Account' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            {activeTab === 'notifications' && <Bell className="w-5 h-5 mr-2 text-white" />}
            {activeTab === 'messages' && <MessageSquare className="w-5 h-5 mr-2 text-white" />}
            {activeTab === 'account' && <User className="w-5 h-5 mr-2 text-white" />}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>
          {activeTab === 'account' && (
            <button
              onClick={onLogout}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          )}
        </div>

        {/* Settings Cards */}
        <div className="space-y-3">
          {settingsSections[activeTab]?.map((setting, index) => {
            const IconComponent = setting.icon;
            return (
              <div 
                key={setting.key} 
                className={`group p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  setting.danger 
                    ? 'hover:border-red-200 hover:bg-red-50' 
                    : 'hover:border-slate-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {setting.action === 'password' ? (
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl bg-slate-900 ${setting.danger ? '' : ''}`}>
                        <IconComponent className={`w-5 h-5 ${setting.danger ? 'text-red-400' : 'text-white'}`} />
                      </div>
                      <div className="ml-4">
                        <p className={`font-semibold text-slate-900 text-sm ${setting.danger ? 'text-red-600' : ''}`}>{setting.label}</p>
                        <p className="text-sm text-slate-500">{setting.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-500 transition-colors" />
                  </button>
                ) : setting.action === 'delete' ? (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-slate-900">
                        <IconComponent className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-red-600 text-sm">{setting.label}</p>
                        <p className="text-sm text-slate-500">{setting.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 rounded-xl bg-slate-900">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-slate-900 text-sm">{setting.label}</p>
                        <p className="text-sm text-slate-500">{setting.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSettings(setting.key, !userSettings[setting.key])}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                        userSettings[setting.key] 
                          ? 'bg-slate-900' 
                          : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          userSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* App Version */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/40">MissionHub v2.0.0</p>
          <p className="text-xs text-white/30">Made with care for job seekers</p>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Key className="w-6 h-6 mr-2 text-slate-600" />
                Change Password
              </h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Enter current password"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{passwordError}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:from-slate-700 to-slate-900 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {passwordLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform animate-scale-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Account</h3>
            <p className="text-slate-500 text-center mb-6">
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Why are you leaving? (Optional)</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="found_job">Found a job</option>
                  <option value="not_finding_jobs">Not finding relevant jobs</option>
                  <option value="privacy_concerns">Privacy concerns</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main component with API integration
const NotificationInboxSettingsPanels = ({
  notificationPanelOpen,
  setNotificationPanelOpen,
  inboxPanelOpen,
  setInboxPanelOpen,
  settingsPanelOpen,
  setSettingsPanelOpen,
  userSettings = {},
  updateSettings = () => {},
  token,
  userId,
  userType
}) => {
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReply, setMessageReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs to track ongoing fetches to prevent duplicates
  const fetchingNotificationsRef = useRef(false);
  const fetchingMessagesRef = useRef(false);

  // Helper function to safely get user ID
  const getUserId = useCallback((user) => {
    if (!user) return null;
    if (typeof user === 'string') return user;
    return user._id || user.id || user.userId;
  }, []);

  // Calculate unread counts
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = messages.filter(m => !m.read && getUserId(m.toUserId) === userId).length;

  // Fetch notifications with debounce
  const fetchNotifications = useCallback(async () => {
    if (fetchingNotificationsRef.current || !token || !userId) return;
    fetchingNotificationsRef.current = true;
    
    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: { notifications: [] } or { data: [] }
        const allNotifications = data.notifications || data.data || [];
        const userNotifications = allNotifications.filter(notification => {
          const notificationUserId = getUserId(notification.userId);
          return notificationUserId === userId;
        });
        setNotifications(userNotifications);
      } else if (response.status === 429) {
        console.warn('Rate limited - notifications');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      fetchingNotificationsRef.current = false;
    }
  }, [token, userId, getUserId]);

  // Fetch messages with debounce
  const fetchMessages = useCallback(async () => {
    if (fetchingMessagesRef.current || !token || !userId) return;
    fetchingMessagesRef.current = true;
    
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: { inbox: [], sent: [] } or { data: [] }
        const allMessages = data.inbox || data.sent || data.data || [];
        // Sort messages: newest first
        const sortedMessages = allMessages.sort((a, b) => {
          const dateA = new Date(a.sentAt || a.createdAt || 0);
          const dateB = new Date(b.sentAt || b.createdAt || 0);
          return dateB - dateA;
        });
        const userMessages = sortedMessages.filter(message => {
          if (!message) return false;
          const fromUserId = getUserId(message.fromUserId);
          const toUserId = getUserId(message.toUserId);
          return fromUserId === userId || toUserId === userId;
        });
        setMessages(userMessages);
        // Auto-select first (newest) message if none selected
        if (!selectedMessage && userMessages.length > 0) {
          setSelectedMessage(userMessages[0]);
        }
      } else if (response.status === 429) {
        console.warn('Rate limited - messages');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching messages:', error);
      }
    } finally {
      fetchingMessagesRef.current = false;
    }
  }, [token, userId, getUserId]);

  // Fetch conversation with a specific user - with fallback
  const fetchConversation = async (otherUserId) => {
    if (!otherUserId) return { messages: [] };
    
    try {
      // Try the direct endpoint first
      const response = await fetch(`/api/messages/conversation/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userConversationMessages = (data.messages || []).filter(message => {
          if (!message) return false;
          const fromUserId = getUserId(message.fromUserId);
          const toUserId = getUserId(message.toUserId);
          return fromUserId === userId || toUserId === userId;
        });
        return { messages: userConversationMessages };
      }
      
      // If 404 or other error, try alternative endpoint
      if (response.status === 404) {
        // Try filtering from all messages
        const allMessagesResponse = await fetch(`${API_BASE}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (allMessagesResponse.ok) {
          const allData = await allMessagesResponse.json();
          const messages = allData.messages || allData.data || allData || [];
          const filtered = messages.filter(m => {
            const fromId = getUserId(m.fromUserId);
            const toId = getUserId(m.toUserId);
            return fromId === otherUserId || toId === otherUserId;
          });
          return { messages: filtered };
        }
      }
      
      return { messages: [] };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return { messages: [] };
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            (n.id === notificationId || n._id === notificationId) 
              ? { ...n, read: true } 
              : n
          )
        );
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
      } else {
        console.error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(n => (n.id !== notificationId && n._id !== notificationId))
        );
      } else {
        console.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => 
          prev.map(m => 
            (m.id === messageId || m._id === messageId) 
              ? { ...m, read: true } 
              : m
          )
        );
      } else {
        console.error('Failed to mark message as read');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => 
          prev.filter(m => (m.id !== messageId && m._id !== messageId))
        );
        
        if (selectedMessage && (selectedMessage.id === messageId || selectedMessage._id === messageId)) {
          setSelectedMessage(null);
        }
      } else {
        console.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Send message reply - simplified to just send a new message to the recipient
  const sendMessageReply = async (messageId, replyContent, replyType = 'reply') => {
    try {
      // Get the original message to find who to reply to
      let toUserId = null;
      
      // If replying to a specific message, we need to find the recipient
      if (replyingTo) {
        const isOriginalFromUser = getUserId(replyingTo.fromUserId) === userId;
        toUserId = isOriginalFromUser 
          ? getUserId(replyingTo.toUserId) 
          : getUserId(replyingTo.fromUserId);
      }
      
      // Use the reply endpoint or fallback to regular message
      let response;
      
      if (toUserId) {
        // Send as a regular message to the recipient
        response = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            toUserId: toUserId,
            subject: `Re: ${replyingTo?.subject || 'Message'}`,
            body: replyContent,
            replyToMessageId: replyingTo?._id || replyingTo?.id
          })
        });
      } else {
        // Fallback to reply endpoint
        response = await fetch(`/api/messages/reply/${messageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            body: replyContent
          })
        });
      }
      
      if (response.ok) {
        await fetchMessages();
        
        if (selectedMessage) {
          const otherUserId = getUserId(selectedMessage.fromUserId) === userId 
            ? getUserId(selectedMessage.toUserId)
            : getUserId(selectedMessage.fromUserId);
          
          if (otherUserId) {
            const conversationData = await fetchConversation(otherUserId);
            window.dispatchEvent(new CustomEvent('conversationUpdated', { 
              detail: { messages: conversationData.messages } 
            }));
          }
        }
        
        return true;
      } else {
        console.error('Failed to send reply, status:', response.status);
        // Try alternative approach - direct message
        const altResponse = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            toUserId: messageId,
            body: replyContent
          })
        });
        
        if (altResponse.ok) {
          await fetchMessages();
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      return false;
    }
  };

  // Navigate to related content from notifications
  const navigateToRelatedContent = (type, id) => {
    if (type === 'message') {
      const message = messages.find(m => {
        const messageId = m._id || m.id;
        return messageId === id;
      });
      
      if (message) {
        setSelectedMessage(message);
        markMessageAsRead(message._id || message.id);
        setNotificationPanelOpen(false);
        setInboxPanelOpen(true);
      }
    } else if (type === 'job' || type === 'application') {
      // Navigate to job card - close notification panel and let parent handle navigation
      setNotificationPanelOpen(false);
      window.dispatchEvent(new CustomEvent('navigateToJob', { detail: { jobId: id, type } }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!token || !userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchNotifications(),
          fetchMessages()
        ]);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [token, userId, fetchNotifications, fetchMessages]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!token || !userId) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
      fetchMessages();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [token, userId, fetchNotifications, fetchMessages]);

  // Listen for conversation updates
  useEffect(() => {
    const handleConversationUpdate = (event) => {
      if (selectedMessage && event.detail && event.detail.messages) {
        setSelectedMessage(prev => {
          if (!prev) return prev;
          return { ...prev, conversationHistory: event.detail.messages };
        });
      }
    };
    
    window.addEventListener('conversationUpdated', handleConversationUpdate);
    
    return () => {
      window.removeEventListener('conversationUpdated', handleConversationUpdate);
    };
  }, [selectedMessage]);

  if (loading && notifications.length === 0 && messages.length === 0) {
    return (
      <div className="fixed right-0 top-0 h-screen w-full md:w-[420px] bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-2xl z-50">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-slate-700 animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-slate-200 border-t-slate-700 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-600 font-medium mt-4">Loading your data...</p>
          <p className="text-slate-400 text-sm">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <NotificationPanel
          notificationPanelOpen={notificationPanelOpen}
          setNotificationPanelOpen={setNotificationPanelOpen}
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
          markAllNotificationsAsRead={markAllNotificationsAsRead}
          deleteNotification={deleteNotification}
          navigateToRelatedContent={navigateToRelatedContent}
          unreadCount={unreadNotificationsCount}
        />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <InboxPanel
          inboxPanelOpen={inboxPanelOpen}
          setInboxPanelOpen={setInboxPanelOpen}
          messages={messages}
          selectedMessage={selectedMessage}
          setSelectedMessage={setSelectedMessage}
          markMessageAsRead={markMessageAsRead}
          deleteMessage={deleteMessage}
          messageReply={messageReply}
          setMessageReply={setMessageReply}
          sendMessageReply={sendMessageReply}
          fetchConversation={fetchConversation}
          userType={userType}
          userId={userId}
          token={token}
          setNotificationPanelOpen={setNotificationPanelOpen}
          fetchMessages={fetchMessages}
        />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <SettingsPanel
          settingsPanelOpen={settingsPanelOpen}
          setSettingsPanelOpen={setSettingsPanelOpen}
          userSettings={userSettings}
          updateSettings={updateSettings}
          userData={userSettings.userData}
          token={token}
          onLogout={userSettings.onLogout}
          onPasswordChange={userSettings.onPasswordChange}
          onDeleteAccount={userSettings.onDeleteAccount}
        />
      </ErrorBoundary>
    </>
  );
};

export default NotificationInboxSettingsPanels;