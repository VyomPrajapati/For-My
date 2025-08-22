import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithRole, AUTH_CONFIG } from '../utils/auth';
import { Heart, Crown, User } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'kaleshi_aurat' | 'user' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: 'kaleshi_aurat' | 'user') => {
    setSelectedRole(role);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if the selected role matches the credentials
      let isValidLogin = false;
      
      if (selectedRole === 'kaleshi_aurat') {
        // Only allow login if username and password match Kaleshi aurat credentials
        if (username === AUTH_CONFIG.KALESHI_AURAT.username && password === AUTH_CONFIG.KALESHI_AURAT.password) {
          isValidLogin = true;
        } else {
          setError('Invalid Kaleshi aurat credentials');
        }
      } else if (selectedRole === 'user') {
        // Only allow login if username and password match user credentials
        if (username === AUTH_CONFIG.USER.username && password === AUTH_CONFIG.USER.password) {
          isValidLogin = true;
        } else {
          setError('Invalid boondi ka laddu credentials');
        }
      }

      if (isValidLogin) {
        const user = loginWithRole(username, password, selectedRole);
        if (user) {
          onLoginSuccess();
          // Don't call onClose since this is the first screen
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSelectedRole(null);
    onClose();
  };

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to My Heart</h2>
                <p className="text-gray-600">Choose your role to continue</p>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                {/* Kaleshi aurat Section */}
                <motion.button
                  onClick={() => handleRoleSelect('kaleshi_aurat')}
                  className="w-full p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-purple-700 group-hover:text-purple-800">
                        👑 Kaleshi aurat
                      </h3>
                    </div>
                  </div>
                </motion.button>

                {/* boondi ka laddu Section */}
                <motion.button
                  onClick={() => handleRoleSelect('user')}
                  className="w-full p-6 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-blue-700 group-hover:text-blue-800">
                        👤 boondi ka laddu
                      </h3>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Close Button - Only show if onClose is provided and not the first screen */}
              {onClose && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Login Form Screen
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedRole === 'kaleshi_aurat' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-br from-blue-500 to-green-500'
              }`}>
                {selectedRole === 'kaleshi_aurat' ? (
                  <Crown className="w-10 h-10 text-white" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedRole === 'kaleshi_aurat' ? '👑 Kaleshi aurat' : '👤 boondi ka laddu'}
              </h2>
              <p className="text-gray-600">Enter your credentials to continue</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg text-white ${
                  selectedRole === 'kaleshi_aurat'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:ring-purple-200'
                    : 'bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 focus:ring-blue-200'
                }`}
              >
                {isLoading ? 'Logging in...' : 'Enter My Heart ❤️'}
              </button>
            </form>

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              ← Back to Role Selection
            </button>

            {/* Close Button - Only show if onClose is provided and not the first screen */}
            {onClose && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
