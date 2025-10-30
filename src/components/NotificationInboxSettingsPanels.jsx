// Updated NotificationInboxSettingsPanels.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Briefcase, FileText, UserCircle, MessageSquare,
  CheckSquare, Trash2, Inbox, Reply, Forward, Send,
  Clock, MapPin, DollarSign, Calendar, Building, Bell,
  Search, Filter, MoreVertical, Eye, EyeOff
} from 'lucide-react';

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

// Enhanced Notification Panel
const NotificationPanel = ({
  notificationPanelOpen,
  setNotificationPanelOpen,
  notifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  navigateToRelatedContent,
  unreadCount
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
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
  };

  // Filter notifications based on current filter and search term
  const filteredNotifications = notifications.filter(notification => {
    if (!notification) return false;
    
    // Apply type filter
    if (filter !== 'all' && notification.type !== filter) {
      return false;
    }
    
    // Apply search filter
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
        return <Briefcase className="w-4 h-4" />;
      case 'application':
        return <FileText className="w-4 h-4" />;
      case 'profile':
        return <UserCircle className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'reply':
        return <Reply className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-600';
      case 'application':
        return 'bg-green-100 text-green-600';
      case 'profile':
        return 'bg-purple-100 text-purple-600';
      case 'message':
        return 'bg-orange-100 text-orange-600';
      case 'reply':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${notificationPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-gray-500 text-sm mt-1">Stay updated on your activities</p>
          </div>
          <button 
            onClick={() => setNotificationPanelOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
              { id: 'application', label: 'Applications', count: notifications.filter(n => n.type === 'application').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    filter === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {filteredNotifications.filter(n => !n.read).length} Unread
            </h3>
            <p className="text-sm text-gray-500">Updates & alerts</p>
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={markAllNotificationsAsRead}
              className="px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium flex items-center"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id || notification._id} 
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                notification.read 
                  ? 'bg-white border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              } ${
                notification.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
              }`}
              onClick={() => {
                if (notification.relatedId && notification.relatedType) {
                  navigateToRelatedContent(notification.relatedType, notification.relatedId);
                }
                if (!notification.read) {
                  markNotificationAsRead(notification.id || notification._id);
                }
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center flex-1">
                  <div className={`p-2 rounded-lg mr-3 ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notification.date || notification.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 ml-2">
                  {!notification.read && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(notification.id || notification._id);
                      }}
                      className="p-1 rounded-full hover:bg-white transition-colors"
                      title="Mark as read"
                    >
                      <EyeOff className="w-4 h-4 text-green-500" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id || notification._id);
                    }}
                    className="p-1 rounded-full hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {notification.message}
              </p>

              {/* Job/Application Specific Details */}
              {notification.jobDetails && (
                <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {notification.jobDetails.title}
                    </span>
                    {notification.jobDetails.salary && (
                      <span className="flex items-center text-green-600 text-xs font-medium">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {notification.jobDetails.salary}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-600 space-x-3">
                    {notification.jobDetails.company && (
                      <span className="flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {notification.jobDetails.company}
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
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      notification.jobDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                      notification.jobDetails.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      notification.jobDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {notification.jobDetails.status}
                    </div>
                  )}
                </div>
              )}

              {/* Message Reply Specific Details */}
              {notification.messageDetails && (
                <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      Re: {notification.messageDetails.subject}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {notification.messageDetails.preview}
                  </p>
                </div>
              )}

              {/* Action Buttons for Notifications */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex space-x-2 pt-2 border-t border-gray-200">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof action.handler === 'function') {
                          action.handler();
                        }
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        action.primary 
                          ? 'bg-gray-900 text-white hover:bg-gray-800' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No notifications found' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500 text-sm">
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

// Enhanced Inbox Panel
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
  token
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
  const messagesEndRef = useRef(null);

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
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
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
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setMessageReply('');
    setForwardingMessage(null);
    setShowNewMessageForm(false);
  };

  const handleForward = (message) => {
    setForwardingMessage(message);
    setReplyingTo(null);
    setMessageReply('');
    setShowNewMessageForm(false);
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
        // Find the recipient user from our extracted users
        const recipient = users.find(u => 
          getUserName(u).toLowerCase().includes(newMessageRecipient.toLowerCase()) ||
          (u.email && u.email.toLowerCase().includes(newMessageRecipient.toLowerCase()))
        );
        
        if (!recipient) {
          setUsersError("Recipient not found. Please select a user from your previous conversations.");
          setSendingMessage(false);
          return;
        }
        
        // Send the message via API
        const response = await fetch('/api/messages', {
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
    
    // Mark as read if unread and recipient is current user
    if (!message.read && getUserId(message.toUserId) === userId) {
      await markMessageAsRead(message._id || message.id);
    }
    
    // Fetch conversation history
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
    <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${inboxPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <p className="text-gray-500 text-sm mt-1">Communicate with others</p>
          </div>
          <button 
            onClick={() => setInboxPanelOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
          />
        </div>

        {/* Message Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { id: 'all', label: 'All', count: userMessages.length },
            { id: 'unread', label: 'Unread', count: userMessages.filter(m => !m.read).length },
            { id: 'jobs', label: 'Jobs', count: userMessages.filter(m => m.type === 'job_related').length },
            { id: 'applications', label: 'Applications', count: userMessages.filter(m => m.type === 'application_related').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-5">
        {/* New Message Button */}
        {!selectedMessage && !showNewMessageForm && (
          <button
            onClick={() => setShowNewMessageForm(true)}
            className="w-full mb-5 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Compose New Message
          </button>
        )}

        {showNewMessageForm ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Message</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                {loadingUsers ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  </div>
                ) : usersError ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">{usersError}</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newMessageRecipient}
                      onChange={(e) => setNewMessageRecipient(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
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
                    <p className="text-xs text-gray-500 mt-1">
                      Available recipients from your previous conversations
                    </p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newMessageSubject}
                  onChange={(e) => setNewMessageSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  rows={4}
                  placeholder="Type your message here..."
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSendNewMessage}
                  disabled={sendingMessage || !newMessage.trim() || !newMessageSubject.trim() || !newMessageRecipient.trim()}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
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
            searchTerm={searchTerm}
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
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
              message.read 
                ? 'bg-white border-gray-200' 
                : 'bg-blue-50 border-blue-200'
            } ${
              message.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
            }`}
            onClick={() => onSelectMessage(message)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                  isUserMessage 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 text-white'
                }`}>
                  {isUserMessage ? 'You' : getInitials(otherUserName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {isUserMessage ? 'You' : otherUserName}
                      </h4>
                      {isUserMessage && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Sent
                        </span>
                      )}
                      {!message.read && !isUserMessage && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatMessageDate(message.sentAt || message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mt-1 line-clamp-1">
                    {message.subject || 'No Subject'}
                  </p>
                  {message.jobId && message.jobId.title && (
                    <div className="flex items-center mt-1">
                      <Briefcase className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-600">{message.jobId.title}</span>
                    </div>
                  )}
                </div>
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
            
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
              {message.body || message.content || 'No content'}
            </p>

            {/* Quick Actions */}
            <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReply(message);
                }}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
              >
                <Reply className="w-3 h-3 mr-1" />
                Reply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleForward(message);
                }}
                className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs font-medium"
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm 
              ? 'No messages found' 
              : activeTab === 'all' ? 'No messages yet' :
                activeTab === 'unread' ? 'No unread messages' :
                activeTab === 'jobs' ? 'No job messages' : 'No application messages'
            }
          </h3>
          <p className="text-gray-500 text-sm">
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
  getUserName
}) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

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
              setConversationHistory(data.messages || data || []);
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
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSendReplyEnhanced = async () => {
    if (replyingTo && messageReply.trim()) {
      setSendingReply(true);
      try {
        await sendMessageReply(replyingTo._id || replyingTo.id, messageReply, 'reply');
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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-900 hover:text-gray-700 font-medium text-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Back to inbox
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4" data-message-detail="true">
      <div className="flex items-center justify-between mb-5">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-900 hover:text-gray-700 font-medium text-sm"
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
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{message.subject || 'No Subject'}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-3 ${
              isUserMessage 
                ? 'bg-green-500 text-white'
                : 'bg-gray-900 text-white'
            }`}>
              {isUserMessage ? 'You' : otherUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {isUserMessage ? 'You' : otherUserName}
              </p>
              <p className="text-sm text-gray-600">
                {isUserMessage ? (userType === 'jobSeeker' ? 'Candidate' : 'Employer') : (userType === 'jobSeeker' ? 'Employer' : 'Candidate')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatMessageDate(message.sentAt || message.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Job Context */}
        {message.jobId && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 text-sm">{message.jobId.title}</span>
            </div>
            <div className="flex items-center text-xs text-gray-600 space-x-3">
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
      <div className="mb-5 space-y-4 max-h-96 overflow-y-auto">
        <h4 className="font-medium text-gray-900 text-sm mb-3">Conversation History</h4>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          (Array.isArray(conversationHistory) ? conversationHistory : []).map(msg => {
            if (!msg) return null;
            
            const msgIsUserMessage = getUserId(msg.fromUserId) === userId;
            const msgOtherUserName = msgIsUserMessage 
              ? getUserName(msg.toUserId)
              : getUserName(msg.fromUserId);
            
            return (
              <div 
                key={msg._id || msg.id}
                className={`p-3 rounded-lg ${
                  msgIsUserMessage
                    ? 'bg-green-50 border border-green-200 ml-8' 
                    : 'bg-gray-50 border border-gray-200 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2 ${
                      msgIsUserMessage
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-900 text-white'
                    }`}>
                      {msgIsUserMessage ? 'Y' : msgOtherUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 text-sm">
                        {msgIsUserMessage ? 'You' : msgOtherUserName}
                      </span>
                      {msgIsUserMessage && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Sent
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatMessageDate(msg.sentAt || msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                  {msg.body || msg.content || 'No content'}
                </p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply/Forward Section */}
      <div className="border-t pt-4">
        {!replyingTo && !forwardingMessage && (
          <div className="flex items-center space-x-2 mb-4">
            <button 
              onClick={() => handleReply(message)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button 
              onClick={() => handleForward(message)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </button>
          </div>
        )}

        {replyingTo && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Replying to {otherUserName}</span>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              "{(replyingTo.body || replyingTo.content || '').substring(0, 100)}{(replyingTo.body || replyingTo.content || '').length > 100 ? '...' : ''}"
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <textarea
            placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
            value={messageReply}
            onChange={(e) => setMessageReply(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            rows={3}
          />
          <button 
            onClick={replyingTo ? handleSendReplyEnhanced : () => sendMessageReply(message._id || message.id, messageReply)}
            disabled={sendingReply || !messageReply.trim()}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingReply ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Panel
const SettingsPanel = ({
  settingsPanelOpen,
  setSettingsPanelOpen,
  userSettings,
  updateSettings
}) => {
  const [activeTab, setActiveTab] = useState('notifications');

  const settingsSections = {
    notifications: [
      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates' },
      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications' },
      { key: 'jobAlerts', label: 'Job Alerts', desc: 'New job matches' },
      { key: 'messageAlerts', label: 'Message Alerts', desc: 'New messages' },
      { key: 'replyAlerts', label: 'Reply Notifications', desc: 'Replies to your messages' },
      { key: 'applicationUpdates', label: 'Application Updates', desc: 'Status changes' }
    ],
    messages: [
      { key: 'autoReply', label: 'Auto-Reply', desc: 'Send automatic replies' },
      { key: 'messageFiltering', label: 'Smart Filtering', desc: 'Filter low-priority messages' },
      { key: 'messagePreview', label: 'Message Preview', desc: 'Show message preview in notifications' }
    ],
    privacy: [
      { key: 'readReceipts', label: 'Read Receipts', desc: 'Let others know when you read their messages' },
      { key: 'onlineStatus', label: 'Online Status', desc: 'Show when you are online' },
      { key: 'profileVisibility', label: 'Profile Visibility', desc: 'Control who can see your profile' }
    ]
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${settingsPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="sticky top-0 bg-white border-b border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your preferences</p>
          </div>
          <button 
            onClick={() => setSettingsPanelOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Settings Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'notifications', label: 'Notifications' },
            { id: 'messages', label: 'Messages' },
            { id: 'privacy', label: 'Privacy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4 capitalize">
              {activeTab} Settings
            </h3>
            {settingsSections[activeTab]?.map(setting => (
              <div key={setting.key} className="flex items-center justify-between mb-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{setting.label}</p>
                  <p className="text-sm text-gray-500">{setting.desc}</p>
                </div>
                <button
                  onClick={() => updateSettings(setting.key, !userSettings[setting.key])}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    userSettings[setting.key] ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      userSettings[setting.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
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

  // Helper function to safely get user ID
  const getUserId = useCallback((user) => {
    if (!user) return null;
    if (typeof user === 'string') return user;
    return user._id || user.id || user.userId;
  }, []);

  // Calculate unread counts
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadMessagesCount = messages.filter(m => !m.read && getUserId(m.toUserId) === userId).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userNotifications = (data.notifications || []).filter(notification => {
          const notificationUserId = getUserId(notification.userId);
          return notificationUserId === userId;
        });
        setNotifications(userNotifications);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allMessages = [
          ...(data.inbox || []),
          ...(data.sent || [])
        ];
        const userMessages = allMessages.filter(message => {
          if (!message) return false;
          const fromUserId = getUserId(message.fromUserId);
          const toUserId = getUserId(message.toUserId);
          return fromUserId === userId || toUserId === userId;
        });
        setMessages(userMessages);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch conversation with a specific user
  const fetchConversation = async (otherUserId) => {
    try {
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
        return { ...data, messages: userConversationMessages };
      } else {
        console.error('Failed to fetch conversation');
        return { messages: [] };
      }
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
      const response = await fetch('/api/notifications/read-all', {
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

  // Send message reply
  const sendMessageReply = async (messageId, replyContent, replyType = 'reply') => {
    try {
      let response;
      
      if (replyType === 'reply') {
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
      } else {
        response = await fetch('/api/messages', {
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
        console.error('Failed to send reply');
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
  }, [token, userId]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!token || !userId) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
      fetchMessages();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [token, userId]);

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
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
        />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <SettingsPanel
          settingsPanelOpen={settingsPanelOpen}
          setSettingsPanelOpen={setSettingsPanelOpen}
          userSettings={userSettings}
          updateSettings={updateSettings}
        />
      </ErrorBoundary>
    </>
  );
};

export default NotificationInboxSettingsPanels;