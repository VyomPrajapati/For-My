import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartShooterProps {
  onComplete: (hearts: number) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  heartsReward?: number;
  celebrationMessage?: string;
  gameDuration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  bulletSpeed?: number;
  heartSpawnRate?: number;
  comboMultiplier?: number;
}

interface HeartTarget {
  id: string;
  x: number;
  y: number;
  type: 'red' | 'pink' | 'golden' | 'diamond' | 'broken';
  size: number;
  speed: number;
  points: number;
  heartsReward: number;
  direction: 'left' | 'right' | 'up' | 'down' | 'diagonal';
  life: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isActive: boolean;
}

interface PopEffect {
  id: string;
  x: number;
  y: number;
  type: string;
  points: number;
  isActive: boolean;
}

interface GameState {
  score: number;
  heartsEarned: number;
  timeRemaining: number;
  combo: number;
  targets: HeartTarget[];
  bullets: Bullet[];
  popEffects: PopEffect[];
  gamePhase: 'playing' | 'gameOver';
  level: number;
  wave: number;
  hasStartedPlaying: boolean;
}

const HeartShooter: React.FC<HeartShooterProps> = ({
  onComplete,
  onClose,
  title = "Heart Shooter!",
  description = "Shoot hearts with your love gun to earn points and hearts!",
  heartsReward = 20,
  celebrationMessage = "🎯 Amazing shooting! You've hit all the hearts! 💘",
  gameDuration = 90,
  difficulty = 'medium',
  bulletSpeed = 15,
  heartSpawnRate = 3000,
  comboMultiplier = 5
}) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    heartsEarned: 0,
    timeRemaining: gameDuration,
    combo: 0,
    targets: [],
    bullets: [],
    popEffects: [],
    gamePhase: 'playing',
    level: 1,
    wave: 1,
    hasStartedPlaying: false
  });

  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastShotTime = useRef<number>(0);
  const comboTimeoutRef = useRef<NodeJS.Timeout>();

  // Heart type configurations
  const heartTypes = {
    red: { emoji: '🔴', points: 10, heartsReward: 1, probability: 0.4, size: 40, color: 'text-red-500' },
    pink: { emoji: '💖', points: 25, heartsReward: 2, probability: 0.3, size: 45, color: 'text-pink-500' },
    golden: { emoji: '💝', points: 50, heartsReward: 5, probability: 0.2, size: 50, color: 'text-yellow-500' },
    diamond: { emoji: '💎', points: 100, heartsReward: 10, probability: 0.08, size: 55, color: 'text-blue-500' },
    broken: { emoji: '💔', points: -20, heartsReward: -1, probability: 0.02, size: 35, color: 'text-gray-500' }
  };

  // Generate random heart
  const generateHeart = useCallback((level: number): HeartTarget => {
    const rand = Math.random();
    let selectedType: keyof typeof heartTypes = 'red';
    let cumulativeProb = 0;

    for (const [type, config] of Object.entries(heartTypes)) {
      cumulativeProb += config.probability;
      if (rand <= cumulativeProb) {
        selectedType = type as keyof typeof heartTypes;
        break;
      }
    }

    const config = heartTypes[selectedType];
    const directions: Array<'left' | 'right' | 'up' | 'down' | 'diagonal'> = ['left', 'right', 'up', 'down', 'diagonal'];
    
    return {
      id: `heart-${Date.now()}-${Math.random()}`,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 200) + 100,
      type: selectedType,
      size: config.size + (level * 2),
      speed: 1 + (level * 0.5) + Math.random() * 2,
      points: config.points,
      heartsReward: config.heartsReward,
      direction: directions[Math.floor(Math.random() * directions.length)],
      life: 100 + (level * 20)
    };
  }, []);

  // Spawn hearts
  const spawnHearts = useCallback((count: number, level: number) => {
    const newHearts = Array.from({ length: count }, () => generateHeart(level));
    setGameState(prev => ({
      ...prev,
      targets: [...prev.targets, ...newHearts]
    }));
  }, [generateHeart]);

  // Update heart positions
  const updateHearts = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      targets: prev.targets.map(heart => {
        let newX = heart.x;
        let newY = heart.y;

        switch (heart.direction) {
          case 'left':
            newX -= heart.speed;
            break;
          case 'right':
            newX += heart.speed;
            break;
          case 'up':
            newY -= heart.speed;
            break;
          case 'down':
            newY += heart.speed;
            break;
          case 'diagonal':
            newX += heart.speed * 0.7;
            newY += heart.speed * 0.7;
            break;
        }

        // Bounce off walls
        if (newX <= 0 || newX >= window.innerWidth - heart.size) {
          heart.direction = heart.direction === 'left' ? 'right' : 'left';
          newX = heart.x;
        }
        if (newY <= 100 || newY >= window.innerHeight - heart.size) {
          heart.direction = heart.direction === 'up' ? 'down' : 'up';
          newY = heart.y;
        }

        return {
          ...heart,
          x: newX,
          y: newY,
          life: heart.life - 0.5 // Hearts slowly lose life
        };
      }).filter(heart => heart.life > 0 && heart.x > -50 && heart.x < window.innerWidth + 50 && heart.y > -50 && heart.y < window.innerHeight + 50)
    }));
  }, []);

  // Update bullet positions
  const updateBullets = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      bullets: prev.bullets.map(bullet => {
        // Simple bullet movement towards target
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
          // Bullet reached target
          return { ...bullet, isActive: false };
        }
        
        const newX = bullet.x + (dx / distance) * bulletSpeed;
        const newY = bullet.y + (dy / distance) * bulletSpeed;
        
        return {
          ...bullet,
          x: newX,
          y: newY
        };
      }).filter(bullet => bullet.isActive)
    }));
  }, [bulletSpeed]);

  // Update pop effects with automatic cleanup
  const updatePopEffects = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      popEffects: prev.popEffects.map(effect => ({
        ...effect,
        isActive: effect.isActive && Date.now() - parseInt(effect.id.split('-')[1]) < 800
      })).filter(effect => effect.isActive)
    }));
  }, []);

  // Check collisions with improved precision
  const checkCollisions = useCallback(() => {
    setGameState(prev => {
      const newBullets = [...prev.bullets];
      const newTargets = [...prev.targets];
      const newPopEffects = [...prev.popEffects];
      let newScore = prev.score;
      let newHeartsEarned = prev.heartsEarned;
      let newCombo = prev.combo;

      // Check each bullet against each target with precise collision detection
      for (let i = newBullets.length - 1; i >= 0; i--) {
        const bullet = newBullets[i];
        if (!bullet.isActive) continue;

        for (let j = newTargets.length - 1; j >= 0; j--) {
          const target = newTargets[j];
          
          // More precise collision detection
          const distance = Math.sqrt(
            Math.pow(bullet.x - target.x, 2) + Math.pow(bullet.y - target.y, 2)
          );

          // Use target size for collision radius (more precise)
          const collisionRadius = target.size / 2;

          if (distance < collisionRadius) {
            // Hit! Create pop effect with timestamp
            const popEffect: PopEffect = {
              id: `pop-${Date.now()}-${Math.random()}`,
              x: target.x,
              y: target.y,
              type: target.type,
              points: target.points,
              isActive: true
            };

            newPopEffects.push(popEffect);

            // Update score and combo
            newScore += target.points;
            newHeartsEarned += target.heartsReward;
            newCombo += 1;
            
            // Remove bullet and target
            newBullets.splice(i, 1);
            newTargets.splice(j, 1);
            
            // Add combo bonus
            if (newCombo > 1) {
              const comboBonus = Math.floor(newCombo / 3) * comboMultiplier;
              newScore += comboBonus;
            }
            
            break;
          }
        }
      }

      return {
        ...prev,
        bullets: newBullets,
        targets: newTargets,
        popEffects: newPopEffects,
        score: newScore,
        heartsEarned: newHeartsEarned,
        combo: newCombo
      };
    });
  }, [comboMultiplier]);

  // Handle shooting
  const handleShoot = useCallback((e: React.MouseEvent) => {
    if (gameState.gamePhase !== 'playing') return;

    const now = Date.now();
    if (now - lastShotTime.current < 150) return; // Prevent rapid firing
    lastShotTime.current = now;

    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Create bullet from gun position (bottom center) to click position
    const bullet: Bullet = {
      id: `bullet-${Date.now()}`,
      x: rect.width / 2, // Gun position
      y: rect.height - 50, // Gun position
      targetX: clickX,
      targetY: clickY,
      isActive: true
    };

    setGameState(prev => ({
      ...prev,
      bullets: [...prev.bullets, bullet],
      hasStartedPlaying: true // Mark that user has started playing
    }));
  }, [gameState.gamePhase]);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateHearts();
      updateBullets();
      updatePopEffects();
      checkCollisions();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.gamePhase !== 'gameOver') {
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateHearts, updateBullets, updatePopEffects, checkCollisions, gameState.gamePhase]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return { ...prev, gamePhase: 'gameOver', timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Spawn waves
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      setGameState(prev => {
        const newLevel = Math.floor(prev.score / 500) + 1;
        const newWave = Math.floor(prev.score / 200) + 1;
        const spawnCount = Math.min(3 + newLevel, 8);
        
        spawnHearts(spawnCount, newLevel);
        
        return {
          ...prev,
          level: newLevel,
          wave: newWave
        };
      });
    }, heartSpawnRate);

    return () => clearInterval(spawnInterval);
  }, [spawnHearts, heartSpawnRate]);

  // Combo timeout
  useEffect(() => {
    if (gameState.combo > 0) {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      
      comboTimeoutRef.current = setTimeout(() => {
        setGameState(prev => ({ ...prev, combo: 0 }));
      }, 2000);
    }

    return () => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
    };
  }, [gameState.combo]);

  // Clean up old pop effects
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        popEffects: prev.popEffects.filter(effect => {
          const timestamp = parseInt(effect.id.split('-')[1]);
          return Date.now() - timestamp < 1000; // Remove effects older than 1 second
        })
      }));
    }, 500);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Handle game completion
  useEffect(() => {
    if (gameState.gamePhase === 'gameOver') {
      const totalHearts = Math.max(0, gameState.heartsEarned + Math.floor(gameState.score / 100));
      setTimeout(() => {
        onComplete(totalHearts);
      }, 2000);
    }
  }, [gameState.gamePhase, gameState.heartsEarned, gameState.score, onComplete]);

  // Spawn initial hearts
  useEffect(() => {
    spawnHearts(5, 1);
  }, [spawnHearts]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold font-comic">{title}</h2>
              <p className="text-sm opacity-90">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-pink-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">🎯</span>
                <span className="font-bold">Score: {gameState.score}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-pink-500">💖</span>
                <span className="font-bold">Hearts: {gameState.heartsEarned}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-500">⚡</span>
                <span className="font-bold">Combo: {gameState.combo}</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500">⏰</span>
                <span className="font-bold">{gameState.timeRemaining}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">📊</span>
                <span className="font-bold">Level {gameState.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div
          ref={gameRef}
          className="relative bg-gradient-to-b from-blue-100 to-pink-100 h-96 cursor-crosshair"
          onClick={handleShoot}
        >
          {/* Gun */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-4xl">🔫</div>
            <div className="text-xs text-center mt-1 font-comic">Click to shoot!</div>
          </div>

          {/* Hearts */}
          <AnimatePresence>
            {gameState.targets.map(heart => (
              <motion.div
                key={heart.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute pointer-events-none"
                style={{
                  left: heart.x,
                  top: heart.y,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${heart.size}px`
                }}
              >
                {heartTypes[heart.type].emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Bullets */}
          <AnimatePresence>
            {gameState.bullets.map(bullet => (
              <motion.div
                key={bullet.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute pointer-events-none"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="text-lg">💕</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pop Effects */}
          <AnimatePresence>
            {gameState.popEffects.map(effect => (
              <motion.div
                key={effect.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.5, 1],
                  opacity: [0, 1, 0],
                  y: [0, -30]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute pointer-events-none"
                style={{
                  left: effect.x,
                  top: effect.y,
                  transform: 'translate(-50%, -50%)'
                }}
                onAnimationComplete={() => {
                  // Mark effect as inactive after animation completes
                  setGameState(prev => ({
                    ...prev,
                    popEffects: prev.popEffects.map(e => 
                      e.id === effect.id ? { ...e, isActive: false } : e
                    )
                  }));
                }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">💥</div>
                  <div className={`text-sm font-bold ${heartTypes[effect.type as keyof typeof heartTypes]?.color || 'text-gray-600'}`}>
                    +{effect.points}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Game Over Overlay */}
          {gameState.gamePhase === 'gameOver' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Game Over!</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-lg">Final Score: <span className="font-bold text-red-500">{gameState.score}</span></p>
                  <p className="text-lg">Hearts Earned: <span className="font-bold text-pink-500">{gameState.heartsEarned}</span></p>
                  <p className="text-lg">Max Combo: <span className="font-bold text-purple-500">{gameState.combo}</span></p>
                </div>
                <div className="text-sm text-gray-600">
                  {celebrationMessage}
                </div>
              </div>
            </motion.div>
          )}

          {/* Instructions */}
          {gameState.gamePhase === 'playing' && !gameState.hasStartedPlaying && gameState.targets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2">How to Play</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Just click anywhere to shoot!<br/>
                  Hit hearts to earn points and hearts!<br/>
                  Avoid broken hearts (💔)!
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <div>🔴 10pts</div>
                  <div>💖 25pts</div>
                  <div>💝 50pts</div>
                  <div>💎 100pts</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
          <p>Click anywhere to shoot • Hit hearts for points • Chain hits for combos!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default HeartShooter;
