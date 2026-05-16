import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <User size={48} />
                </div>
              </div>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Edit Profile
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role} Account</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-blue-500 shadow-sm mr-4">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-green-500 shadow-sm mr-4">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Account Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">Verified</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-orange-500 shadow-sm mr-4">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="font-medium text-gray-900 dark:text-white">May 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
