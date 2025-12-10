import React, { useState } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Settings: React.FC<{ user: User; onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDisable2FA = async () => {
      if (window.confirm("Are you sure you want to disable 2FA? Your account will be less secure.")) {
          setLoading(true);
          await authService.disableTwoFactor(user.id);
          onUpdateUser({ ...user, isTwoFactorEnabled: false });
          setLoading(false);
      }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account security and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Card */}
          <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-2xl">🔒</span>
                      Security
                  </h3>
                  {user.isTwoFactorEnabled ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Secure</span>
                  ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Attention</span>
                  )}
              </div>
              <div className="p-8">
                  <div className="flex items-start justify-between">
                      <div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                              Add an extra layer of security to your account by requiring a code from your authenticator app when logging in.
                          </p>
                      </div>
                  </div>
                  
                  <div className="mt-8">
                      {user.isTwoFactorEnabled ? (
                           <div className="flex items-center gap-4">
                               <button 
                                   onClick={handleDisable2FA}
                                   disabled={loading}
                                   className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                               >
                                   Disable 2FA
                               </button>
                               <span className="text-sm text-green-600 font-medium flex items-center gap-2">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                   Enabled
                               </span>
                           </div>
                      ) : (
                          <button 
                              onClick={() => navigate('/setup-2fa')}
                              className="w-full sm:w-auto brand-gradient text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                          >
                              <span>Enable Authenticator</span>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </button>
                      )}
                  </div>
              </div>
          </div>
          
          {/* Profile Card (Placeholder) */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden opacity-75">
               <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xl font-display font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-2xl">👤</span>
                      Profile
                  </h3>
               </div>
               <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={user.avatarUrl} className="w-20 h-20 rounded-2xl shadow-md" alt="" />
                        <div>
                            <p className="font-bold text-lg text-gray-900">{user.name}</p>
                            <p className="text-gray-500">{user.email}</p>
                            <p className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg w-fit mt-2">{user.role}</p>
                        </div>
                    </div>
                    <button className="text-gray-400 font-medium text-sm cursor-not-allowed" disabled>Edit Profile (Coming Soon)</button>
               </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;