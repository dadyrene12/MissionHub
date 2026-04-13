import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, X, Sparkles, Send, Check, CheckCheck, 
  HelpCircle, Briefcase, Users, FileText, TrendingUp, 
  ChevronRight, Clock, Info, Lightbulb, ArrowRight
} from 'lucide-react';

const ChatAssistant = ({
  chatOpen,
  setChatOpen,
  chatMessages,
  newMessage,
  setNewMessage,
  sendMessage,
  aiThinking,
  chatEndRef,
  formatTimestamp
}) => {
  const [quickActions, setQuickActions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedMessage, setExpandedMessage] = useState(null);

  // Categories for quick actions
  const categories = [
    {
      id: 'jobs',
      name: 'Jobs',
      icon: Briefcase,
      color: 'blue',
      questions: [
        'How do I post a new job?',
        'How can I find the best candidates?',
        'What makes a job posting effective?',
        'How do I manage applications?'
      ]
    },
    {
      id: 'applicants',
      name: 'Applicants',
      icon: Users,
      color: 'green',
      questions: [
        'How do I review applications?',
        'What should I look for in a candidate?',
        'How do I schedule interviews?',
        'How do I send rejection emails?'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      color: 'purple',
      questions: [
        'How do I track my hiring metrics?',
        'What analytics are available?',
        'How can I improve my hiring process?',
        'What is my conversion rate?'
      ]
    },
    {
      id: 'general',
      name: 'General',
      icon: HelpCircle,
      color: 'gray',
      questions: [
        'How do I update my profile?',
        'How do I use the messaging system?',
        'How do I set up notifications?',
        'Where can I find help documentation?'
      ]
    }
  ];

  // System information
  const systemInfo = {
    name: 'Mission Hub',
    version: '2.0.1',
    features: [
      'Job posting and management',
      'Application tracking and review',
      'Candidate communication tools',
      'Analytics and reporting',
      'Email notifications',
      'Image uploads for job postings'
    ],
    tips: [
      'Use keywords in job titles to improve visibility',
      'Respond to applications within 48 hours',
      'Use the bulk actions feature to save time',
      'Set up email notifications to stay updated'
    ]
  };

  // Toggle quick actions
  const toggleQuickActions = () => {
    setQuickActions(!quickActions);
    setSelectedCategory(null);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Handle question selection
  const handleQuestionSelect = (question) => {
    setNewMessage(question);
    setQuickActions(false);
    setSelectedCategory(null);
  };

  // Toggle message expansion
  const toggleMessageExpansion = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiThinking]);

  return (
    <>
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl z-40 transition-all duration-300 transform ${
          chatOpen 
            ? 'bg-red-600 hover:bg-red-700 rotate-90' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-110'
        } text-white flex items-center justify-center group`}
        title="AI Mission Assistant"
      >
        {chatOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <>
            <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <Sparkles className="absolute w-4 h-4 text-yellow-300 -top-1 -right-1 animate-pulse" />
          </>
        )}
      </button>
      
      {chatOpen && (
        <div className={`fixed bottom-24 right-6 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden transition-all duration-300 animate-slideUp border border-gray-100`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sparkles className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="font-semibold">AI Mission Assistant</span>
                <div className="text-xs opacity-80">v{systemInfo.version}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setQuickActions(!quickActions)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                title="Quick Actions"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChatOpen(false)} 
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {quickActions && (
            <div className="p-4 bg-gray-50 border-b border-gray-100 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                  Quick Actions
                </h3>
                <button 
                  onClick={toggleQuickActions}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Hide
                </button>
              </div>
              
              {/* Categories */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`flex items-center p-2 rounded-lg transition-all ${
                        selectedCategory === category.id
                          ? `bg-${category.color}-100 text-${category.color}-700 border border-${category.color}-200`
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Questions for selected category */}
              {selectedCategory && (
                <div className="mt-3 space-y-2">
                  {categories
                    .find(cat => cat.id === selectedCategory)
                    .questions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionSelect(question)}
                        className="w-full text-left p-2 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-sm flex items-center"
                      >
                        <span className="flex-1">{question}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </button>
                    ))}
                </div>
              )}
              
              {/* System Info */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <Info className="w-4 h-4 mr-2 text-blue-600" />
                  <h4 className="font-medium text-blue-900 text-sm">Did you know?</h4>
                </div>
                <p className="text-xs text-blue-800">
                  {systemInfo.tips[Math.floor(Math.random() * systemInfo.tips.length)]}
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={chatEndRef}>
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Welcome to Mission Hub Assistant</h3>
                <p className="text-sm text-gray-600 mb-4">
                  I'm here to help you navigate the platform and answer any questions you might have.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Try asking:</p>
                  {['How do I post a job?', 'How do I review applications?', 'Where can I find analytics?'].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setNewMessage(example)}
                      className="block w-full text-left p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatMessages.map(message => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Expandable content for AI messages */}
                  {!message.isUser && message.text.length > 100 && (
                    <button
                      onClick={() => toggleMessageExpansion(message.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {expandedMessage === message.id ? 'Show less' : 'Show more'}
                      <ChevronRight className={`w-3 h-3 ml-1 transform transition-transform ${
                        expandedMessage === message.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  )}
                  
                  <div className={`flex items-center justify-end mt-2 space-x-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.isUser && (
                      message.status === 'read' ? <CheckCheck className="w-3 h-3" /> :
                      message.status === 'delivered' ? <Check className="w-3 h-3" /> : null
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {aiThinking && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm bg-gray-100 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={aiThinking}
              />
              <button
                onClick={sendMessage}
                disabled={aiThinking || !newMessage.trim()}
                className={`p-2 rounded-full transition-all ${
                  (aiThinking || !newMessage.trim()) 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            {/* System info footer */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              Powered by Mission Hub AI • {systemInfo.features.length} features available
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;