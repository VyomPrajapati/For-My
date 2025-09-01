import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Flower {
  id: string;
  type: 'rose' | 'tulip' | 'sunflower' | 'lily' | 'daisy' | 'heart';
  stage: 'seed' | 'sprout' | 'bud' | 'bloom' | 'full';
  plantedAt: number;
  lastWatered: number;
  health: number;
  x: number;
  y: number;
  isWatered: boolean;
}

interface LoveGardenProps {
  theme?: any;
  customEmojis?: string[];
}

const LoveGarden: React.FC<LoveGardenProps> = ({ theme, customEmojis = [] }) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [selectedSeed, setSelectedSeed] = useState<Flower['type']>('rose');
  const [showGarden, setShowGarden] = useState(false);
  const [waterLevel, setWaterLevel] = useState(100);
  const [lovePoints, setLovePoints] = useState(0);

  // Flower configurations
  const flowerTypes = {
    rose: { emoji: '🌹', name: 'Rose', growthTime: 30000, rarity: 'rare' },
    tulip: { emoji: '🌷', name: 'Tulip', growthTime: 25000, rarity: 'uncommon' },
    sunflower: { emoji: '🌻', name: 'Sunflower', growthTime: 20000, rarity: 'common' },
    lily: { emoji: '🌸', name: 'Lily', growthTime: 35000, rarity: 'rare' },
    daisy: { emoji: '🌼', name: 'Daisy', growthTime: 15000, rarity: 'common' },
    heart: { emoji: '💖', name: 'Heart Flower', growthTime: 40000, rarity: 'legendary' }
  };

  // Load garden data
  useEffect(() => {
    const savedGarden = localStorage.getItem('loveGarden');
    const savedPoints = localStorage.getItem('lovePoints');
    if (savedGarden) {
      setFlowers(JSON.parse(savedGarden));
    }
    if (savedPoints) {
      setLovePoints(parseInt(savedPoints));
    }
  }, []);

  // Escape key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGarden) {
        setShowGarden(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showGarden]);

  // Save garden data
  useEffect(() => {
    localStorage.setItem('loveGarden', JSON.stringify(flowers));
    localStorage.setItem('lovePoints', lovePoints.toString());
  }, [flowers, lovePoints]);

  // Garden growth system
  useEffect(() => {
    const growthInterval = setInterval(() => {
      setFlowers(prevFlowers => 
        prevFlowers.map(flower => {
          const now = Date.now();
          const timeSincePlanted = now - flower.plantedAt;
          const growthTime = flowerTypes[flower.type].growthTime;
          
          let newStage = flower.stage;
          if (timeSincePlanted >= growthTime * 0.8 && flower.stage === 'bud') {
            newStage = 'full';
          } else if (timeSincePlanted >= growthTime * 0.6 && flower.stage === 'sprout') {
            newStage = 'bud';
          } else if (timeSincePlanted >= growthTime * 0.3 && flower.stage === 'seed') {
            newStage = 'sprout';
          }

          // Health decreases over time if not watered
          let newHealth = flower.health;
          if (now - flower.lastWatered > 60000) { // 1 minute
            newHealth = Math.max(0, newHealth - 0.5);
          }

          return {
            ...flower,
            stage: newStage,
            health: newHealth
          };
        })
      );
    }, 5000); // Check every 5 seconds

    return () => clearInterval(growthInterval);
  }, []);

  // Water refill
  useEffect(() => {
    const waterRefill = setInterval(() => {
      setWaterLevel(prev => Math.min(100, prev + 10));
    }, 30000); // Refill every 30 seconds

    return () => clearInterval(waterRefill);
  }, []);

  // Plant a new flower
  const plantFlower = (e: React.MouseEvent) => {
    if (waterLevel < 20) return; // Need water to plant

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFlower: Flower = {
      id: Date.now().toString(),
      type: selectedSeed,
      stage: 'seed',
      plantedAt: Date.now(),
      lastWatered: Date.now(),
      health: 100,
      x,
      y,
      isWatered: false
    };

    setFlowers([...flowers, newFlower]);
    setWaterLevel(prev => prev - 20);
    setLovePoints(prev => prev + 10);
  };

  // Water a flower
  const waterFlower = (flowerId: string) => {
    if (waterLevel < 10) return; // Need water to water

    setFlowers(prevFlowers =>
      prevFlowers.map(flower =>
        flower.id === flowerId
          ? { ...flower, health: 100, lastWatered: Date.now(), isWatered: true }
          : flower
      )
    );

    setWaterLevel(prev => prev - 10);
    setLovePoints(prev => prev + 5);

    // Reset watered state after animation
    setTimeout(() => {
      setFlowers(prevFlowers =>
        prevFlowers.map(flower =>
          flower.id === flowerId
            ? { ...flower, isWatered: false }
            : flower
        )
      );
    }, 2000);
  };

  // Harvest a fully grown flower
  const harvestFlower = (flowerId: string) => {
    const flower = flowers.find(f => f.id === flowerId);
    if (!flower || flower.stage !== 'full') return;

    const rarity = flowerTypes[flower.type].rarity;
    let points = 0;

    switch (rarity) {
      case 'common': points = 20; break;
      case 'uncommon': points = 50; break;
      case 'rare': points = 100; break;
      case 'legendary': points = 500; break;
    }

    setLovePoints(prev => prev + points);
    setFlowers(prevFlowers => prevFlowers.filter(f => f.id !== flowerId));
  };

  // Get flower emoji based on stage
  const getFlowerEmoji = (flower: Flower) => {
    const baseEmoji = flowerTypes[flower.type].emoji;
    
    switch (flower.stage) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'bud': return '🌺';
      case 'full': return baseEmoji;
      default: return baseEmoji;
    }
  };

  // Get flower size based on stage
  const getFlowerSize = (flower: Flower) => {
    switch (flower.stage) {
      case 'seed': return 16;
      case 'sprout': return 20;
      case 'bud': return 24;
      case 'full': return 32;
      default: return 16;
    }
  };

  return (
    <>
             {/* Floating Garden Button */}
       <div className="fixed bottom-4 left-16 sm:left-20 z-50">
         <button
           onClick={() => setShowGarden(!showGarden)}
           className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-lg sm:text-xl"
         >
           🌸
         </button>
       </div>

      {/* Garden Modal */}
      <AnimatePresence>
        {showGarden && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowGarden(false)} // Close when clicking outside
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">🌸 Love Garden</h2>
                    <p className="text-sm opacity-90">Grow beautiful flowers with love!</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">💖 {lovePoints} Love Points</div>
                      <div className="text-sm opacity-90">💧 {waterLevel}% Water</div>
                    </div>
                    <button
                      onClick={() => setShowGarden(false)}
                      className="text-white hover:text-green-200 transition-colors text-2xl ml-4"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Seed Selection */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold mb-3">🌱 Choose Your Seeds</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {Object.entries(flowerTypes).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => setSelectedSeed(type as Flower['type'])}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedSeed === type
                            ? 'border-green-500 bg-green-100 scale-105'
                            : 'border-gray-200 hover:border-green-300 hover:scale-105'
                        }`}
                      >
                        <div className="text-2xl mb-1">{config.emoji}</div>
                        <div className="text-xs font-medium">{config.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{config.rarity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garden Area */}
                <div className="bg-gradient-to-b from-green-100 to-blue-100 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold mb-3">🌺 Your Garden</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    Click anywhere in the garden to plant {flowerTypes[selectedSeed].name} seeds! 💧 Water: {waterLevel}%
                  </div>
                  
                  <div
                    className="relative bg-gradient-to-b from-green-200 to-green-300 h-96 rounded-lg cursor-crosshair overflow-hidden"
                    onClick={plantFlower}
                  >
                    {/* Garden Grid Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute w-8 h-8 border border-green-400"
                          style={{
                            left: (i % 5) * 20 + '%',
                            top: Math.floor(i / 5) * 20 + '%'
                          }}
                        />
                      ))}
                    </div>

                    {/* Flowers */}
                    {flowers.map((flower) => (
                      <motion.div
                        key={flower.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute cursor-pointer"
                        style={{
                          left: flower.x,
                          top: flower.y,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (flower.stage === 'full') {
                            harvestFlower(flower.id);
                          } else {
                            waterFlower(flower.id);
                          }
                        }}
                      >
                        <div
                          className={`transition-all duration-500 ${
                            flower.isWatered ? 'animate-bounce' : ''
                          }`}
                          style={{
                            fontSize: `${getFlowerSize(flower)}px`,
                            filter: flower.health < 50 ? 'grayscale(50%)' : 'none'
                          }}
                        >
                          {getFlowerEmoji(flower)}
                        </div>
                        
                        {/* Health indicator */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: `${flower.health}%` }}
                            />
                          </div>
                        </div>

                        {/* Action hint */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                          {flower.stage === 'full' ? '🌾 Harvest' : '💧 Water'}
                        </div>
                      </motion.div>
                    ))}

                    {/* Garden Instructions */}
                    {flowers.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">🌱</div>
                          <p>Click anywhere to plant your first flower!</p>
                          <p className="text-sm">Use water to help them grow</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Garden Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 text-center">
                    <div className="text-2xl mb-1">🌸</div>
                    <div className="font-bold">{flowers.length}</div>
                    <div className="text-sm text-gray-600">Total Flowers</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl mb-1">💧</div>
                    <div className="font-bold">{waterLevel}%</div>
                    <div className="text-sm text-gray-600">Water Level</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl mb-1">🌺</div>
                    <div className="font-bold">{flowers.filter(f => f.stage === 'full').length}</div>
                    <div className="text-sm text-gray-600">Ready to Harvest</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl mb-1">💖</div>
                    <div className="font-bold">{lovePoints}</div>
                    <div className="text-sm text-gray-600">Love Points</div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="p-6 border-t">
                <button
                  onClick={() => setShowGarden(false)}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close Garden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoveGarden;
