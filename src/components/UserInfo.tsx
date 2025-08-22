import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCurrentUser, logout } from '../utils/auth';
import { getProfilePicture, saveProfilePicture, removeProfilePicture } from '../utils/contentManager';

interface UserInfoProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: any;
  onLogout: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ isLoggedIn, isAdmin: isKaleshiAuratUser, user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  if (!isLoggedIn || !user) return null;

  // Load profile picture on component mount
  useEffect(() => {
    const userType = isKaleshiAuratUser ? 'kaleshiAurat' : 'user';
    const profilePic = getProfilePicture(userType);
    setCurrentProfilePicture(profilePic);
  }, [isKaleshiAuratUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const userType = isKaleshiAuratUser ? 'kaleshiAurat' : 'user';
        
        saveProfilePicture(userType, imageData);
        setCurrentProfilePicture(imageData);
        setIsUploading(false);
        setShowProfileMenu(false);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    const userType = isKaleshiAuratUser ? 'kaleshiAurat' : 'user';
    removeProfilePicture(userType);
    setCurrentProfilePicture(null);
    setShowProfileMenu(false);
  };

  const userType = isKaleshiAuratUser ? 'kaleshiAurat' : 'user';

  return (
    <motion.div
      className="fixed top-2 md:top-4 right-2 md:right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 md:p-3 z-40"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 md:gap-3">
        {/* User Avatar with Profile Picture */}
        <div className="relative">
          <div 
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer transition-transform hover:scale-110 ${
              isKaleshiAuratUser 
                ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                : 'bg-gradient-to-br from-blue-500 to-green-500'
            }`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Click to change profile picture"
          >
            {currentProfilePicture ? (
              <img 
                src={currentProfilePicture} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* Profile Picture Menu */}
          {showProfileMenu && (
            <motion.div
              ref={menuRef}
              className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px] z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? '⏳ Uploading...' : '📷 Upload New Picture'}
                </button>
                {currentProfilePicture && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    🗑️ Remove Picture
                  </button>
                )}
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  ❌ Close
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          className="hidden"
        />

        {/* User Details */}
        <div className="text-xs md:text-sm">
          <div className="font-medium text-gray-800">
            {user.username}
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${
            isKaleshiAuratUser
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isKaleshiAuratUser ? '👑 Kaleshi aurat' : '👤 boondi ka laddu'}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Logout"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default UserInfo;
