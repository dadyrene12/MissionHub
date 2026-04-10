import React, { useState, useRef } from 'react';
import {
  X, FilePlus, Upload, FileText, Eye, Share2, Trash2,
  Download, Copy, CheckCircle, ExternalLink, Search, Users,
  Send, Camera, Image, CheckCheck, Info, Building
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

// Database Service Functions
class DatabaseService {
  // Jobs Collection
  static async saveJob(jobData) {
    try {
      const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          postedBy: jobData.userId,
          status: 'active'
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  static async updateJob(jobId, jobData) {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jobData,
          updatedAt: new Date().toISOString()
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  static async getJobs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/jobs?${queryParams}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  static async deleteJob(jobId) {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  // Documents Collection
  static async saveDocument(documentData) {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach(key => {
        formData.append(key, documentData[key]);
      });

      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }

  static async getDocuments(userId) {
    try {
      const response = await fetch(`/api/documents?userId=${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async updateDocument(documentId, updates) {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId) {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Document Shares Collection
  static async shareDocument(shareData) {
    try {
      const response = await fetch(`${API_BASE}/document-shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shareData,
          sharedAt: new Date().toISOString()
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }

  static async getDocumentShares(documentId) {
    try {
      const response = await fetch(`/api/document-shares?documentId=${documentId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching document shares:', error);
      throw error;
    }
  }

  // Users Collection
  static async getUsers(searchTerm = '') {
    try {
      const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUser(userId) {
    try {
      const response = await fetch(`/api/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}

// Database Schema Examples (for reference)
/*
Jobs Collection Schema:
{
  id: string,
  title: string,
  company: string,
  location: string,
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary',
  salary: string,
  category: 'technology' | 'marketing' | 'finance' | 'healthcare' | 'education' | 'other',
  experience: 'entry' | 'mid' | 'senior' | 'executive',
  description: string,
  responsibilities: string,
  requirements: string,
  benefits: string,
  remote: boolean,
  urgent: boolean,
  contactEmail: string,
  contactPhone: string,
  applicationUrl: string,
  image: string,
  postedBy: string, // userId
  status: 'active' | 'closed' | 'draft',
  createdAt: string,
  updatedAt: string,
  views: number,
  applications: number
}

Documents Collection Schema:
{
  id: string,
  name: string,
  originalName: string,
  size: number,
  type: string,
  url: string,
  storagePath: string,
  uploadDate: string,
  uploadedBy: string, // userId
  shared: boolean,
  shareToken: string,
  description: string,
  category: string,
  tags: string[]
}

Document Shares Collection Schema:
{
  id: string,
  documentId: string,
  sharedBy: string, // userId
  sharedWith: string, // userId
  permission: 'view' | 'download' | 'edit',
  sharedAt: string,
  expiresAt: string,
  message: string
}

Users Collection Schema:
{
  id: string,
  name: string,
  email: string,
  userType: 'jobSeeker' | 'company' | 'admin',
  avatar: string,
  company: string,
  position: string,
  bio: string,
  skills: string[],
  resume: string,
  createdAt: string,
  lastLogin: string,
  preferences: object
}
*/

// Post Job Modal Component with Database Integration
export const PostJobModal = ({ 
  open, 
  onClose, 
  newJob = {},
  handleNewJobChange = () => {},
  handlePostJob,
  handleImageUpload = () => {},
  user
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const safeNewJob = {
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
    applicationUrl: '',
    image: '',
    ...newJob
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload image to server
      const imageUrl = await handleImageUpload(file);
      handleNewJobChange('image', imageUrl);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    handleNewJobChange('image', '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploading(true);

    try {
      await handlePostJob(e);
      onClose();
    } catch (err) {
      setError('Failed to post job. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Check if user is authorized to post jobs
  if (!user || user.userType !== 'company') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${open ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Company Account Required</h3>
            <p className="text-gray-600 mb-6">
              Job posting is only available for verified company accounts. Please log in or register as a company to post jobs.
            </p>
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Company Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-full">
            <Building className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">Company Account</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Post a New Job</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Image Upload Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-blue-600" />
              Job Featured Image
            </h3>
            
            {safeNewJob.image ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border-2 border-blue-300">
                  <img 
                    src={safeNewJob.image} 
                    alt="Job preview" 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-green-600 font-medium flex items-center">
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Image uploaded successfully
                </p>
              </div>
            ) : (
              <div className="text-center">
                <label htmlFor="job-image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-300 rounded-lg bg-white hover:bg-blue-50 transition-colors">
                    {uploading ? (
                      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    ) : (
                      <Image className="w-12 h-12 text-blue-400 mb-3" />
                    )}
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {uploading ? 'Uploading Image...' : 'Upload Job Image'}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Recommended: 800x400px (JPG, PNG, WebP)
                    </p>
                    {!uploading && (
                      <div className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Choose Image
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Max file size: 5MB</p>
                  </div>
                  <input
                    id="job-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="flex">
                <Info className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  A compelling image increases job visibility by up to 40%. Choose an image that represents your company culture or workplace.
                </p>
              </div>
            </div>
          </div>

          {/* Job Form Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="job-title" className="block text-sm font-medium text-gray-700">Job Title *</label>
              <div className="mt-1">
                <input
                  id="job-title"
                  type="text"
                  value={safeNewJob.title}
                  onChange={(e) => handleNewJobChange('title', e.target.value)}
                  required
                  placeholder="e.g. Senior React Developer"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="job-company" className="block text-sm font-medium text-gray-700">Company Name *</label>
              <div className="mt-1">
                <input
                  id="job-company"
                  type="text"
                  value={safeNewJob.company}
                  onChange={(e) => handleNewJobChange('company', e.target.value)}
                  required
                  placeholder="e.g. TechCorp Solutions"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="job-location" className="block text-sm font-medium text-gray-700">Location *</label>
              <div className="mt-1">
                <input
                  id="job-location"
                  type="text"
                  value={safeNewJob.location}
                  onChange={(e) => handleNewJobChange('location', e.target.value)}
                  required
                  placeholder="e.g. San Francisco, CA"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="job-salary" className="block text-sm font-medium text-gray-700">Salary Range</label>
              <div className="mt-1">
                <input
                  id="job-salary"
                  type="text"
                  value={safeNewJob.salary}
                  onChange={(e) => handleNewJobChange('salary', e.target.value)}
                  placeholder="e.g. $80k - $120k"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="job-type" className="block text-sm font-medium text-gray-700">Job Type</label>
              <div className="mt-1">
                <select
                  id="job-type"
                  value={safeNewJob.type}
                  onChange={(e) => handleNewJobChange('type', e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="job-category" className="block text-sm font-medium text-gray-700">Category</label>
              <div className="mt-1">
                <select
                  id="job-category"
                  value={safeNewJob.category}
                  onChange={(e) => handleNewJobChange('category', e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="technology">Technology</option>
                  <option value="marketing">Marketing</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="job-experience" className="block text-sm font-medium text-gray-700">Experience Level</label>
              <div className="mt-1">
                <select
                  id="job-experience"
                  value={safeNewJob.experience}
                  onChange={(e) => handleNewJobChange('experience', e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="job-email" className="block text-sm font-medium text-gray-700">Contact Email</label>
              <div className="mt-1">
                <input
                  id="job-email"
                  type="email"
                  value={safeNewJob.contactEmail}
                  onChange={(e) => handleNewJobChange('contactEmail', e.target.value)}
                  placeholder="hr@company.com"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Job Fields */}
          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">Job Description *</label>
            <div className="mt-1">
              <textarea
                id="job-description"
                value={safeNewJob.description}
                onChange={(e) => handleNewJobChange('description', e.target.value)}
                required
                rows={4}
                placeholder="Provide a detailed description of the role..."
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                id="job-remote"
                type="checkbox"
                checked={safeNewJob.remote}
                onChange={(e) => handleNewJobChange('remote', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="job-remote" className="ml-2 block text-sm text-gray-700">
                Remote Position
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="job-urgent"
                type="checkbox"
                checked={safeNewJob.urgent}
                onChange={(e) => handleNewJobChange('urgent', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="job-urgent" className="ml-2 block text-sm text-gray-700">
                Urgent Hiring
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" /> Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Document Share Modal Component with Database Integration
export const DocumentShareModal = ({
  open,
  onClose,
  handleAddDocument,
  userDocuments,
  handleToggleDocumentShare,
  handleDeleteDocument,
  handlePreviewDocument,
  showNotification,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shareMessage, setShareMessage] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const fileInputRef = useRef(null);

  // Load users from database when search term changes
  React.useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        const usersData = await DatabaseService.getUsers(searchTerm);
        setUsers(usersData);
      } catch (error) {
        console.error('Error searching users:', error);
        showNotification('Error searching users', 'error');
      } finally {
        setLoadingUsers(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => 
      prev.some(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please upload a valid document (PDF, Word, Text, or Image)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification('File size must be less than 10MB', 'error');
      return;
    }

    setUploading(true);
    
    try {
      const documentData = {
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadedBy: user.id,
        description: '',
        category: 'general',
        tags: []
      };
      
      const savedDocument = await DatabaseService.saveDocument(documentData);
      handleAddDocument(savedDocument);
      showNotification('Document uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading document:', error);
      showNotification('Failed to upload document', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleShareDocuments = async () => {
    if (selectedUsers.length === 0) {
      showNotification('Please select at least one user to share with', 'error');
      return;
    }

    try {
      // Share each selected document with each selected user
      const sharePromises = userDocuments
        .filter(doc => doc.shared)
        .flatMap(doc =>
          selectedUsers.map(user =>
            DatabaseService.shareDocument({
              documentId: doc.id,
              sharedBy: user.id, // current user
              sharedWith: user.id,
              permission: 'view',
              message: shareMessage
            })
          )
        );

      await Promise.all(sharePromises);
      showNotification(`Documents shared with ${selectedUsers.length} user(s)`, 'success');
      setSelectedUsers([]);
      setShareMessage('');
    } catch (error) {
      console.error('Error sharing documents:', error);
      showNotification('Failed to share documents', 'error');
    }
  };

  const generateShareLink = async (document) => {
    try {
      // Update document to be shared and get share token
      const updatedDoc = await DatabaseService.updateDocument(document.id, {
        shared: true,
        shareToken: `doc_${document.id}_${Date.now()}`
      });
      
      const shareLink = `${window.location.origin}/document/${updatedDoc.shareToken}`;
      await navigator.clipboard.writeText(shareLink);
      showNotification('Share link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error generating share link:', error);
      showNotification('Failed to generate share link', 'error');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Document Management</h2>
        <p className="text-gray-600 text-center mb-6">Upload, manage, and share your documents</p>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Documents
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'share'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-2" />
            Share Documents
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manage'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Manage Documents
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                Upload New Document
              </h3>
              
              <div className="text-center">
                <label htmlFor="document-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-blue-300 rounded-lg bg-white hover:bg-blue-50 transition-colors">
                    {uploading ? (
                      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                    ) : (
                      <FilePlus className="w-12 h-12 text-blue-400 mb-3" />
                    )}
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      PDF, Word, Text, or Images (Max 10MB)
                    </p>
                    {!uploading && (
                      <div className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Choose File
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Supported: PDF, DOC, DOCX, TXT, JPG, PNG</p>
                  </div>
                  <input
                    id="document-upload"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,image/jpeg,image/png"
                    onChange={handleDocumentUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Share Tab */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            {/* User Search and Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Select Users to Share With
              </h3>
              
              <div className="relative mb-4">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {loadingUsers && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Users:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <div key={user.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {user.name}
                        <button
                          onClick={() => toggleUserSelection(user)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.length === 0 && searchTerm.length >= 2 && !loadingUsers ? (
                  <div className="p-4 text-center text-gray-500">
                    No users found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`flex items-center p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedUsers.some(u => u.id === user.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold mr-3">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{user.userType}</p>
                      </div>
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedUsers.some(u => u.id === user.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedUsers.some(u => u.id === user.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Share Message */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Message (Optional)</h3>
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a message to include with the shared documents..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Share Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareDocuments}
                disabled={selectedUsers.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Share with {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Your Documents ({userDocuments?.length || 0})
              </h3>
              
              {userDocuments && userDocuments.length > 0 ? (
                <div className="space-y-4">
                  {userDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</span>
                            <span className={`flex items-center ${
                              doc.shared ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              <Share2 className="w-3 h-3 mr-1" />
                              {doc.shared ? 'Shared' : 'Private'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePreviewDocument(doc)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateShareLink(doc)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Copy Share Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleDocumentShare(doc.id)}
                          className={`p-2 transition-colors ${
                            doc.shared 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-gray-400 hover:text-blue-600'
                          }`}
                          title={doc.shared ? 'Make Private' : 'Share Document'}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No documents uploaded yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload your first document to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Document Preview Modal Component with Database Integration
export const DocumentPreviewModal = ({ documentPreview, setDocumentPreview, handleToggleDocumentShare }) => {
  const [loading, setLoading] = useState(false);

  if (!documentPreview) return null;

  const handleShareToggle = async () => {
    setLoading(true);
    try {
      await handleToggleDocumentShare(documentPreview.id);
    } catch (error) {
      console.error('Error toggling document share:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Track download in database
      await DatabaseService.updateDocument(documentPreview.id, {
        downloads: (documentPreview.downloads || 0) + 1,
        lastDownloaded: new Date().toISOString()
      });
      
      window.open(documentPreview.url, '_blank');
    } catch (error) {
      console.error('Error tracking download:', error);
      window.open(documentPreview.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{documentPreview.name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareToggle}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                documentPreview.shared 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDocumentPreview(null)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Document Preview</p>
              <p className="text-sm text-gray-500 mt-2">
                {documentPreview.name} • {(documentPreview.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="mt-4 space-x-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Open Full Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DatabaseService };