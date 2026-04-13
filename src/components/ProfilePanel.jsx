import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Upload, FileText, Eye, Edit, User, MapPin, 
  Briefcase, Globe, Trash2, Save, Loader2, Award, Camera
} from 'lucide-react';

const API_BASE = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com';

const ProfilePanel = ({
  profilePanelOpen,
  setProfilePanelOpen,
  userProfile,
  updateProfile,
  showNotification,
  token,
  user
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [fileUploading, setFileUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    experience: '',
    education: '',
    skills: '',
    linkedin: '',
    github: '',
    portfolio: '',
    resume: null,
    cv: null,
    documents: []
  });
  
  const resumeInputRef = useRef(null);
  const cvInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const getToken = () => token || localStorage.getItem('token') || '';

  // Fetch profile from database
  const fetchProfile = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) return;

    setIsLoading(true);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
        signal: abortControllerRef.current.signal
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        const profile = data.data.profile || {};
        const user = data.data.user || {};
        
        setFormData(prev => ({
          name: prev.name || profile.name || user.name || '',
          email: prev.email || user.email || profile.email || '',
          phone: prev.phone || profile.phone || '',
          location: prev.location || profile.location || '',
          title: prev.title || profile.title || '',
          bio: prev.bio || profile.bio || '',
          experience: prev.experience || profile.experience || '',
          education: prev.education || profile.education || '',
          skills: prev.skills || (Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || '')),
          linkedin: prev.linkedin || profile.linkedin || '',
          github: prev.github || profile.github || '',
          portfolio: prev.portfolio || profile.portfolio || '',
          resume: profile.resume || null,
          cv: profile.cv || null,
          documents: profile.documents || []
        }));
        
        if (!profilePicture && (profile.profilePhoto || profile.profilePicture || user.profilePhoto || user.profilePicture)) {
          setProfilePicture(profile.profilePhoto || profile.profilePicture || user.profilePhoto || user.profilePicture);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching profile:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize form data from userProfile prop when panel first opens
  useEffect(() => {
    if (profilePanelOpen) {
      // First priority: userProfile prop from App
      if (userProfile) {
        setFormData(prev => ({
          name: prev.name || userProfile.name || user?.name || '',
          email: prev.email || userProfile.email || user?.email || '',
          phone: prev.phone || userProfile.phone || userProfile.profile?.phone || '',
          location: prev.location || userProfile.location || userProfile.profile?.location || '',
          title: prev.title || userProfile.title || userProfile.profile?.title || '',
          bio: prev.bio || userProfile.bio || userProfile.profile?.bio || '',
          experience: prev.experience || userProfile.experience || userProfile.profile?.experience || '',
          education: prev.education || userProfile.education || userProfile.profile?.education || '',
          skills: prev.skills || (Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || userProfile.profile?.skills || '')),
          linkedin: prev.linkedin || userProfile.linkedin || userProfile.profile?.linkedin || '',
          github: prev.github || userProfile.github || userProfile.profile?.github || '',
          portfolio: prev.portfolio || userProfile.portfolio || userProfile.profile?.portfolio || ''
        }));
      }
      
      // Also check user prop for profile photo
      if (user?.profilePhoto && !profilePicture) {
        setProfilePicture(user.profilePhoto);
      }
      if (userProfile?.profilePhoto && !profilePicture) {
        setProfilePicture(userProfile.profilePhoto);
      }
      if (userProfile?.profile?.profilePhoto && !profilePicture) {
        setProfilePicture(userProfile.profile.profilePhoto);
      }
      
      // Then fetch from API to get latest data
      fetchProfile();
    }
  }, [profilePanelOpen, fetchProfile, userProfile, profilePicture, user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Profile picture upload handler
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', 'error');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please upload a valid image file (JPEG, PNG, GIF, or WebP)', 'error');
      return;
    }

    setIsUploadingPicture(true);
    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/upload/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        body: formDataUpload
      });
      
      const data = await res.json();
      if (data.success) {
        let url = data.photoUrl || data.data?.photoUrl || data.data?.url || data.url;
        if (url && !url.startsWith('http')) {
          url = API_BASE + url;
        }
        setProfilePicture(url);
        showNotification('Profile picture updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to upload profile picture', 'error');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showNotification('Failed to upload profile picture. Please try again.', 'error');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  // Save profile to database
  const handleSaveProfile = async () => {
    const currentToken = getToken();
    if (!currentToken) {
      showNotification('Please log in to save your profile', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Process skills - convert comma-separated string to array
      let skillsArray = [];
      if (formData.skills) {
        if (Array.isArray(formData.skills)) {
          skillsArray = formData.skills;
        } else if (typeof formData.skills === 'string') {
          skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const requestBody = {
        name: formData.name || '',
        phone: formData.phone || '',
        location: formData.location || '',
        title: formData.title || '',
        bio: formData.bio || '',
        experience: formData.experience || '',
        education: formData.education || '',
        skills: skillsArray,
        linkedin: formData.linkedin || '',
        github: formData.github || '',
        portfolio: formData.portfolio || '',
        profilePhoto: profilePicture || ''
      };
      
      console.log('Saving profile:', JSON.stringify(requestBody, null, 2));
      
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Save response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Save error:', res.status, errorText);
        throw new Error(`Server error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Save response:', data);
      
      if (data.success) {
        showNotification('Profile saved successfully!', 'success');
        // Update local state with saved data
        if (data.data && data.data.user) {
          const user = data.data.user;
          setFormData(prev => ({
            ...prev,
            name: user.name || prev.name,
            phone: user.profile?.phone || prev.phone,
            location: user.profile?.location || prev.location,
            title: user.profile?.title || prev.title,
            bio: user.profile?.bio || prev.bio,
            experience: user.profile?.experience || prev.experience,
            education: user.profile?.education || prev.education,
            skills: Array.isArray(user.profile?.skills) ? user.profile.skills.join(', ') : (user.profile?.skills || prev.skills),
            linkedin: user.profile?.linkedin || prev.linkedin,
            github: user.profile?.github || prev.github,
            portfolio: user.profile?.portfolio || prev.portfolio
          }));
          if (user.profile?.profilePhoto) {
            setProfilePicture(user.profile.profilePhoto);
          }
        }
      } else {
        showNotification(data.message || 'Failed to save profile', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('Failed to save profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/upload/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        body: formDataUpload
      });

      console.log('Resume upload status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Resume upload error:', res.status, errorText);
        showNotification('Failed to upload resume', 'error');
        return;
      }
      
      const text = await res.text();
      if (!text.trim()) {
        showNotification('Empty response from server', 'error');
        return;
      }
      
      const data = JSON.parse(text);
      console.log('Resume upload response:', data);
      
      if (data.success) {
        const resumeData = data.data?.resume || data.resume;
        setFormData(prev => ({ ...prev, resume: resumeData }));
        showNotification('Resume uploaded successfully', 'success');
      } else {
        showNotification(data.message || 'Failed to upload resume', 'error');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      showNotification('Failed to upload resume', 'error');
    } finally {
      setFileUploading(false);
    }
  };

  // CV upload
  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('cv', file);

    try {
      const currentToken = getToken();
      const res = await fetch(`${API_BASE}/upload/cv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        body: formDataUpload
      });

      const data = await res.json();
      console.log('CV upload response:', data);
      
      if (data.success) {
        setFormData(prev => ({ ...prev, cv: data.data?.cv || data.cv }));
        showNotification('CV uploaded successfully', 'success');
      } else {
        showNotification(data.message || 'Failed to upload CV', 'error');
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      showNotification('Failed to upload CV', 'error');
    } finally {
      setFileUploading(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async () => {
    try {
      const currentToken = getToken();
      await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          profile: { resume: null }
        })
      });
      setFormData(prev => ({ ...prev, resume: null }));
      showNotification('Resume deleted', 'success');
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  // Delete CV
  const handleDeleteCV = async () => {
    try {
      const currentToken = getToken();
      await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          profile: { cv: null }
        })
      });
      setFormData(prev => ({ ...prev, cv: null }));
      showNotification('CV deleted', 'success');
    } catch (error) {
      console.error('Error deleting CV:', error);
    }
  };

  // View resume
  const viewResume = () => {
    if (formData.resume?.url) {
      window.open(formData.resume.url + '?token=' + getToken(), '_blank');
    }
  };

  // View CV
  const viewCV = () => {
    if (formData.cv?.url) {
      window.open(formData.cv.url + '?token=' + getToken(), '_blank');
    }
  };

  const triggerFileInput = (type) => {
    if (type === 'resume') {
      resumeInputRef.current?.click();
    } else if (type === 'cv') {
      cvInputRef.current?.click();
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  if (!profilePanelOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setProfilePanelOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[90vw] md:w-[900px] lg:w-[1000px] bg-white shadow-2xl z-50 overflow-y-auto max-w-[1200px]">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-950">Profile Settings</h2>
          <button onClick={() => setProfilePanelOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <>
              {/* Personal Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      Profile Photo
                    </h3>
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-slate-400" />
                          )}
                        </div>
                        <button
                          onClick={() => profilePictureInputRef.current?.click()}
                          disabled={isUploadingPicture}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg"
                        >
                          {isUploadingPicture ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="file"
                          ref={profilePictureInputRef}
                          onChange={handleProfilePictureUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">Profile Picture</p>
                        <p className="text-sm text-slate-500">Click the camera icon to upload</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-gray-50 cursor-not-allowed text-gray-500"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center mr-3">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      Contact Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Tab */}
              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center mr-3">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      Professional Info
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                        <textarea
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white text-slate-900"
                          rows={5}
                          placeholder="Describe your work experience, roles, responsibilities and achievements..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                        <textarea
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white text-slate-900"
                          rows={5}
                          placeholder="Your education background, degrees, certifications..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                        <input
                          type="text"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="React, Node.js, Python"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center mr-3">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      Links
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                        <input
                          type="url"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="https://github.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                        <input
                          type="url"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Resume Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">Resume</h3>
                        <p className="text-sm text-slate-600">Your primary job application document</p>
                      </div>
                    </div>
                    
                    {formData.resume && (formData.resume.url || formData.resume.name) ? (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center">
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{formData.resume.name || 'Resume.pdf'}</p>
                              <p className="text-sm text-slate-500 flex items-center">
                                <span className="w-2 h-2 bg-slate-900 rounded-full mr-2"></span>
                                {formData.resume.size || 'Uploaded'} • {formData.resume.uploadDate ? new Date(formData.resume.uploadDate).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {formData.resume.url && (
                              <button onClick={viewResume} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium flex items-center">
                                <Eye className="w-4 h-4 mr-1" /> View
                              </button>
                            )}
                            <button onClick={() => triggerFileInput('resume')} disabled={fileUploading} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
                              Replace
                            </button>
                            <button onClick={handleDeleteResume} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-500 transition-colors cursor-pointer bg-white/50" onClick={() => triggerFileInput('resume')}>
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-900 font-semibold mb-2">No Resume</p>
                        <p className="text-slate-500 text-sm mb-4">Click to upload your resume</p>
                        <div className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium inline-block">
                          {fileUploading ? 'Uploading...' : 'Choose File'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CV Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">CV</h3>
                        <p className="text-sm text-slate-600">Your curriculum vitae</p>
                      </div>
                    </div>
                    
                    {formData.cv && (formData.cv.url || formData.cv.name) ? (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center">
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{formData.cv.name || 'CV.pdf'}</p>
                              <p className="text-sm text-slate-500 flex items-center">
                                <span className="w-2 h-2 bg-slate-800 rounded-full mr-2"></span>
                                {formData.cv.size || 'Uploaded'} • {formData.cv.uploadDate ? new Date(formData.cv.uploadDate).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {formData.cv.url && (
                              <button onClick={viewCV} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium flex items-center">
                                <Eye className="w-4 h-4 mr-1" /> View
                              </button>
                            )}
                            <button onClick={() => triggerFileInput('cv')} disabled={fileUploading} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium">
                              Replace
                            </button>
                            <button onClick={handleDeleteCV} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-slate-500 transition-colors cursor-pointer bg-white/50" onClick={() => triggerFileInput('cv')}>
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-900 font-semibold mb-2">No CV</p>
                        <p className="text-slate-500 text-sm mb-4">Click to upload your CV</p>
                        <div className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium inline-block">
                          {fileUploading ? 'Uploading...' : 'Upload CV'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <input type="file" ref={resumeInputRef} onChange={handleResumeUpload} accept=".pdf,.doc,.docx" className="hidden" />
          <input type="file" ref={cvInputRef} onChange={handleCVUpload} accept=".pdf,.doc,.docx" className="hidden" />

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6 -mx-4 sm:-mx-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 hidden sm:block">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
                Auto-saved
              </p>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-3 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-900 transition-all flex items-center shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ProfilePanel;