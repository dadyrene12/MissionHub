import React from 'react';
import { CreditCard, Clock, AlertCircle } from 'lucide-react';

export const PaymentsPage = ({ token, user, showToast }) => {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
            Payment is Closed
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-md mx-auto leading-relaxed">
            You are currently on the free plan. Paid activities and premium features will be available soon. Stay tuned for updates!
          </p>
          
          <div className="flex items-center justify-center gap-2 text-slate-500 bg-slate-50 py-3 px-6 rounded-xl inline-flex">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Free activities are always available</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-sm font-medium text-emerald-700">Post Jobs</p>
            <p className="text-xs text-emerald-600 mt-1">Available now</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-sm font-medium text-blue-700">View Applicants</p>
            <p className="text-xs text-blue-600 mt-1">Available now</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">✓</span>
            </div>
            <p className="text-sm font-medium text-purple-700">Messages</p>
            <p className="text-xs text-purple-600 mt-1">Available now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
