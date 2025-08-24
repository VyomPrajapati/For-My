import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  requirement: string;
  currentProgress: number;
  targetProgress: number;
  heartsReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
  color: string;
}

interface AchievementSystemProps {
  onClose: () => void;
  onHeartsEarned: (hearts: number) => void;
  gameStats: {
    quizCompleted: boolean;
    memoryCardCompleted: boolean;
    loveSongCompleted: boolean;
    flowerGardenCompleted: boolean;
    totalHearts: number;
    gamesPlayed: number;
    daysActive: number;
  };
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  onClose, 
  onHeartsEarned, 
  gameStats 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showClaimed, setShowClaimed] = useState<boolean>(false);
  const [totalHeartsEarned, setTotalHeartsEarned] = useState<number>(0);

  // Initialize achievements
  useEffect(() => {
    initializeAchievements();
  }, []);

  // Update achievements based on game stats
  useEffect(() => {
    updateAchievements();
  }, [gameStats]);

  const initializeAchievements = () => {
    const initialAchievements: Achievement[] = [
      // Daily Achievements
      {
        id: 'daily_quiz',
        title: 'Quiz Master',
        description: 'Complete the daily quiz',
        category: 'daily',
        requirement: 'Answer all quiz questions correctly',
        currentProgress: 0,
        targetProgress: 1,
        heartsReward: 2,
        isCompleted: false,
        isClaimed: false,
        icon: '🧠',
        color: 'bg-blue-500'
      },
      {
        id: 'daily_games',
        title: 'Game Enthusiast',
        description: 'Play at least 2 games today',
        category: 'daily',
        requirement: 'Play 2 different games',
        currentProgress: 0,
        targetProgress: 2,
        heartsReward: 1,
        isCompleted: false,
        isClaimed: false,
        icon: '🎮',
        color: 'bg-purple-500'
      },
      {
        id: 'daily_hearts',
        title: 'Heart Collector',
        description: 'Earn 5 hearts today',
        category: 'daily',
        requirement: 'Collect 5 hearts from games',
        currentProgress: 0,
        targetProgress: 5,
        heartsReward: 3,
        isCompleted: false,
        isClaimed: false,
        icon: '💖',
        color: 'bg-pink-500'
      },

      // Weekly Achievements
      {
        id: 'weekly_perfect',
        title: 'Perfect Week',
        description: 'Complete all daily tasks for 7 days',
        category: 'weekly',
        requirement: 'Complete 7 daily achievements',
        currentProgress: 0,
        targetProgress: 7,
        heartsReward: 10,
        isCompleted: false,
        isClaimed: false,
        icon: '⭐',
        color: 'bg-yellow-500'
      },
      {
        id: 'weekly_games',
        title: 'Game Champion',
        description: 'Win 10 games this week',
        category: 'weekly',
        requirement: 'Complete 10 games successfully',
        currentProgress: 0,
        targetProgress: 10,
        heartsReward: 8,
        isCompleted: false,
        isClaimed: false,
        icon: '🏆',
        color: 'bg-green-500'
      },
      {
        id: 'weekly_hearts',
        title: 'Heart Millionaire',
        description: 'Earn 50 hearts this week',
        category: 'weekly',
        requirement: 'Collect 50 hearts total',
        currentProgress: 0,
        targetProgress: 50,
        heartsReward: 15,
        isCompleted: false,
        isClaimed: false,
        icon: '💎',
        color: 'bg-red-500'
      },

      // Monthly Achievements
      {
        id: 'monthly_attendance',
        title: 'Loyal Player',
        description: 'Visit for 30 consecutive days',
        category: 'monthly',
        requirement: 'Be active for 30 days',
        currentProgress: 0,
        targetProgress: 30,
        heartsReward: 25,
        isCompleted: false,
        isClaimed: false,
        icon: '📅',
        color: 'bg-indigo-500'
      },
      {
        id: 'monthly_master',
        title: 'Game Master',
        description: 'Complete all games at least once',
        category: 'monthly',
        requirement: 'Finish all 4 games',
        currentProgress: 0,
        targetProgress: 4,
        heartsReward: 30,
        isCompleted: false,
        isClaimed: false,
        icon: '👑',
        color: 'bg-purple-600'
      },
      {
        id: 'monthly_hearts',
        title: 'Heart Legend',
        description: 'Earn 200 hearts this month',
        category: 'monthly',
        requirement: 'Collect 200 hearts total',
        currentProgress: 0,
        targetProgress: 200,
        heartsReward: 40,
        isCompleted: false,
        isClaimed: false,
        icon: '💫',
        color: 'bg-pink-600'
      },

      // Special Achievements
      {
        id: 'special_first_win',
        title: 'First Victory',
        description: 'Win your first game ever',
        category: 'special',
        requirement: 'Complete any game for the first time',
        currentProgress: 0,
        targetProgress: 1,
        heartsReward: 5,
        isCompleted: false,
        isClaimed: false,
        icon: '🎯',
        color: 'bg-orange-500'
      },
      {
        id: 'special_all_games',
        title: 'Completionist',
        description: 'Complete all games in one session',
        category: 'special',
        requirement: 'Finish all 4 games in one day',
        currentProgress: 0,
        targetProgress: 4,
        heartsReward: 20,
        isCompleted: false,
        isClaimed: false,
        icon: '🌟',
        color: 'bg-cyan-500'
      },
      {
        id: 'special_hearts_master',
        title: 'Heart Master',
        description: 'Earn 100 hearts in total',
        category: 'special',
        requirement: 'Reach 100 total hearts',
        currentProgress: 0,
        targetProgress: 100,
        heartsReward: 25,
        isCompleted: false,
        isClaimed: false,
        icon: '💝',
        color: 'bg-rose-500'
      }
    ];

    setAchievements(initialAchievements);
  };

  const updateAchievements = () => {
    setAchievements(prev => prev.map(achievement => {
      let currentProgress = 0;
      let isCompleted = false;

      switch (achievement.id) {
        case 'daily_quiz':
          currentProgress = gameStats.quizCompleted ? 1 : 0;
          break;
        case 'daily_games':
          currentProgress = Math.min(gameStats.gamesPlayed, 2);
          break;
        case 'daily_hearts':
          currentProgress = Math.min(gameStats.totalHearts, 5);
          break;
        case 'weekly_games':
          currentProgress = Math.min(gameStats.gamesPlayed, 10);
          break;
        case 'weekly_hearts':
          currentProgress = Math.min(gameStats.totalHearts, 50);
          break;
        case 'monthly_attendance':
          currentProgress = Math.min(gameStats.daysActive, 30);
          break;
        case 'monthly_master':
          const completedGames = [
            gameStats.quizCompleted,
            gameStats.memoryCardCompleted,
            gameStats.loveSongCompleted,
            gameStats.flowerGardenCompleted
          ].filter(Boolean).length;
          currentProgress = completedGames;
          break;
        case 'monthly_hearts':
          currentProgress = Math.min(gameStats.totalHearts, 200);
          break;
        case 'special_first_win':
          currentProgress = gameStats.gamesPlayed > 0 ? 1 : 0;
          break;
        case 'special_all_games':
          const allCompleted = [
            gameStats.quizCompleted,
            gameStats.memoryCardCompleted,
            gameStats.loveSongCompleted,
            gameStats.flowerGardenCompleted
          ].every(Boolean);
          currentProgress = allCompleted ? 4 : 0;
          break;
        case 'special_hearts_master':
          currentProgress = Math.min(gameStats.totalHearts, 100);
          break;
      }

      isCompleted = currentProgress >= achievement.targetProgress;

      return {
        ...achievement,
        currentProgress,
        isCompleted
      };
    }));
  };

  const claimAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.isCompleted || achievement.isClaimed) return;

    setAchievements(prev => prev.map(a => 
      a.id === achievementId ? { ...a, isClaimed: true } : a
    ));

    setTotalHeartsEarned(prev => prev + achievement.heartsReward);
    onHeartsEarned(achievement.heartsReward);
  };

  const claimAllCompleted = () => {
    const completedUnclaimed = achievements.filter(a => a.isCompleted && !a.isClaimed);
    const totalHearts = completedUnclaimed.reduce((sum, a) => sum + a.heartsReward, 0);

    setAchievements(prev => prev.map(a => 
      a.isCompleted && !a.isClaimed ? { ...a, isClaimed: true } : a
    ));

    setTotalHeartsEarned(prev => prev + totalHearts);
    onHeartsEarned(totalHearts);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      case 'monthly': return 'bg-indigo-100 text-indigo-800';
      case 'special': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '🗓️';
      case 'special': return '⭐';
      default: return '🏆';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'claimable') return achievement.isCompleted && !achievement.isClaimed;
    return achievement.category === selectedCategory;
  });

  const completedCount = achievements.filter(a => a.isCompleted).length;
  const totalCount = achievements.length;
  const claimableCount = achievements.filter(a => a.isCompleted && !a.isClaimed).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-purple-600 mb-2">🏆 Achievement System 🏆</h2>
          <p className="text-gray-600">Complete challenges and earn hearts!</p>
          
          {/* Progress Overview */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-purple-500 font-semibold">Completed: {completedCount}/{totalCount}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-pink-500 font-semibold">Claimable: {claimableCount}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-green-500 font-semibold">Hearts Earned: {totalHeartsEarned}</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap justify-center gap-2">
            {['all', 'daily', 'weekly', 'monthly', 'special', 'claimable'].map(category => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-full font-semibold transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                {category === 'all' ? '🏆 All' :
                 category === 'claimable' ? '💎 Claimable' :
                 `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`
                }
              </motion.button>
            ))}
          </div>
        </div>

        {/* Claim All Button */}
        {claimableCount > 0 && (
          <div className="text-center mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={claimAllCompleted}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              💎 Claim All Completed ({claimableCount})
            </motion.button>
          </div>
        )}

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02 }}
              className={`
                bg-white rounded-xl p-4 shadow-lg border-2 transition-all duration-200
                ${achievement.isCompleted 
                  ? achievement.isClaimed 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-green-500 bg-green-50'
                  : 'border-gray-200'
                }
              `}
            >
              {/* Achievement Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full ${achievement.color} flex items-center justify-center text-2xl`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{achievement.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(achievement.category)}`}>
                    {getCategoryIcon(achievement.category)} {achievement.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{achievement.currentProgress}/{achievement.targetProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      achievement.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((achievement.currentProgress / achievement.targetProgress) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Requirement */}
              <p className="text-xs text-gray-500 mb-3 italic">{achievement.requirement}</p>

              {/* Reward and Action */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-pink-600">
                  +{achievement.heartsReward} 💖
                </span>
                
                {achievement.isCompleted && !achievement.isClaimed ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => claimAchievement(achievement.id)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    💎 Claim
                  </motion.button>
                ) : achievement.isClaimed ? (
                  <span className="text-green-600 text-sm font-semibold">✅ Claimed</span>
                ) : (
                  <span className="text-gray-400 text-sm">🔒 Locked</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ❌ Close Achievements
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementSystem;
