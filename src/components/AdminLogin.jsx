import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.MODE === "development" ? "/api" : 'https://missionhubbackend.onrender.com/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'super_admin') {
      window.location.href = '/admin/dashboard';
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'super_admin');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 300);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('Server error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuperAdmin = async () => {
    if (!formData.email || !formData.password) {
      setError('Please enter email and password first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/auth/admin/create-super-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: 'Super Admin'
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        setSuccess('Super admin account created! You can now login.');
      } else {
        setError(data.message || 'Failed to create super admin account');
      }
    } catch (error) {
      console.error('Create admin error:', error);
      if (error.name === 'AbortError') {
        setError('Request timeout. Please try again.');
      } else {
        setError('Server error. Please make sure the backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">MissionHub Super Admin Access</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="admin@missionhub.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-300 text-sm">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In as Super Admin'
              )}
            </button>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCreateSuperAdmin}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Creating...' : 'Create Super Admin Account'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Use this if no admin account exists yet
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Protected with enterprise-grade security
          </p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <span className="text-xs text-gray-600">🔒 Encrypted</span>
            <span className="text-xs text-gray-600">🛡️ Secure</span>
            <span className="text-xs text-gray-600">🔐 Authenticated</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
