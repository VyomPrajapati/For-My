import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

interface CatchTheKittyProps {
  onComplete: (hearts: number) => void;
  onClose: () => void;
  customImages?: string[];
  title?: string;
  description?: string;
  heartsReward?: number;
  celebrationMessage?: string;
  numberOfKitties?: number;
  fallSpeed?: number;
}

interface Kitty {
  id: number;
  x: number;
  y: number;
  caught: boolean;
  image: string;
}

interface Basket {
  x: number;
  width: number;
}

const CatchTheKitty: React.FC<CatchTheKittyProps> = ({
  onComplete,
  onClose,
  customImages = [],
  title = "Catch the Kitty",
  description = "Catch falling kitties in your basket!",
  heartsReward = 15,
  celebrationMessage = "Congratulations! You caught all the kitties! 🐱💕",
  numberOfKitties = 10,
  fallSpeed = 2
}) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [kitties, setKitties] = useState<Kitty[]>([]);
  const [basket, setBasket] = useState<Basket>({ x: 50, width: 20 });
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const [lives, setLives] = useState(3);
  const [missedKitties, setMissedKitties] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Default kitty images (cute emojis)
  const defaultKittyImages = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
  
  // Use custom images if available, otherwise use default emojis
  const kittyImages = customImages.length >= numberOfKitties ? customImages : defaultKittyImages;

  // Initialize game area dimensions
  useEffect(() => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setGameArea({ width: rect.width, height: rect.height });
      setBasket(prev => ({ ...prev, x: rect.width / 2 - 10 }));
    }
  }, []);

  // Handle mouse/touch movement for basket
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!gameStarted || gameOver) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const newX = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(0, Math.min(100 - basket.width, newX));
    
    setBasket(prev => ({ ...prev, x: clampedX }));
  }, [gameStarted, gameOver, basket.width]);

  // Handle touch events for mobile
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseMove(e);
  }, [handleMouseMove]);

  // Spawn new kitties
  const spawnKitty = useCallback(() => {
    if (kitties.length >= numberOfKitties) return;
    
    const newKitty: Kitty = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // Random x position (10% to 90%)
      y: -20, // Start above the game area
      caught: false,
      image: kittyImages[Math.floor(Math.random() * kittyImages.length)]
    };
    
    setKitties(prev => [...prev, newKitty]);
  }, [kitties.length, numberOfKitties, kittyImages]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameStarted || gameOver) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    // Update game time
    setGameTime(prev => prev + deltaTime);
    
    // Spawn kitties periodically
    if (Math.random() < 0.02 * fallSpeed) { // Adjust spawn rate based on speed
      spawnKitty();
    }
    
    // Update kitty positions
    setKitties(prev => prev.map(kitty => {
      if (kitty.caught) return kitty;
      
      const newY = kitty.y + (fallSpeed * deltaTime * 0.05);
      
      // Check if kitty hits the basket
      if (newY >= 80 && newY <= 90) { // Basket area
        const kittyCenterX = kitty.x + 2.5; // Kitty center (assuming 5% width)
        const basketLeft = basket.x;
        const basketRight = basket.x + basket.width;
        
        if (kittyCenterX >= basketLeft && kittyCenterX <= basketRight) {
          // Kitty caught!
          setScore(prev => prev + 1);
          return { ...kitty, caught: true };
        }
      }
      
      // Check if kitty missed the basket
      if (newY > 95) {
        setMissedKitties(prev => prev + 1);
        setLives(prev => prev - 1);
        return { ...kitty, caught: true };
      }
      
      return { ...kitty, y: newY };
    }));
    
    // Remove caught kitties after a delay
    setKitties(prev => prev.filter(kitty => !kitty.caught || kitty.y < 100));
    
    // Check game over conditions
    if (lives <= 0 || score >= numberOfKitties) {
      setGameOver(true);
      return;
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, kitties, basket, lives, score, numberOfKitties, fallSpeed, spawnKitty]);

  // Start game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  // Handle game start
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setKitties([]);
    setLives(3);
    setMissedKitties(0);
    setGameTime(0);
  };

  // Handle game completion
  useEffect(() => {
    if (gameOver) {
      if (score >= numberOfKitties) {
        // All kitties caught - success!
        setTimeout(() => {
          onComplete(heartsReward);
        }, 1000);
      }
    }
  }, [gameOver, score, numberOfKitties, heartsReward, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!gameStarted) {
    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl mb-4">🐱</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{description}</p>
          
          <div className="bg-pink-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-pink-800 mb-2">🎯 How to Play</h3>
            <ul className="text-sm text-pink-700 text-left space-y-1">
              <li>• Move the basket left and right to catch falling kitties</li>
              <li>• Catch {numberOfKitties} kitties to win</li>
              <li>• You have 3 lives - don't let kitties fall!</li>
              <li>• Win {heartsReward} hearts when you complete the game!</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">⚙️ Game Settings</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Number of Kitties: <span className="font-semibold">{numberOfKitties}</span></div>
              <div>Fall Speed: <span className="font-semibold">{fallSpeed}x</span></div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              🎮 Start Game
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ❌ Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Game Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            ❌
          </button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4 text-center">
          <div className="bg-pink-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{score}</div>
            <div className="text-xs text-pink-600">Caught</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{lives}</div>
            <div className="text-xs text-red-600">Lives</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{missedKitties}</div>
            <div className="text-xs text-blue-600">Missed</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.floor(gameTime / 1000)}s</div>
            <div className="text-xs text-green-600">Time</div>
          </div>
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300 overflow-hidden"
          style={{ height: '400px' }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={(e) => e.preventDefault()}
        >
          {/* Falling Kitties */}
          {kitties.map(kitty => (
            <motion.div
              key={kitty.id}
              className={`absolute text-4xl transition-all duration-100 ${
                kitty.caught ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
              style={{
                left: `${kitty.x}%`,
                top: `${kitty.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: kitty.caught ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {kitty.image}
            </motion.div>
          ))}

          {/* Basket */}
          <motion.div
            className="absolute bottom-4 bg-orange-500 rounded-lg border-2 border-orange-600 shadow-lg"
            style={{
              left: `${basket.x}%`,
              width: `${basket.width}%`,
              height: '40px'
            }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🧺</span>
            </div>
          </motion.div>

          {/* Game Over Overlay */}
          {gameOver && (
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
                <div className="text-6xl mb-4">
                  {score >= numberOfKitties ? '🎉' : '😿'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {score >= numberOfKitties ? 'You Won!' : 'Game Over'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {score >= numberOfKitties 
                    ? `You caught all ${numberOfKitties} kitties!` 
                    : `You caught ${score} out of ${numberOfKitties} kitties.`
                  }
                </p>
                <div className="text-lg font-semibold text-pink-600 mb-4">
                  {score >= numberOfKitties ? `+${heartsReward} hearts earned!` : 'Better luck next time!'}
                </div>
                <button
                  onClick={onClose}
                  className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                >
                  {score >= numberOfKitties ? '🎉 Continue' : 'Try Again'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Game Instructions */}
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 Move your mouse or finger to control the basket and catch the falling kitties!
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CatchTheKitty;
