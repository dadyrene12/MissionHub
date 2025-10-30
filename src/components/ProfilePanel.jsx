import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Camera, FileText, Download, Eye, 
  Edit, User, MapPin, Phone, Mail, Briefcase,
  GraduationCap, Linkedin, Github, Globe, CheckCircle,
  Trash2, Plus, Award, Calendar, Building,
  Save, XCircle, Clock, AlertCircle
} from 'lucide-react';

const ProfilePanel = ({
  profilePanelOpen,
  setProfilePanelOpen,
  userProfile,
  updateProfile,
  appliedJobs: initialAppliedJobs,
  jobs,
  showNotification,
  cancelApplication
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [localProfile, setLocalProfile] = useState(userProfile || {});
  const [cancellingApplication, setCancellingApplication] = useState(null);
  const [localAppliedJobs, setLocalAppliedJobs] = useState(new Set(initialAppliedJobs));
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  const profilePhotoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Update local profile when userProfile changes from parent
  useEffect(() => {
    setLocalProfile(userProfile || {});
  }, [userProfile]);

  // Update local applied jobs when prop changes
  useEffect(() => {
    setLocalAppliedJobs(new Set(initialAppliedJobs));
  }, [initialAppliedJobs]);

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    return interval;
  };

  const handleProfilePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }

    setFileUploading(true);
    const progressInterval = simulateUploadProgress();

    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (data.success) {
        // Optimistically update local state
        setLocalProfile(prev => ({ ...prev, profilePhoto: data.imageUrl }));
        showNotification('Profile photo updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to upload photo', 'error');
      }
      
      setTimeout(() => {
        setFileUploading(false);
        setUploadProgress(0);
      }, 500);
    })
    .catch(error => {
      clearInterval(progressInterval);
      console.error('Error uploading photo:', error);
      showNotification('Failed to upload photo', 'error');
      setFileUploading(false);
      setUploadProgress(0);
    });
  };

  const handleResumeUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please upload a PDF or Word document', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotification('File size must be less than 10MB', 'error');
      return;
    }

    setFileUploading(true);
    const progressInterval = simulateUploadProgress();

    const formData = new FormData();
    formData.append('resume', file);

    fetch('/api/upload/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (data.success) {
        // Optimistically update local state
        setLocalProfile(prev => ({ 
          ...prev, 
          documents: [...(prev.documents || []), data.resume]
        }));
        showNotification('Resume uploaded successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to upload resume', 'error');
      }
      
      setTimeout(() => {
        setFileUploading(false);
        setUploadProgress(0);
      }, 500);
    })
    .catch(error => {
      clearInterval(progressInterval);
      console.error('Error uploading resume:', error);
      showNotification('Failed to upload resume', 'error');
      setFileUploading(false);
      setUploadProgress(0);
    });
  };

  const triggerFileInput = (type) => {
    if (type === 'photo') {
      profilePhotoInputRef.current?.click();
    } else if (type === 'resume') {
      resumeInputRef.current?.click();
    }
  };

  const downloadDocument = (document) => {
    if (document?.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Document downloaded successfully!', 'success');
    }
  };

  const viewDocument = (document) => {
    if (document?.url) {
      window.open(document.url, '_blank');
    }
  };

  const removeDocument = (documentId) => {
    setLocalProfile(prev => ({
      ...prev,
      documents: prev.documents?.filter(doc => doc._id !== documentId) || []
    }));
    showNotification('Document removed', 'info');
  };

  const handleInputChange = (field, value) => {
    // Handle nested fields
    if (field.includes('.')) {
      const fieldParts = field.split('.');
      setLocalProfile(prev => {
        const newState = { ...prev };
        let current = newState;
        
        // Navigate to the parent object
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        
        // Set the final field value
        const finalField = fieldParts[fieldParts.length - 1];
        current[finalField] = value;
        
        return newState;
      });
    } else {
      setLocalProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // ENHANCED: Save the entire profile to the database
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the complete profile data
      const completeProfile = {
        personalInfo: {
          phone: localProfile?.personalInfo?.phone || '',
          location: localProfile?.personalInfo?.location || '',
          dateOfBirth: localProfile?.personalInfo?.dateOfBirth || null,
          gender: localProfile?.personalInfo?.gender || '',
          nationality: localProfile?.personalInfo?.nationality || '',
          address: {
            street: localProfile?.personalInfo?.address?.street || '',
            city: localProfile?.personalInfo?.address?.city || '',
            state: localProfile?.personalInfo?.address?.state || '',
            zipCode: localProfile?.personalInfo?.address?.zipCode || '',
            country: localProfile?.personalInfo?.address?.country || ''
          }
        },
        professionalInfo: {
          title: localProfile?.professionalInfo?.title || '',
          industry: localProfile?.professionalInfo?.industry || '',
          company: localProfile?.professionalInfo?.company || '',
          experience: localProfile?.professionalInfo?.experience || '',
          educationLevel: localProfile?.professionalInfo?.educationLevel || '',
          education: localProfile?.professionalInfo?.education || '',
          skills: localProfile?.professionalInfo?.skills || [],
          certifications: localProfile?.professionalInfo?.certifications || [],
          languages: localProfile?.professionalInfo?.languages || [],
          preferredJobType: localProfile?.professionalInfo?.preferredJobType || 'full-time',
          preferredLocation: localProfile?.professionalInfo?.preferredLocation || '',
          salaryExpectation: localProfile?.professionalInfo?.salaryExpectation || 0,
          availability: localProfile?.professionalInfo?.availability || 'immediate',
          workAuthorization: localProfile?.professionalInfo?.workAuthorization || '',
          relocation: localProfile?.professionalInfo?.relocation || false,
          linkedin: localProfile?.professionalInfo?.linkedin || '',
          github: localProfile?.professionalInfo?.github || '',
          portfolio: localProfile?.professionalInfo?.portfolio || '',
          bio: localProfile?.professionalInfo?.bio || ''
        },
        privacySettings: {
          profileVisibility: localProfile?.privacySettings?.profileVisibility || 'public',
          showContactInfo: localProfile?.privacySettings?.showContactInfo || false
        },
        notificationPreferences: {
          emailNotifications: localProfile?.notificationPreferences?.emailNotifications !== false,
          pushNotifications: localProfile?.notificationPreferences?.pushNotifications !== false,
          jobAlerts: localProfile?.notificationPreferences?.jobAlerts !== false,
          applicationUpdates: localProfile?.notificationPreferences?.applicationUpdates !== false
        }
      };
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(completeProfile)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLocalProfile(data.user); // Sync with server response
        showNotification('Profile saved successfully!', 'success');
        return true;
      } else {
        showNotification(data.message || 'Error saving profile', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('Error saving profile', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // ENHANCED: Handle cancelling an application with confirmation and data saving
  const handleCancelApplication = async (jobId) => {
    setCancellingApplication(jobId);
    try {
      // Step 1: Save any unsaved profile data first
      const profileSaved = await handleSaveProfile();
      if (!profileSaved) {
        // If profile save fails, we might want to stop, but for now, we'll continue
        showNotification('Proceeding with cancellation, but profile may not be saved.', 'warning');
      }

      // Step 2: Call the API to cancel the application
      await cancelApplication(jobId);
      
      // Step 3: Update local state immediately for a responsive UI
      setLocalAppliedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      
      showNotification('Application cancelled successfully', 'success');
    } catch (error) {
      console.error('Error cancelling application:', error);
      showNotification('Failed to cancel application', 'error');
    } finally {
      setCancellingApplication(null);
      setShowCancelConfirm(null); // Close confirmation dialog
    }
  };

  const getUserInitials = () => {
    if (!localProfile?.name) return 'U';
    return localProfile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getSkillsDisplay = () => {
    if (!localProfile?.professionalInfo?.skills || !Array.isArray(localProfile.professionalInfo.skills)) return '';
    return localProfile.professionalInfo.skills.join(', ');
  };

  const parseSkills = (skillsString) => {
    return skillsString
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Award }
  ];

  const IconComponent = ({ icon: Icon, ...props }) => <Icon {...props} />;

  return (
    <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
      profilePanelOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          profilePanelOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        } md:hidden`}
        onClick={() => setProfilePanelOpen(false)}
      />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto md:relative md:max-w-none md:w-96 lg:w-130">
        <div className="sticky top-0 bg-gray-900 text-white p-4 sm:p-6 flex justify-between items-center z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold truncate">My Profile</h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-1 truncate">Manage your professional presence</p>
          </div>
          <button 
            onClick={() => setProfilePanelOpen(false)}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-800 transition-colors ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex justify-center sm:justify-start">
              <div className="relative">
                {localProfile?.profilePhoto ? (
                  <div className="relative">
                    <img 
                      src={localProfile.profilePhoto} 
                      alt="Profile" 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <button
                      onClick={() => {
                        setLocalProfile(prev => ({ ...prev, profilePhoto: '' }));
                        showNotification('Profile photo removed', 'info');
                      }}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-4 border-white shadow-md">
                    {getUserInitials()}
                  </div>
                )}
                {fileUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{localProfile?.name || 'Your Name'}</h3>
              <p className="text-gray-600 text-sm truncate">
                {localProfile?.professionalInfo?.experience ? `${localProfile.professionalInfo.experience} Level` : 'Professional'}
              </p>
              <p className="text-gray-500 text-xs truncate">{localProfile?.personalInfo?.location || 'Add location'}</p>
              
              <button
                onClick={() => triggerFileInput('photo')}
                disabled={fileUploading}
                className="mt-2 flex items-center justify-center sm:justify-start px-3 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                <Camera className="w-4 h-4 mr-1 flex-shrink-0" />
                {fileUploading ? 'Uploading...' : 'Change Photo'}
              </button>
            </div>
          </div>

          {fileUploading && uploadProgress > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-900 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 bg-white sticky top-[84px] sm:top-[104px] z-10">
          <div className="flex overflow-x-auto px-4 sm:px-6 pt-4 hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 border-t-2 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent icon={tab.icon} className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={localProfile?.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={localProfile?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="your@email.com"
                      disabled // Email should not be editable after registration
                    />
                  </div>
                </div>
                
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={localProfile?.personalInfo?.phone || ''}
                      onChange={(e) => handleInputChange('personalInfo.phone', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={localProfile?.personalInfo?.location || ''}
                      onChange={(e) => handleInputChange('personalInfo.location', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About Me</label>
                <textarea
                  value={localProfile?.professionalInfo?.bio || ''}
                  onChange={(e) => handleInputChange('professionalInfo.bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                />
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={localProfile?.professionalInfo?.experience || ''}
                    onChange={(e) => handleInputChange('professionalInfo.experience', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>
                
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <select
                    value={localProfile?.professionalInfo?.educationLevel || ''}
                    onChange={(e) => handleInputChange('professionalInfo.educationLevel', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="">Select education level</option>
                    <option value="highschool">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Details</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={localProfile?.professionalInfo?.education || ''}
                      onChange={(e) => handleInputChange('professionalInfo.education', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="e.g. Bachelor of Computer Science, University Name"
                    />
                  </div>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Type</label>
                  <select
                    value={localProfile?.professionalInfo?.preferredJobType || 'full-time'}
                    onChange={(e) => handleInputChange('professionalInfo.preferredJobType', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={localProfile?.professionalInfo?.availability || 'immediate'}
                    onChange={(e) => handleInputChange('professionalInfo.availability', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  >
                    <option value="immediate">Immediately</option>
                    <option value="1week">1 Week</option>
                    <option value="2weeks">2 Weeks</option>
                    <option value="1month">1 Month</option>
                    <option value="2months">2+ Months</option>
                  </select>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Expectation (annual)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={localProfile?.professionalInfo?.salaryExpectation || ''}
                      onChange={(e) => handleInputChange('professionalInfo.salaryExpectation', parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="e.g. 75000"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <input
                  type="text"
                  value={getSkillsDisplay()}
                  onChange={(e) => handleInputChange('professionalInfo.skills', parseSkills(e.target.value))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  placeholder="e.g. React, Node.js, Python, AWS"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Separate skills with commas
                </p>
                
                {localProfile?.professionalInfo?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {localProfile.professionalInfo.skills.map((skill, index) => (
                      <span key={index} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs sm:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={localProfile?.professionalInfo?.linkedin || ''}
                      onChange={(e) => handleInputChange('professionalInfo.linkedin', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
                
                <div className="col-span-full sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
                  <div className="relative">
                    <Github className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={localProfile?.professionalInfo?.github || ''}
                      onChange={(e) => handleInputChange('professionalInfo.github', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
                
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={localProfile?.professionalInfo?.portfolio || ''}
                      onChange={(e) => handleInputChange('professionalInfo.portfolio', e.target.value)}
                      className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-700 flex-shrink-0" />
                  Documents
                </h3>
                
                {localProfile?.documents && localProfile.documents.length > 0 ? (
                  <div className="space-y-4">
                    {localProfile.documents.map((document, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="w-5 h-5 text-gray-700 flex-shrink-0" />
                            <span className="font-medium text-gray-900 truncate">{document.name}</span>
                            {document.isPrimary && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Primary</span>
                            )}
                          </div>
                          <div className="flex space-x-1 sm:space-x-2 ml-2">
                            <button 
                              onClick={() => viewDocument(document)}
                              className="p-1 text-gray-700 hover:text-gray-900 transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => downloadDocument(document)}
                              className="p-1 text-gray-700 hover:text-gray-900 transition-colors"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeDocument(document._id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Remove Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 space-y-1 sm:space-y-0">
                          <span>{document.size}</span>
                          <span>Updated {new Date(document.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => triggerFileInput('resume')}
                      disabled={fileUploading}
                      className="flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
                      {fileUploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 hover:border-gray-400 transition-colors cursor-pointer"
                         onClick={() => triggerFileInput('resume')}>
                      <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">Upload Your Documents</p>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4">
                        PDF, Word, or image files • Max 15MB
                      </p>
                      <div className="px-4 sm:px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-block text-sm">
                        {fileUploading ? 'Uploading...' : 'Choose File'}
                      </div>
                    </div>
                  </div>
                )}

                {fileUploading && uploadProgress > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gray-900 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-gray-700 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Complete Your Profile</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      A complete profile with documents increases your chances of getting hired by 70%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3 sm:mb-4">Application History</h3>
              <div className="space-y-2 sm:space-y-3">
                {jobs.filter(job => localAppliedJobs.has(job.id)).map(job => (
                  <div key={job.id} className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate flex-1 mr-2">{job.title}</h4>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
                        Applied
                      </span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                      <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        Applied 2 days ago
                      </div>
                      <button
                        onClick={() => setShowCancelConfirm(job.id)}
                        disabled={cancellingApplication === job.id}
                        className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center transition-colors disabled:opacity-50"
                      >
                        {cancellingApplication === job.id ? (
                          <>
                            <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                {localAppliedJobs.size === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">No applications yet</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Start applying to jobs to see them here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <input
            type="file"
            ref={profilePhotoInputRef}
            onChange={handleProfilePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={resumeInputRef}
            onChange={handleResumeUpload}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center w-full sm:w-auto text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancelling Application */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900">Cancel Application?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your application for this position? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No, Keep It
              </button>
              <button
                onClick={() => handleCancelApplication(showCancelConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProfilePanel;