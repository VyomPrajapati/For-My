import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Award } from 'lucide-react';
import HelloKittyImg from '../images/hellokitty.gif'; // Add this import (adjust path if needed)

interface HeartCatcherGameProps {
  onComplete: () => void;
  onClose: () => void;
  gameMessage?: string;
}

const HeartCatcherGame: React.FC<HeartCatcherGameProps> = ({ onComplete, onClose, gameMessage }) => {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; speed: number }>>([]);
  const [kitties, setKitties] = useState<Array<{ id: number; x: number; y: number; speed: number }>>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [lastBonus, setLastBonus] = useState<string>('');
  const [showBonus, setShowBonus] = useState<boolean>(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const goalScore = 15;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const kittyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameCompleted(false);
    setHearts([]);
    setKitties([]);
    setLastBonus('');
    setShowBonus(false);
  };

  // Handle game timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  // Generate hearts
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    const generateHeart = () => {
      if (!gameAreaRef.current) return;
      
      const gameWidth = gameAreaRef.current.offsetWidth;
      
      const newHeart = {
        id: Date.now(),
        x: Math.random() * (gameWidth - 50),
        y: -50,
        speed: 1 + Math.random() * 1.5
      };
      
      setHearts(prev => [...prev, newHeart]);
    };
    
    intervalRef.current = setInterval(generateHeart, 1000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameStarted, gameCompleted]);

  // Generate Hello Kitty (less frequently)
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    const generateKitty = () => {
      if (!gameAreaRef.current) return;
      
      const gameWidth = gameAreaRef.current.offsetWidth;
      
      const newKitty = {
        id: Date.now(),
        x: Math.random() * (gameWidth - 60),
        y: -60,
        speed: 1.2 + Math.random()
      };
      
      setKitties(prev => [...prev, newKitty]);
    };
    
    // Generate Hello Kitty less frequently
    kittyIntervalRef.current = setInterval(generateKitty, 3500);
    
    return () => {
      if (kittyIntervalRef.current) clearInterval(kittyIntervalRef.current);
    };
  }, [gameStarted, gameCompleted]);

  // Move hearts and kitties
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;
    
    const moveItems = () => {
      if (!gameAreaRef.current) return;
      
      const gameHeight = gameAreaRef.current.offsetHeight;
      
      setHearts(prev => 
        prev
          .map(heart => ({
            ...heart,
            y: heart.y + heart.speed
          }))
          .filter(heart => heart.y < gameHeight + 50)
      );

      setKitties(prev => 
        prev
          .map(kitty => ({
            ...kitty,
            y: kitty.y + kitty.speed
          }))
          .filter(kitty => kitty.y < gameHeight + 60)
      );
    };
    
    const frameRate = 60;
    const moveInterval = setInterval(moveItems, 1000 / frameRate);
    
    return () => clearInterval(moveInterval);
  }, [gameStarted, gameCompleted]);

  // Check for win condition
  useEffect(() => {
    if (score >= goalScore && !gameCompleted) {
      setGameCompleted(true);
      onComplete();
    }
  }, [score, gameCompleted, onComplete]);

  // Display bonus message temporarily
  useEffect(() => {
    if (showBonus) {
      const timer = setTimeout(() => {
        setShowBonus(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showBonus]);

  const catchHeart = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const target = e.currentTarget;
    if (target) {
      target.classList.add('scale-150', 'opacity-0');
      setTimeout(() => {
        setHearts(prev => prev.filter(heart => heart.id !== id));
        setScore(prev => prev + 1);
      }, 150);
    } else {
      setHearts(prev => prev.filter(heart => heart.id !== id));
      setScore(prev => prev + 1);
    }
  };

  const catchKitty = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Choose a random bonus
    const bonuses = [
      { text: "Bonus +3 points!", action: () => setScore(prev => prev + 3) },
      { text: "Bonus +5 seconds!", action: () => setTimeLeft(prev => prev + 5) },
      { text: "Double points for next 3 hearts!", action: () => { /* Implement double points logic */ } }
    ];
    
    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
    setLastBonus(bonus.text);
    setShowBonus(true);
    bonus.action();
    
    const target = e.currentTarget;
    if (target) {
      target.classList.add('scale-150', 'opacity-0');
      setTimeout(() => {
        setKitties(prev => prev.filter(kitty => kitty.id !== id));
      }, 150);
    } else {
      setKitties(prev => prev.filter(kitty => kitty.id !== id));
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
    >
      <motion.div 
        className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl shadow-2xl p-6 max-w-md w-full relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button 
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-center text-pink-600 mb-3 font-comic">
          {gameCompleted ? "Game Complete!" : "Catch Hearts & Hello Kitty!"}
        </h2>
        
        {!gameStarted && !gameCompleted ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700 font-comic">
              Catch {goalScore} hearts before time runs out! Look out for Hello Kitty for special bonuses!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-full font-comic shadow-md"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                startGame();
              }}
            >
              Start Game
            </motion.button>
          </div>
        ) : gameCompleted ? (
          <div className="text-center space-y-4">
            {score >= goalScore ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Award className="w-16 h-16 text-yellow-500" />
                </div>
                <p className="text-lg font-comic text-pink-600 font-bold">
                  You did it! You caught {score} hearts!
                </p>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-pink-300">
                  <p className="font-comic text-gray-700">
                    {gameMessage || "Thank you for playing! I hope this little game brings you joy and happiness. My heart is yours to catch, always. I promise to make you smile every day."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-comic text-gray-700">
                  You caught {score} hearts! Try again to reach {goalScore} hearts!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-5 rounded-full font-comic shadow-md"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    startGame();
                  }}
                >
                  Try Again
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-white px-4 py-2 rounded-full shadow">
                <span className="font-comic font-bold text-pink-600">Score: {score}/{goalScore}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-full shadow">
                <span className="font-comic font-bold text-blue-600">Time: {timeLeft}s</span>
              </div>
            </div>
            
            <div 
              ref={gameAreaRef}
              className="bg-gradient-to-b from-blue-100/50 to-pink-100/50 rounded-lg h-[300px] relative overflow-hidden border-2 border-white"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {/* Bonus popup */}
              {showBonus && (
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-100 px-5 py-2 rounded-full shadow-lg z-20"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                >
                  <p className="text-pink-600 font-comic font-bold">{lastBonus}</p>
                </motion.div>
              )}
              
              {/* Hearts */}
              {hearts.map(heart => (
                <motion.div
                  key={heart.id}
                  className="absolute cursor-pointer transition-all duration-150"
                  style={{ 
                    left: heart.x, 
                    top: heart.y,
                    padding: "10px"
                  }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={(e: React.MouseEvent) => catchHeart(heart.id, e)}
                >
                  <Heart className="w-10 h-10 text-pink-500 filter drop-shadow-md" fill="currentColor" />
                </motion.div>
              ))}

              {/* Hello Kitty characters */}
              {kitties.map(kitty => (
                <motion.div
                  key={kitty.id}
                  className="absolute cursor-pointer transition-all duration-150"
                  style={{ 
                    left: kitty.x, 
                    top: kitty.y,
                    padding: "10px",
                    width: "100px",
                    height: "100px"
                  }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={(e: React.MouseEvent) => catchKitty(kitty.id, e)}
                >
                  <img src={HelloKittyImg} alt="Hello Kitty" className="w-full h-full object-contain" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HeartCatcherGame;