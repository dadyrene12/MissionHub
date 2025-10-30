import React, { useState, useEffect, useRef } from 'react';
import {
  X, Lock, Rocket, Building, User, Mail, Eye, EyeOff,
  CheckCircle, Info, Sparkles, Shield, Zap, Star,
  ArrowRight, Clock, Smartphone, Globe, Heart,
  Crown, Target, Award, TrendingUp, Briefcase,
  ShieldCheck, Users, Check, AlertCircle, RotateCcw,
  Fingerprint, Key, UserPlus, LogIn, AlertTriangle,
  RefreshCw, ChevronRight, ExternalLink, Calendar
} from 'lucide-react';

// Helper: use Vite env var when provided, else use '/api' to go through Vite proxy in dev
const getApiBaseUrl = () => {
  return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '/api';
};

// ---

// Enhanced Reusable Modal Component with Ingazi styling
const Modal = ({ title, children, open, onClose }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn">
      {/* Ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />
      {/* Subtle vignette + blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      <div 
        className="w-full max-w-[480px] min-h-[560px] bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative animate-slideUp overflow-hidden border border-slate-200"
      >
        {/* Enhanced Header with Ingazi style */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-slate-300 text-sm mt-1">Join thousands of professionals</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 backdrop-blur-sm border border-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="h-[calc(560px-88px)] overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---

// API Service with Google OAuth
const authService = {
  async request(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on port 5000.');
      }
      throw error;
    }
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    });
  },

  async googleLogin(token) {
    return this.request('/auth/google', {
      method: 'POST',
      body: { token }
    });
  },

  async verifyEmail(verificationData) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: verificationData
    });
  },

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  },

  async resetPassword(resetData) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: resetData
    });
  },

  async resendVerificationCode(email) {
    // Call backend resend endpoint instead of simulating via register
    return this.request('/auth/resend-code', {
      method: 'POST',
      body: { email }
    });
  },

  async enableTwoFactor(userId) {
    return this.request('/auth/enable-2fa', {
      method: 'POST',
      body: { userId }
    });
  },

  async verifyTwoFactor(userId, code) {
    return this.request('/auth/verify-2fa', {
      method: 'POST',
      body: { userId, code }
    });
  }
};

// Google OAuth Hook
const useGoogleOAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setIsInitialized(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await authService.googleLogin(response.credential);
      
      if (data.success) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Reload to let App.jsx bootstrap from storage
        window.location.reload();
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during Google login');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = () => {
    if (!isInitialized) {
      setError('Google OAuth is not initialized yet. Please try again in a moment.');
      return;
    }
    
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return { signInWithGoogle, isLoading, error, isInitialized };
};

// ---

// Password Reset Modal Component with Ingazi styling
export const PasswordResetModal = ({ open, onClose, switchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Ref for the first verification code input to allow auto-focus
  const inputRefs = useRef([]);
  
  // UseEffect to focus on the first input when step 2 opens
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Password strength checker
  useEffect(() => {
    if (newPassword) {
      let strength = 0;
      if (newPassword.length >= 8) strength += 25;
      if (newPassword.length >= 12) strength += 25;
      if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) strength += 25;
      if (/[0-9]/.test(newPassword)) strength += 12.5;
      if (/[^A-Za-z0-9]/.test(newPassword)) strength += 12.5;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await authService.forgotPassword(email);
      
      if (data.success) {
        setSuccess('If an account with this email exists, a password reset code has been sent.');
        setStep(2);
        
        // Start countdown timer
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    const enteredCode = verificationCode.join('');
    
    if (enteredCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In a real app, you would verify the code first
      // For now, we'll just move to the next step
      setStep(3);
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const enteredCode = verificationCode.join('');
      const data = await authService.resetPassword({
        email: email,
        verificationCode: enteredCode,
        newPassword: newPassword
      });
      
      if (data.success) {
        setSuccess('Your password has been reset successfully. You can now login with your new password.');
        setTimeout(() => {
          onClose();
          switchToLogin();
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Move focus to the next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      // Move focus to the previous input on delete
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Allows backspace to delete and move back
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendCode = async () => {
    if (countdown === 0) {
      setIsLoading(true);
      setError('');
      try {
        const data = await authService.forgotPassword(email);
        
        if (data.success) {
          setSuccess('A new verification code has been sent to your email.');
          setCountdown(60);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) { clearInterval(timer); return 0; }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <Modal title="Reset Password" open={open} onClose={onClose}>
      <form onSubmit={step === 1 ? handleEmailSubmit : step === 2 ? handleVerificationSubmit : handlePasswordSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}
        
        {step === 1 && (
          <>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Forgot Your Password?</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Enter your email address and we'll send you a verification code to reset your password.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-500" />
                Email Address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" /> 
                  <span>Send Verification Code</span>
                </>
              )}
            </button>
          </>
        )}
        
        {step === 2 && (
          <>
            <button type="button" onClick={goBack} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors">
              <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" /> Back
            </button>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Enter Verification Code</p>
                  <p className="text-sm text-slate-600 mt-1">
                    We've sent a 6-digit verification code to <strong className="text-slate-900">{email}</strong>. Please enter it below.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Verification Code Inputs */}
            <div className="flex justify-center space-x-2 pt-2">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-verification-code-${index}`}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-10 h-12 text-center text-xl font-semibold text-slate-900 border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 bg-white"
                  required
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Resend Code */}
            <div className="text-center pt-2">
              {countdown > 0 ? (
                <p className="text-slate-500 font-medium flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Resend available in: <strong className="text-slate-700">{countdown}s</strong></span>
                </p>
              ) : (
                <button 
                  type="button"
                  onClick={resendCode}
                  disabled={isLoading}
                  className="font-medium text-slate-700 hover:text-slate-900 transition-all duration-200 inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isLoading ? 'Resending...' : 'Resend Code'}</span>
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isLoading || verificationCode.join('').length !== 6}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" /> 
                  <span>Verify Code</span>
                </>
              )}
            </button>
          </>
        )}
        
        {step === 3 && (
          <>
            <button type="button" onClick={goBack} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors">
              <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" /> Back
            </button>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Create New Password</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your email has been verified. Please create a new password for your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-slate-500" />
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-600">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 25 ? 'text-red-500' : 
                      passwordStrength <= 50 ? 'text-orange-500' : 
                      passwordStrength <= 75 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="mt-2 flex items-center space-x-2 text-xs text-slate-600">
                <Zap className="w-3 h-3" />
                <span>8+ characters with uppercase, lowercase & number</span>
              </div>
            </div>
            
            <div className="group">
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-slate-500" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" /> 
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </>
        )}
        
        {/* Login Link */}
        <div className="text-center mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600 text-sm">
            Remember your password?{' '}
            <button 
              type="button"
              onClick={() => { onClose(); switchToLogin(); }} 
              className="font-medium text-slate-800 hover:text-slate-900 transition-all duration-200 inline-flex items-center space-x-1"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </p>
        </div>
      </form>
    </Modal>
  );
};

// ---

// Enhanced Login Modal Component with Ingazi styling and Google OAuth
export const LoginModal = ({ open, onClose, handleLogin, switchToRegister, navigate }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  // Google OAuth hook
  const { signInWithGoogle, isLoading: googleLoading, error: googleError, isInitialized } = useGoogleOAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Delegate login to parent so state, storage, and downstream fetches are consistent
      await handleLogin({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      onClose();
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if 2FA is required
      if (error.message.includes('2FA_REQUIRED')) {
        setShowTwoFactor(true);
      } else {
        setError(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await authService.verifyTwoFactor(formData.email, twoFactorCode);
      
      if (data.success) {
        // Store auth data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Reload to let App.jsx bootstrap from storage
        window.location.reload();
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError(error.message || 'Two-factor authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };

  return (
    <>
      <Modal title="Welcome Back!" open={open} onClose={onClose}>
        {!showTwoFactor ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            
            {/* Google OAuth Error */}
            {googleError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{googleError}</span>
              </div>
            )}
            
            {/* Email Field */}
            <div className="group">
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-500" />
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            {/* Password Field */}
            <div className="group">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-slate-500" />
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                  />
                </div>
                <span className="text-slate-600 text-sm group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="font-medium text-slate-700 hover:text-slate-900 transition-all duration-200 flex items-center space-x-1 text-sm"
              >
                <span>Forgot password?</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" /> 
                  <span>Sign In to Your Account</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={googleLoading || !isInitialized}
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </>
                )}
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                Twitter
              </button>
            </div>

            {/* Security Footer */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Bank-level Security</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your information is protected with 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm">
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => { onClose(); switchToRegister(); }} 
                  className="font-medium text-slate-800 hover:text-slate-900 transition-all duration-200 inline-flex items-center space-x-1"
                >
                  <span>Create one now!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </p>
            </div>
          </form>
        ) : (
          // Two-Factor Authentication Form
          <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
            <button 
              type="button" 
              onClick={() => setShowTwoFactor(false)} 
              className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" /> Back to Login
            </button>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Fingerprint className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Enter the verification code from your authenticator app to complete the sign-in process.
                  </p>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            
            <div className="group">
              <label htmlFor="two-factor-code" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Key className="w-4 h-4 mr-2 text-slate-500" />
                Verification Code
              </label>
              <input
                id="two-factor-code"
                type="text"
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900 text-center text-xl tracking-widest"
                maxLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" /> 
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>
            
            <div className="text-center mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm">
                Can't access your authenticator?{' '}
                <button 
                  type="button"
                  className="font-medium text-slate-800 hover:text-slate-900 transition-all duration-200"
                >
                  Use backup code
                </button>
              </p>
            </div>
          </form>
        )}
      </Modal>
      
      <PasswordResetModal 
        open={showPasswordReset} 
        onClose={() => setShowPasswordReset(false)} 
        switchToLogin={() => {
          setShowPasswordReset(false);
        }}
      />
    </>
  );
};

// ---

// Enhanced Register Modal with Verification and Ingazi styling
export const RegisterModal = ({ open, onClose, handleRegister, switchToLogin, navigate }) => {
  const [userType, setUserType] = useState('jobSeeker');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'jobSeeker',
    agreeToTerms: false,
    newsletter: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Ref for the first verification code input to allow auto-focus
  const inputRefs = useRef([]);
  
  // Google OAuth hook
  const { signInWithGoogle, isLoading: googleLoading, error: googleError, isInitialized } = useGoogleOAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({ ...formData, userType: type });
  };
  
  // UseEffect to focus on the first input when step 2 opens
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 8) strength += 25;
      if (formData.password.length >= 12) strength += 25;
      if (/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 12.5;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 12.5;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const sendVerificationCode = async () => {
    try {
      console.log('🔍 Starting registration for:', formData.email);
      
      // Prepare registration data - MATCHES BACKEND EXPECTATIONS
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        newsletter: formData.newsletter
        // profile field is optional in backend
      };
      
      console.log('🔍 Sending registration data:', registrationData);
      
      const data = await authService.register(registrationData);
      console.log('🔍 Response data:', data);

      if (data.success) {
        console.log('✅ Registration successful');
        
        // Handle email service status - matches backend response
        if (data.emailSent === false && data.verificationCode) {
          console.log('🔑 DEVELOPMENT - Email failed, but here is your code:', data.verificationCode);
          setError('Email service is down. Please use the verification code from the browser console.');
        } else {
          console.log('✅ Email sent successfully');
        }
        
        // Start countdown timer
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
        
        return true;
      } else {
        throw new Error(data.message || data.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Handle specific error cases from backend
      if (error.message.includes('USER_EXISTS') || error.message.includes('already exists')) {
        setError('An account with this email already exists. Please try logging in.');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check if the backend is running on port 5000.');
      } else {
        setError(error.message || 'An unexpected error occurred during registration.');
      }
      return false;
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Enhanced validation - matches backend validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      setIsLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    if (formData.name.trim().length < 2) {
      setError('Please enter a valid name');
      setIsLoading(false);
      return;
    }
    
    const success = await sendVerificationCode();
    if (success) {
      setStep(2);
    }
    setIsLoading(false);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    const enteredCode = verificationCode.join('');
    
    if (enteredCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await authService.verifyEmail({
        email: formData.email,
        verificationCode: enteredCode
      });
      
      if (data.success) {
        // Persist auth state so App.jsx can pick it up
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Close modal and reload to let App.jsx bootstrap from storage
        onClose();
        window.location.reload();
        
        // Reset form and close modal
        setStep(1);
        setVerificationCode(['', '', '', '', '', '']);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: 'jobSeeker',
          agreeToTerms: false,
          newsletter: false
        });
        onClose();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Move focus to the next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (!value && index > 0) {
      // Move focus to the previous input on delete
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // Allows backspace to delete and move back
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendCode = async () => {
    if (countdown === 0) {
      setIsLoading(true);
      setError('');
      try {
        const res = await authService.resendVerificationCode(formData.email);
        if (res?.success) {
          // start countdown timer
          setCountdown(60);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) { clearInterval(timer); return 0; }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const goBack = () => {
    setStep(1);
    setVerificationCode(['', '', '', '', '', '']);
    setError('');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <Modal title="Join Mission Hub" open={open} onClose={onClose}>
      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium text-sm">{error}</span>
              </div>
              {error.toLowerCase().includes('already exists') && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm font-medium mb-1">It looks like you already have an account!</p>
                  <button type="button" onClick={() => { onClose(); switchToLogin(); }} className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1 transition-all duration-200">
                    <span>Switch to Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              {error.toLowerCase().includes('email service is down') && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800 text-sm font-medium">Check your browser's developer console (F12) for the verification code.</p>
                  </div>
              )}
              {error.toLowerCase().includes('cannot connect to server') && (
                  <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-orange-800 text-sm font-medium">Make sure the backend server is running on port 5000.</p>
                  </div>
              )}
            </div>
          )}
          
          {/* Google OAuth Error */}
          {googleError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{googleError}</span>
            </div>
          )}
          
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2 text-slate-500" />
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => handleUserTypeChange('jobSeeker')} 
                className={`p-4 border rounded-lg transition-all duration-200 relative ${
                  userType === 'jobSeeker' 
                    ? 'border-slate-800 bg-slate-100' 
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <User className={`w-8 h-8 mx-auto mb-2 transition-all duration-200 ${
                  userType === 'jobSeeker' ? 'text-slate-800' : 'text-slate-400'
                }`} />
                <div className="text-center">
                  <p className="font-medium text-slate-900 text-sm">Job Seeker</p>
                  <p className="text-xs text-slate-600 mt-1">Find your dream mission</p>
                </div>
                {userType === 'jobSeeker' && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 bg-slate-800 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => handleUserTypeChange('company')} 
                className={`p-4 border rounded-lg transition-all duration-200 relative ${
                  userType === 'company' 
                    ? 'border-slate-800 bg-slate-100' 
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <Building className={`w-8 h-8 mx-auto mb-2 transition-all duration-200 ${
                  userType === 'company' ? 'text-slate-800' : 'text-slate-400'
                }`} />
                <div className="text-center">
                  <p className="font-medium text-slate-900 text-sm">Mission Assigner</p>
                  <p className="text-xs text-slate-600 mt-1">Post missions & hire talent</p>
                </div>
                {userType === 'company' && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 bg-slate-800 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="group">
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-slate-500" />
                {userType === 'company' ? 'Company Name' : 'Full Name'} *
              </label>
              <div className="relative">
                <input 
                  id="register-name" 
                  name="name" 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder={userType === 'company' ? 'Your Company Name' : 'John Doe'} 
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900" 
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-500" />
                Email Address *
              </label>
              <div className="relative">
                <input 
                  id="register-email" 
                  name="email" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="you@example.com" 
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900" 
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-5 h-5 text-green-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-slate-500" />
                Password *
              </label>
              <div className="relative">
                <input 
                  id="register-password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Create a strong password" 
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900 pr-10" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-600">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 25 ? 'text-red-500' : 
                      passwordStrength <= 50 ? 'text-orange-500' : 
                      passwordStrength <= 75 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="mt-2 flex items-center space-x-2 text-xs text-slate-600">
                <Zap className="w-3 h-3" />
                <span>8+ characters with uppercase, lowercase & number</span>
              </div>
            </div>

            <div className="group">
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-slate-500" />
                Confirm Password *
              </label>
              <div className="relative">
                <input 
                  id="register-confirm-password" 
                  name="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  placeholder="Confirm your password" 
                  className="block w-full px-4 py-3 border border-slate-300 rounded-lg bg-white focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 placeholder-slate-400 text-slate-900 pr-10" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-all duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Terms and Newsletter */}
          <div className="space-y-3">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 mt-0.5"
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="font-medium text-slate-800 hover:text-slate-900 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-slate-800 hover:text-slate-900 transition-colors">
                  Privacy Policy
                </a>
              </span>
            </label>
            
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500 mt-0.5"
              />
              <span className="text-sm text-slate-600">
                Send me updates about new features and opportunities
              </span>
            </label>
          </div>
          
          {/* Submit Button (Step 1) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" /> 
                <span>Continue & Verify Email</span>
              </>
            )}
          </button>
          
          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or register with</span>
            </div>
          </div>

          {/* Social Registration */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleLoading || !isInitialized}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-lg bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          {/* Login Link (Step 1 Footer) */}
          <div className="text-center mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { onClose(); switchToLogin(); }} 
                className="font-medium text-slate-800 hover:text-slate-900 transition-all duration-200 inline-flex items-center space-x-1"
              >
                <span>Sign In Now!</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </p>
          </div>
        </form>
      ) : (
        /* Step 2: Email Verification */
        <form onSubmit={handleVerificationSubmit} className="space-y-5">
          <button type="button" onClick={goBack} className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center transition-colors">
            <ArrowRight className="w-4 h-4 mr-1 transform rotate-180" /> Back to Registration
          </button>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Verify Your Email</p>
                <p className="text-sm text-slate-600 mt-1">
                  We've sent a 6-digit verification code to <strong className="text-slate-900">{formData.email}</strong>. Please enter it below.
                </p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Verification Code Inputs */}
          <div className="flex justify-center space-x-2 pt-2">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`verification-code-${index}`}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 text-center text-xl font-semibold text-slate-900 border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 bg-white"
                required
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Resend Code */}
          <div className="text-center pt-2">
            {countdown > 0 ? (
              <p className="text-slate-500 font-medium flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Resend available in: <strong className="text-slate-700">{countdown}s</strong></span>
              </p>
            ) : (
              <button 
                type="button"
                onClick={resendCode}
                disabled={isLoading}
                className="font-medium text-slate-700 hover:text-slate-900 transition-all duration-200 inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isLoading ? 'Resending...' : 'Resend Code'}</span>
              </button>
            )}
          </div>
          
          {/* Submit Button (Step 2) */}
          <button
            type="submit"
            disabled={isLoading || verificationCode.join('').length !== 6}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-base font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> 
                <span>Verify & Complete</span>
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};