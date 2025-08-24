import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flower {
  id: number;
  type: string;
  emoji: string;
  growthStage: 'seed' | 'sprout' | 'bud' | 'bloom';
  daysToGrow: number;
  currentDay: number;
  isWatered: boolean;
  position: { x: number; y: number };
  heartsReward: number;
}

interface FlowerGardenProps {
  onComplete: (hearts: number) => void;
  onClose: () => void;
}

const FlowerGarden: React.FC<FlowerGardenProps> = ({ onComplete, onClose }) => {
  const [garden, setGarden] = useState<Flower[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [waterLevel, setWaterLevel] = useState<number>(10);
  const [day, setDay] = useState<number>(1);
  const [totalHearts, setTotalHearts] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);

  // Available flower types
  const flowerTypes = [
    { type: 'rose', emoji: '🌹', daysToGrow: 6, heartsReward: 3, rarity: 'rare' },
    { type: 'daisy', emoji: '🌸', daysToGrow: 3, heartsReward: 1, rarity: 'common' },
    { type: 'tulip', emoji: '🌷', daysToGrow: 4, heartsReward: 2, rarity: 'medium' },
    { type: 'sunflower', emoji: '🌻', daysToGrow: 7, heartsReward: 4, rarity: 'special' },
    { type: 'carnation', emoji: '🌺', daysToGrow: 5, heartsReward: 2, rarity: 'medium' },
    { type: 'marigold', emoji: '🌼', daysToGrow: 4, heartsReward: 1, rarity: 'common' }
  ];

  // Garden grid size
  const gridSize = 6;

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Game loop - advance time every 5 seconds
  useEffect(() => {
    const gameTimer = setInterval(() => {
      advanceTime();
    }, 5000);

    return () => clearInterval(gameTimer);
  }, [garden, day]);

  const initializeGame = () => {
    setGarden([]);
    setSelectedSeed(null);
    setWaterLevel(10);
    setDay(1);
    setTotalHearts(0);
    setGameCompleted(false);
    setShowCelebration(false);
    setShowInventory(false);
  };

  const advanceTime = () => {
    setDay(prevDay => prevDay + 1);
    
    // Update flower growth
    setGarden(prevGarden => {
      const updatedGarden = prevGarden.map(flower => {
        if (flower.growthStage === 'bloom') return flower;
        
        const newDay = flower.currentDay + 1;
        let newStage = flower.growthStage;
        
        if (newDay >= flower.daysToGrow * 0.25 && flower.growthStage === 'seed') {
          newStage = 'sprout';
        } else if (newDay >= flower.daysToGrow * 0.5 && flower.growthStage === 'sprout') {
          newStage = 'bud';
        } else if (newDay >= flower.daysToGrow && flower.growthStage === 'bud') {
          newStage = 'bloom';
        }
        
        return {
          ...flower,
          currentDay: newDay,
          growthStage: newStage,
          isWatered: false // Reset water status daily
        };
      });
      
      return updatedGarden;
    });
  };

  const plantFlower = (x: number, y: number) => {
    if (!selectedSeed || waterLevel < 2) return;
    
    const flowerType = flowerTypes.find(f => f.type === selectedSeed);
    if (!flowerType) return;
    
    // Check if position is empty
    const isOccupied = garden.some(f => f.position.x === x && f.position.y === y);
    if (isOccupied) return;
    
    const newFlower: Flower = {
      id: Date.now(),
      type: flowerType.type,
      emoji: flowerType.emoji,
      growthStage: 'seed',
      daysToGrow: flowerType.daysToGrow,
      currentDay: 0,
      isWatered: true,
      position: { x, y },
      heartsReward: flowerType.heartsReward
    };
    
    setGarden(prev => [...prev, newFlower]);
    setWaterLevel(prev => prev - 2);
    setSelectedSeed(null);
  };

  const waterFlower = (flowerId: number) => {
    if (waterLevel < 1) return;
    
    setGarden(prev => prev.map(f => 
      f.id === flowerId ? { ...f, isWatered: true } : f
    ));
    setWaterLevel(prev => prev - 1);
  };

  const harvestFlower = (flowerId: number) => {
    const flower = garden.find(f => f.id === flowerId);
    if (!flower || flower.growthStage !== 'bloom') return;
    
    setTotalHearts(prev => prev + flower.heartsReward);
    setGarden(prev => prev.filter(f => f.id !== flowerId));
    
    // Check if all flowers are harvested
    const remainingFlowers = garden.filter(f => f.id !== flowerId);
    if (remainingFlowers.length === 0) {
      setTimeout(() => {
        setGameCompleted(true);
        setShowCelebration(true);
        onComplete(totalHearts + flower.heartsReward);
      }, 1000);
    }
  };

  const getGrowthStageEmoji = (stage: string) => {
    switch (stage) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'bud': return '🌺';
      case 'bloom': return '🌸';
      default: return '🌱';
    }
  };

  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case 'seed': return 'bg-brown-200';
      case 'sprout': return 'bg-green-200';
      case 'bud': return 'bg-pink-200';
      case 'bloom': return 'bg-gradient-to-br from-pink-300 to-purple-300';
      default: return 'bg-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-green-600';
      case 'medium': return 'text-blue-600';
      case 'rare': return 'text-purple-600';
      case 'special': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

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
        className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-600 mb-2">🌺 Flower Garden of Love 🌺</h2>
          <p className="text-gray-600">Plant, water, and grow flowers to earn hearts!</p>
          
          {/* Game Stats */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-green-500 font-semibold">Day: {day}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-blue-500 font-semibold">💧 Water: {waterLevel}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-pink-500 font-semibold">💖 Hearts: {totalHearts}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-purple-500 font-semibold">🌱 Flowers: {garden.length}</span>
            </div>
          </div>
        </div>

        {/* Garden Grid */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h3 className="text-xl font-semibold text-center mb-4 text-gray-700">Your Garden</h3>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: gridSize * gridSize }, (_, index) => {
              const x = index % gridSize;
              const y = Math.floor(index / gridSize);
              const flower = garden.find(f => f.position.x === x && f.position.y === y);
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center text-2xl
                    transition-all duration-300
                    ${flower 
                      ? `${getGrowthStageColor(flower.growthStage)} border-solid` 
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => {
                    if (flower) {
                      if (flower.growthStage === 'bloom') {
                        harvestFlower(flower.id);
                      } else if (!flower.isWatered) {
                        waterFlower(flower.id);
                      }
                    } else if (selectedSeed) {
                      plantFlower(x, y);
                    }
                  }}
                >
                  {flower ? (
                    <div className="text-center">
                      <div className="text-3xl mb-1">
                        {flower.growthStage === 'bloom' ? flower.emoji : getGrowthStageEmoji(flower.growthStage)}
                      </div>
                      {flower.growthStage !== 'bloom' && (
                        <div className="text-xs text-gray-600">
                          {flower.isWatered ? '💧' : '🌵'}
                        </div>
                      )}
                    </div>
                  ) : selectedSeed ? (
                    <div className="text-green-500 text-sm">🌱</div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Seed Inventory */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Seed Inventory</h3>
            <button
              onClick={() => setShowInventory(!showInventory)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              {showInventory ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {flowerTypes.map((flowerType) => (
              <motion.button
                key={flowerType.type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSeed(flowerType.type)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${selectedSeed === flowerType.type
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }
                `}
              >
                <div className="text-3xl mb-2">{flowerType.emoji}</div>
                <div className="font-semibold text-gray-800 capitalize">{flowerType.type}</div>
                <div className="text-sm text-gray-600">{flowerType.daysToGrow} days</div>
                <div className={`text-sm font-semibold ${getRarityColor(flowerType.rarity)}`}>
                  +{flowerType.heartsReward} 💖
                </div>
                
                {showInventory && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div>Rarity: {flowerType.rarity}</div>
                    <div>Water cost: 2 💧</div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          
          {selectedSeed && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
              <p className="text-green-800 font-semibold">
                🌱 Selected: {selectedSeed.charAt(0).toUpperCase() + selectedSeed.slice(1)} seed
              </p>
              <p className="text-green-600 text-sm">Click on an empty garden plot to plant!</p>
            </div>
          )}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initializeGame}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🌱 New Garden
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ❌ Close Garden
          </motion.button>
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60"
              onClick={() => setShowCelebration(false)}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 text-center max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="text-8xl mb-4"
                >
                  🌺
                </motion.div>
                
                <h3 className="text-2xl font-bold text-green-600 mb-4">Garden Master!</h3>
                <p className="text-gray-700 mb-6">You've harvested all your flowers!</p>
                
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold mb-4">
                  💖 +{totalHearts} Hearts Earned! 💖
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCelebration(false)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
                >
                  🌸 Celebrate!
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default FlowerGarden;
