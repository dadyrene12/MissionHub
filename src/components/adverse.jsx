import React from 'react';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';

const Adverse = ({ user = {}, showNotification }) => {
  // Safe access to user properties
  const userName = user?.name || 'Guest';
  const userEmail = user?.email || 'Not logged in';
  const userType = user?.userType || 'unknown';
  const isVerified = user?.isVerified || false;

  return (
    <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-40">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          isVerified ? 'bg-green-100' : 'bg-yellow-100'
        }`}>
          {isVerified ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Account Status
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as: <span className="font-medium">{userName}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {userEmail} • {userType === 'company' ? 'Company' : 'Job Seeker'} account
          </p>
          {!isVerified && user?.email && (
            <button 
              onClick={() => {
                if (showNotification) {
                  showNotification('Verification email sent! Please check your inbox.', 'info');
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium flex items-center"
            >
              <Mail className="w-3 h-3 mr-1" />
              Verify Email
            </button>
          )}
          {userType === 'company' && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Company Dashboard Active
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Adverse;