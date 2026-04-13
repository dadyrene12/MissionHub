import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Building, Globe, MapPin, Phone, Mail, FileText, Loader2, 
  User, Bell, Shield, Palette, Key, Trash2, Eye, EyeOff, Check,
  Camera, Upload, AlertTriangle, ExternalLink, Moon, Sun, Monitor,
  MessageSquare, Briefcase, DollarSign, Users as UsersIcon, Settings2,
  CheckCircle, XCircle, Lock, Fingerprint, Smartphone, Image,
  Clock, AlertCircle, X, CheckCircle2, Download
} from 'lucide-react';
import { apiFetch } from './CompanyDashboardUtils';

const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
          activeTab === tab.id
            ? 'bg-slate-950 text-white'
            : 'bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
        }`}
      >
        <tab.icon className="w-4 h-4" />
        {tab.label}
      </button>
    ))}
  </div>
);

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
        {label === 'Email' && <Mail className="w-5 h-5 text-blue-600" />}
        {label === 'SMS' && <Smartphone className="w-5 h-5 text-green-600" />}
        {label === 'Push' && <Bell className="w-5 h-5 text-purple-600" />}
        {label === 'In-App' && <MessageSquare className="w-5 h-5 text-amber-600" />}
      </div>
      <div>
        <p className="font-medium text-slate-950">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </div>
    <button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-all ${
        enabled ? 'bg-slate-700' : 'bg-slate-300'
      }`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all ${
        enabled ? 'left-8' : 'left-1'
    }`} />
    </button>
  </div>
);

const Input = ({ label, icon: Icon, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
    </label>
    <input
      {...props}
      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-500'
      }`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const Select = ({ label, icon: Icon, options, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
    </label>
    <select
      {...props}
      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all appearance-none cursor-pointer text-sm sm:text-base"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const DeleteAccountModal = ({ isOpen, onClose, onDelete, loading }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!password) {
      setError('Password is required');
      return;
    }
    setError('');
    onDelete(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md border border-red-200 shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Delete Account</h3>
              <p className="text-sm text-slate-500">This action cannot be undone</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 sm:mb-6">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> Deleting your account will permanently remove:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> All company information</li>
              <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> All posted jobs</li>
              <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> All applications</li>
              <li className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> All messages</li>
            </ul>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              <span className="flex items-center gap-2"><Key className="w-4 h-4" /> Confirm with your password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm sm:text-base ${
                error ? 'border-red-500' : 'border-slate-200'
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Deleting...</>
              ) : (
                <><Trash2 className="w-5 h-5" /> Delete Account</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailVerificationModal = ({ isOpen, onClose, onVerified, action, loading, error }) => {
  const [code, setCode] = useState('');
  const [step, setStep] = useState('input');

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleSubmit = () => {
    if (code.length === 6) {
      onVerified(code);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 rounded-2xl w-full max-w-md border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Verify Your Email</h3>
              <p className="text-sm text-slate-500">Required for {action}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-indigo-400">
              A verification code has been sent to your email address. Please enter it below to verify your identity.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              <span className="flex items-center gap-2"><Key className="w-4 h-4" /> Verification Code</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center text-2xl tracking-widest font-mono"
              maxLength={6}
            />
            <p className="mt-2 text-xs text-slate-500">Code expires in 10 minutes</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-950 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || code.length !== 6}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Verify</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsPage = ({ user, showToast }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  const [companyData, setCompanyData] = useState({
    name: '', companyName: '', companySize: '', industry: '',
    description: '', location: '', website: '', phone: '', email: '', logo: '', isEmailVerified: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  
  const [notifications, setNotifications] = useState({
    email: true, sms: false, push: true, inApp: true,
    newApplication: true, interviewScheduled: true, messageReceived: true,
    weeklyDigest: false, marketingEmails: false
  });
  
  const [appearance, setAppearance] = useState({
    theme: 'dark', compactMode: false, reduceMotion: false
  });
  
  const [security, setSecurity] = useState({
    twoFactor: false, loginAlerts: true, trustedDevices: []
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [pendingPasswordData, setPendingPasswordData] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetch2FAStatus();
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const res = await apiFetch('/company/2fa/status');
      if (res.ok && res.data?.success) {
        setSecurity(prev => ({ ...prev, twoFactor: res.data.twoFactorEnabled }));
      }
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/company/profile');
      if (res.ok && res.data?.success) {
        setCompanyData({
          name: res.data.data?.name || user?.name || '',
          companyName: res.data.data?.companyName || '',
          companySize: res.data.data?.companySize || '',
          industry: res.data.data?.industry || '',
          description: res.data.data?.description || '',
          location: res.data.data?.location || '',
          website: res.data.data?.website || '',
          phone: res.data.data?.phone || '',
          email: res.data.data?.email || user?.email || '',
          logo: res.data.data?.logo || '',
          isEmailVerified: res.data.data?.isEmailVerified || false
        });
        setIsEmailVerified(res.data.data?.isEmailVerified || false);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
    setLoading(false);
  };

  const handleSendVerification = async (action) => {
    setSaving(true);
    try {
      const res = await apiFetch('/company/send-verification', {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      
      if (res.ok && res.data?.success) {
        setVerificationAction(action);
        setVerificationError('');
        setShowVerificationModal(true);
        
        if (res.data.verificationCode) {
          console.log('Dev mode - verification code:', res.data.verificationCode);
        }
        showToast('Verification code sent to your email', 'success');
      } else {
        showToast(res.data?.message || 'Failed to send verification code', 'error');
      }
    } catch (err) {
      showToast('Error sending verification code', 'error');
    }
    setSaving(false);
  };

  const handleVerifyCode = async (code) => {
    setSaving(true);
    setVerificationError('');
    try {
      const res = await apiFetch('/company/verify-action', {
        method: 'POST',
        body: JSON.stringify({ code, action: verificationAction })
      });
      
      if (res.ok && res.data?.success) {
        setShowVerificationModal(false);
        setIsEmailVerified(true);
        showToast('Email verified successfully', 'success');
        
        if (verificationAction === 'change password' && pendingPasswordData) {
          await executePasswordChange(pendingPasswordData);
          setPendingPasswordData(null);
        } else if (verificationAction === 'delete account') {
          setShowDeleteModal(true);
        }
      } else {
        setVerificationError(res.data?.message || 'Invalid verification code');
      }
    } catch (err) {
      setVerificationError('Error verifying code');
    }
    setSaving(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch('/company/profile', {
        method: 'PUT',
        body: JSON.stringify(companyData)
      });
      if (res.ok && res.data?.success) {
        showToast('Company profile updated successfully!', 'success');
      } else {
        showToast(res.data?.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error saving profile', 'error');
    }
    setSaving(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setSaving(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        const res = await apiFetch('/company/upload-logo', {
          method: 'POST',
          body: JSON.stringify({ logo: base64 })
        });
        
        if (res.ok && res.data?.success) {
          setCompanyData({ ...companyData, logo: base64 });
          showToast('Logo uploaded successfully!', 'success');
        } else {
          showToast(res.data?.message || 'Failed to upload logo', 'error');
        }
        setSaving(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast('Error uploading logo', 'error');
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    
    if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    if (!isEmailVerified) {
      setPendingPasswordData({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      await handleSendVerification('change password');
      return;
    }
    
    await executePasswordChange({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const executePasswordChange = async (passwords) => {
    setSaving(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwords)
      });
      
      if (res.ok && res.data?.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        if (res.data?.message?.includes('Email verification required')) {
          setIsEmailVerified(false);
          setPendingPasswordData(passwords);
          await handleSendVerification('change password');
        } else {
          showToast(res.data?.message || 'Failed to change password', 'error');
        }
      }
    } catch (err) {
      showToast('Error changing password', 'error');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async (password) => {
    if (!isEmailVerified) {
      await handleSendVerification('delete account');
      return;
    }
    
    setSaving(true);
    try {
      const res = await apiFetch('/company/delete-account', {
        method: 'DELETE',
        body: JSON.stringify({ password })
      });
      
      if (res.ok && res.data?.success) {
        showToast('Account deleted successfully', 'success');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        if (res.data?.message?.includes('Email verification required')) {
          setIsEmailVerified(false);
          setShowDeleteModal(false);
          await handleSendVerification('delete account');
        } else {
          showToast(res.data?.message || 'Failed to delete account', 'error');
        }
      }
    } catch (err) {
      showToast('Error deleting account', 'error');
    }
    setSaving(false);
  };

  const handleExportData = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/company/export-data', {
        method: 'POST'
      });
      
      if (res.ok && res.data?.success) {
        const data = res.data.data;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `missionhub-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!', 'success');
      } else {
        showToast(res.data?.message || 'Failed to export data', 'error');
      }
    } catch (err) {
      showToast('Error exporting data', 'error');
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Building },
    { id: 'password', label: 'Password', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-12 text-slate-950 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 sm:py-6">
      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteAccount}
        loading={saving}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleVerifyCode}
        action={verificationAction}
        loading={saving}
        error={verificationError}
      />

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
                Settings
              </h1>
              <p className="text-slate-500 text-sm">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-slate-950 text-white'
                : 'bg-white text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {companyData.logo ? (
                  <img 
                    src={companyData.logo} 
                    alt="Company Logo" 
                    className="w-32 h-32 rounded-2xl object-cover shadow-md border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-200 rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-950">
                    {(companyData.companyName || companyData.name || 'C').charAt(0)}
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden" 
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-950">Company Logo</h3>
                <p className="text-sm text-slate-500 mt-1">Upload a professional logo (Max 5MB)</p>
                <div className="flex gap-2 mt-3 justify-center sm:justify-start">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                  {companyData.logo && (
                    <button 
                      onClick={() => { setCompanyData({ ...companyData, logo: '' }); }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-600" />
              Company Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company Name"
                  icon={Building}
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
                <Input
                  label="Contact Email"
                  icon={Mail}
                  type="email"
                  value={companyData.email}
                  disabled
                  placeholder="company@example.com"
                />
                <Input
                  label="Phone Number"
                  icon={Phone}
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
                <Input
                  label="Location"
                  icon={MapPin}
                  value={companyData.location}
                  onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                  placeholder="Kigali, Rwanda"
                />
                <Input
                  label="Website"
                  icon={Globe}
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  placeholder="https://example.com"
                />
                <Select
                  label="Company Size"
                  options={[
                    { value: '', label: 'Select company size' },
                    { value: '1-10', label: '1-10 employees' },
                    { value: '11-50', label: '11-50 employees' },
                    { value: '51-200', label: '51-200 employees' },
                    { value: '201-500', label: '201-500 employees' },
                    { value: '500+', label: '500+ employees' }
                  ]}
                  value={companyData.companySize}
                  onChange={(e) => setCompanyData({ ...companyData, companySize: e.target.value })}
                />
              </div>

              <Select
                label="Industry"
                options={[
                  { value: '', label: 'Select industry' },
                  { value: 'technology', label: 'Technology' },
                  { value: 'finance', label: 'Finance & Banking' },
                  { value: 'healthcare', label: 'Healthcare' },
                  { value: 'education', label: 'Education' },
                  { value: 'retail', label: 'Retail & E-commerce' },
                  { value: 'manufacturing', label: 'Manufacturing' },
                  { value: 'consulting', label: 'Consulting' },
                  { value: 'telecommunications', label: 'Telecommunications' },
                  { value: 'real_estate', label: 'Real Estate' },
                  { value: 'hospitality', label: 'Hospitality & Tourism' },
                  { value: 'other', label: 'Other' }
                ]}
                value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Company Description
                  </span>
                </label>
                <textarea
                  value={companyData.description}
                  onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                  placeholder="Tell candidates about your company, culture, and what makes you unique..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                />
                <p className="mt-2 text-xs text-slate-500">{companyData.description.length}/500 characters</p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-600" />
              Change Password
            </h3>
            {!isEmailVerified ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">Email Verification Required</p>
                    <p className="text-sm text-slate-600 mt-1">You'll need to verify your email before changing your password.</p>
                    <button
                      onClick={() => handleSendVerification('change password')}
                      disabled={saving}
                      className="mt-3 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      Send Verification Code
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Your email is verified. You can change your password.
              </p>
            )}

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
              <div className="relative">
                <Input
                  label="Current Password"
                  icon={Key}
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                    setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                  }}
                  placeholder="Enter current password"
                  error={passwordErrors.currentPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-950"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  icon={Lock}
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    setPasswordErrors({ ...passwordErrors, newPassword: '' });
                  }}
                  placeholder="Enter new password"
                  error={passwordErrors.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-950"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  icon={Lock}
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                    setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                  }}
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-950"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                  ) : (
                    <><Key className="w-5 h-5" /> Change Password</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Password Tips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Password Tips
            </h3>
            <ul className="space-y-3">
              {[
                'Use at least 8 characters with a mix of letters, numbers, and symbols',
                'Avoid using the same password for multiple accounts',
                'Include uppercase and lowercase letters',
                'Consider using a password manager'
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-slate-600" />
              Notification Channels
            </h3>
            <p className="text-sm text-slate-500 mb-6">Choose how you want to receive notifications</p>
            <div className="space-y-3">
              <Toggle 
                label="Email" 
                description="Receive notifications via email"
                enabled={notifications.email}
                onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
              />
              <Toggle 
                label="SMS" 
                description="Get text message alerts"
                enabled={notifications.sms}
                onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })}
              />
              <Toggle 
                label="Push Notifications" 
                description="Browser push notifications"
                enabled={notifications.push}
                onChange={() => setNotifications({ ...notifications, push: !notifications.push })}
              />
              <Toggle 
                label="In-App Notifications" 
                description="Show notifications in the dashboard"
                enabled={notifications.inApp}
                onChange={() => setNotifications({ ...notifications, inApp: !notifications.inApp })}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              Notification Types
            </h3>
            <p className="text-sm text-slate-500 mb-6">Choose which notifications you want to receive</p>
            <div className="space-y-3">
              <Toggle 
                label="New Applications" 
                description="When someone applies to your jobs"
                enabled={notifications.newApplication}
                onChange={() => setNotifications({ ...notifications, newApplication: !notifications.newApplication })}
              />
              <Toggle 
                label="Interview Scheduled" 
                description="When interviews are scheduled or updated"
                enabled={notifications.interviewScheduled}
                onChange={() => setNotifications({ ...notifications, interviewScheduled: !notifications.interviewScheduled })}
              />
              <Toggle 
                label="New Messages" 
                description="When you receive messages"
                enabled={notifications.messageReceived}
                onChange={() => setNotifications({ ...notifications, messageReceived: !notifications.messageReceived })}
              />
              <Toggle 
                label="Weekly Digest" 
                description="Summary of your hiring activity"
                enabled={notifications.weeklyDigest}
                onChange={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-slate-600" />
              Theme
            </h3>
            <p className="text-sm text-slate-500 mb-6">Customize the look of your dashboard</p>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', icon: Sun, label: 'Light', colors: 'bg-yellow-100' },
                { id: 'dark', icon: Moon, label: 'Dark', colors: 'bg-slate-800' },
                { id: 'system', icon: Monitor, label: 'System', colors: 'bg-slate-200' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    appearance.theme === theme.id
                      ? 'border-slate-950 bg-slate-50'
                      : 'hover:border-slate-400 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl ${theme.colors} flex items-center justify-center mb-3`}>
                    <theme.icon className={`w-6 h-6 ${theme.id === 'light' ? 'text-yellow-600' : theme.id === 'dark' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-950">{theme.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-slate-600" />
              Display Settings
            </h3>
            <div className="space-y-3">
              <Toggle 
                label="Compact Mode" 
                description="Reduce spacing for more content"
                enabled={appearance.compactMode}
                onChange={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
              />
              <Toggle 
                label="Reduce Motion" 
                description="Minimize animations"
                enabled={appearance.reduceMotion}
                onChange={() => setAppearance({ ...appearance, reduceMotion: !appearance.reduceMotion })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Security Score</p>
                  <p className="text-lg font-bold text-slate-900">{security.twoFactor ? 'Strong' : 'Fair'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">2FA Status</p>
                  <p className="text-lg font-bold text-slate-900">{security.twoFactor ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Login Alerts</p>
                  <p className="text-lg font-bold text-slate-900">{security.loginAlerts ? 'On' : 'Off'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Active Sessions</p>
                  <p className="text-lg font-bold text-slate-900">1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-700" />
              Security Settings
            </h3>
            <p className="text-sm text-slate-500 mb-6">Manage your account security settings</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (security.twoFactor) {
                      const password = window.prompt('Enter your password to disable 2FA:');
                      if (!password) return;
                      
                      setSaving(true);
                      try {
                        const res = await apiFetch('/company/2fa/disable', {
                          method: 'POST',
                          body: JSON.stringify({ password })
                        });
                        if (res.ok && res.data?.success) {
                          setSecurity({ ...security, twoFactor: false });
                          showToast('2FA disabled successfully', 'success');
                        } else {
                          showToast(res.data?.message || 'Failed to disable 2FA', 'error');
                        }
                      } catch (err) {
                        showToast('Error disabling 2FA', 'error');
                      }
                      setSaving(false);
                    } else {
                      setSaving(true);
                      try {
                        const res = await apiFetch('/company/2fa/enable', {
                          method: 'POST'
                        });
                        if (res.ok && res.data?.success) {
                          const token = res.data.setupToken;
                          if (token) {
                            const userToken = window.prompt(`Your 2FA setup code is: ${token}\n\nEnter this code to verify:`);
                            if (userToken) {
                              const verifyRes = await apiFetch('/company/2fa/verify', {
                                method: 'POST',
                                body: JSON.stringify({ token: userToken })
                              });
                              if (verifyRes.ok && verifyRes.data?.success) {
                                setSecurity({ ...security, twoFactor: true });
                                showToast('2FA enabled successfully!', 'success');
                              } else {
                                showToast(verifyRes.data?.message || 'Invalid verification code', 'error');
                              }
                            }
                          }
                        } else {
                          showToast(res.data?.message || 'Failed to enable 2FA', 'error');
                        }
                      } catch (err) {
                        showToast('Error enabling 2FA', 'error');
                      }
                      setSaving(false);
                    }
                  }}
                  className={`relative w-14 h-7 rounded-full transition-all ${
                    security.twoFactor ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    security.twoFactor ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Login Alerts</p>
                    <p className="text-xs text-slate-500">Get notified of new sign-ins</p>
                  </div>
                </div>
                <button
                  onClick={() => setSecurity({ ...security, loginAlerts: !security.loginAlerts })}
                  className={`relative w-14 h-7 rounded-full transition-all ${
                    security.loginAlerts ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    security.loginAlerts ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-slate-700" />
              Active Sessions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">Current Session</p>
                    <p className="text-xs text-slate-500">Chrome on Windows - Kigali, Rwanda</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">Active</span>
              </div>
            </div>
            <button className="mt-4 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <XCircle className="w-4 h-4" /> Sign out all other sessions
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h3>
            <p className="text-sm text-slate-500 mb-4">These actions are irreversible. Please be careful.</p>
            
            {!isEmailVerified && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-700 font-medium">Email Verification Required</p>
                    <p className="text-xs text-slate-600 mt-1">You must verify your email before deleting your account.</p>
                    <button
                      onClick={() => handleSendVerification('delete account')}
                      disabled={saving}
                      className="mt-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                      Send Verification Code
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  if (isEmailVerified) {
                    setShowDeleteModal(true);
                  } else {
                    handleSendVerification('delete account');
                  }
                }}
                disabled={saving}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
              <button 
                onClick={handleExportData}
                disabled={saving}
                className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
