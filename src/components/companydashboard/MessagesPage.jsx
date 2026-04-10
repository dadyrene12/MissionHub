import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Search as SearchIcon, Loader2, Inbox,
  CheckCheck, Trash2, Edit2, X, Check, SendHorizontal, SmilePlus,
  ArrowLeft, PhoneCall, Video, MoreVertical, Send
} from 'lucide-react';
import { apiFetch } from './CompanyDashboardUtils';

const EMOJI_CATEGORIES = {
  recent: ['\u{1F600}', '\u{1F602}', '\u{1F60A}', '\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F525}', '\u{1F389}', '\u{1F4AF}'],
  smileys: ['\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F60C}', '\u{1F60E}', '\u{1F913}', '\u{1F61C}', '\u{1F61E}', '\u{1F620}', '\u{1F621}', '\u{1F622}', '\u{1F623}', '\u{1F629}', '\u{1F630}', '\u{1F631}', '\u{1F632}', '\u{1F635}', '\u{1F637}', '\u{1F642}', '\u{1F643}', '\u{1F644}', '\u{1F645}', '\u{1F646}', '\u{1F647}', '\u{1F648}', '\u{1F649}', '\u{1F64A}'],
  gestures: ['\u{1F44B}', '\u{1F44C}', '\u{1F44D}', '\u{1F44E}', '\u{1F44F}', '\u{1F450}', '\u{270A}', '\u{270B}', '\u{270C}\u{FE0F}', '\u{270D}\u{FE0F}', '\u{1F91D}', '\u{1F91E}', '\u{1F91F}', '\u{1F64C}', '\u{1F64F}', '\u{1F9CD}', '\u{1F9CE}', '\u{1F9CF}', '\u{1FAF6}'],
  hearts: ['\u{2764}\u{FE0F}', '\u{1F493}', '\u{1F495}', '\u{1F496}', '\u{1F497}', '\u{1F498}', '\u{1F499}', '\u{1F49A}', '\u{1F49B}', '\u{1F49C}', '\u{1F49D}', '\u{1F49E}', '\u{1F49F}', '\u{1F90D}', '\u{1F90E}', '\u{1FA77}'],
  symbols: ['\u{1F4AF}', '\u{1F4AB}', '\u{1F4AA}', '\u{1F3C6}', '\u{1F3C5}', '\u{1F947}', '\u{1F948}', '\u{1F949}', '\u{2728}', '\u{1F31F}', '\u{1F308}', '\u{2B50}', '\u{1F520}', '\u{1F523}', '\u{1F4E4}', '\u{1F4E3}', '\u{2705}', '\u{274C}', '\u{274E}', '\u{27B0}', '\u{27BF}']
};

export const MessagesPage = ({ token, user, showToast }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('recent');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { 
    fetchConversations(); 
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const checkMobileView = () => {
    setIsMobileView(window.innerWidth < 1024);
  };

  const fetchConversations = async () => {
    setLoading(true);
    const res = await apiFetch('/messages/conversations');
    if (res.ok && res.data?.success) {
      const convData = res.data?.data || [];
      const formatted = convData.map(conv => ({
        user: conv.user,
        lastMessage: conv.lastMessage,
        messages: [],
        unread: conv.unreadCount || 0
      }));
      setConversations(formatted);
    }
    setLoading(false);
  };

  const fetchChatMessages = async (conversation) => {
    setLoadingChat(true);
    setSelectedConversation(conversation);
    
    const userId = conversation.user?._id || conversation.user;
    if (userId) {
      const res = await apiFetch(`/messages/${userId}`);
      if (res.ok && res.data?.success) {
        const msgs = res.data?.data || [];
        const sortedMessages = [...msgs].sort((a, b) => 
          new Date(a.sentAt || a.createdAt) - new Date(b.sentAt || b.createdAt)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
    
    setLoadingChat(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    setSending(true);
    const toUserId = selectedConversation.user?._id || selectedConversation.user;
    
    const res = await apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ toUserId, body: replyText.trim(), subject: '' })
    });

    if (res.ok && res.data.success) {
      setReplyText('');
      fetchChatMessages(selectedConversation);
      fetchConversations();
    } else {
      showToast('Failed to send message', 'error');
    }
    setSending(false);
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Delete this message?')) return;
    
    const res = await apiFetch(`/messages/${messageId}`, { method: 'DELETE' });
    if (res.ok && res.data?.success) {
      showToast('Message deleted', 'success');
      fetchChatMessages(selectedConversation);
    } else {
      showToast('Failed to delete message', 'error');
    }
  };

  const handleEdit = async (messageId) => {
    if (!editText.trim()) return;
    
    const res = await apiFetch(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ body: editText.trim() })
    });
    
    if (res.ok && res.data?.success) {
      showToast('Message updated', 'success');
      setEditingMessage(null);
      setEditText('');
      fetchChatMessages(selectedConversation);
    } else {
      showToast('Failed to update message', 'error');
    }
  };

  const addEmoji = (emoji) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const filteredConversations = conversations.filter(conv => 
    !searchQuery || 
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      'from-rose-500 to-rose-700',
      'from-violet-500 to-violet-700',
      'from-cyan-500 to-cyan-700',
      'from-emerald-500 to-emerald-700',
      'from-amber-500 to-amber-700',
      'from-blue-500 to-blue-700',
      'from-pink-500 to-pink-700',
      'from-indigo-500 to-indigo-700',
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-100">
      {/* Left Sidebar - Dark Theme */}
      <div className={`w-full lg:w-80 xl:w-96 bg-slate-950 flex flex-col ${isMobileView && selectedConversation ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-slate-900" />
            </div>
            <h2 className="text-lg font-bold text-white">Messages</h2>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No conversations</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const convUserId = conv.user?._id || conv.user;
              return (
                <div 
                  key={convUserId}
                  onClick={() => fetchChatMessages(conv)}
                  className={`p-3 border-b border-white/5 cursor-pointer transition-all ${selectedConversation?.user?._id === convUserId ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(conv.user?.name)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {getInitials(conv.user?.name)}
                      </div>
                      {conv.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conv.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white truncate">{conv.user?.name || 'User'}</span>
                        <span className="text-xs text-slate-500">{formatTime(conv.lastMessage?.sentAt)}</span>
                      </div>
                      <p className="text-sm text-slate-400 truncate">{conv.lastMessage?.body || 'No messages'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Chat Area - Light Theme */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${isMobileView && !selectedConversation ? 'hidden' : ''}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header - Dark */}
            <div className="p-3 bg-slate-950 border-b border-white/10 flex items-center gap-3">
              {isMobileView && (
                <button onClick={() => setSelectedConversation(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-slate-300" />
                </button>
              )}
              <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(selectedConversation.user?.name)} rounded-full flex items-center justify-center text-white font-bold`}>
                {getInitials(selectedConversation.user?.name)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{selectedConversation.user?.name || 'User'}</h3>
                <p className="text-xs text-emerald-400">Online</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                  <PhoneCall className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                </div>
              ) : (
                messages.map((msg) => {
                  const msgFromId = msg.fromUserId?._id || msg.fromUserId;
                  const isOwn = String(msgFromId) === String(user._id);
                  
                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        {/* Message Bubble */}
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-slate-900 text-white rounded-br-sm' 
                            : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200'
                        }`}>
                          {editingMessage === msg._id ? (
                            <div>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className={`w-full px-2 py-1 rounded text-sm ${isOwn ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
                                rows={2}
                              />
                              <div className="flex gap-1 mt-1">
                                <button onClick={() => handleEdit(msg._id)} className="p-1 hover:bg-slate-700 rounded">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                </button>
                                <button onClick={() => setEditingMessage(null)} className="p-1 hover:bg-slate-700 rounded">
                                  <X className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                              {isOwn && (
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className={`text-[10px] ${isOwn ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {formatTime(msg.sentAt)}
                                  </span>
                                  {msg.read !== false && <CheckCheck className={`w-3 h-3 ${isOwn ? 'text-slate-400' : 'text-slate-400'}`} />}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Actions */}
                        {!editingMessage && (
                          <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <button onClick={() => handleDelete(msg._id)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {isOwn && (
                              <button onClick={() => { setEditingMessage(msg._id); setEditText(msg.body); }} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - White */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2.5 bg-slate-100 border-0 rounded-full text-slate-800 placeholder-slate-400 resize-none text-sm"
                    style={{ maxHeight: '100px' }}
                  />
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 bottom-2.5 p-1 hover:bg-slate-200 rounded-full text-slate-500"
                  >
                    <SmilePlus className="w-5 h-5" />
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl border border-slate-200 shadow-lg p-2 z-10" style={{ width: '300px' }}>
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setEmojiCategory(cat)}
                            className={`px-2 py-1 rounded text-xs ${emojiCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                        {EMOJI_CATEGORIES[emojiCategory].map((emoji, i) => (
                          <button
                            key={i}
                            onClick={() => addEmoji(emoji)}
                            className="w-8 h-8 hover:bg-slate-100 rounded flex items-center justify-center text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-all disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a conversation</h3>
              <p className="text-slate-500 text-sm">Choose from your existing conversations</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};