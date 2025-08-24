import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

interface MemoryCardGameProps {
  onComplete: (hearts: number) => void;
  onClose: () => void;
  customImages?: string[]; // Optional custom images from admin
}

const MemoryCardGame: React.FC<MemoryCardGameProps> = ({ onComplete, onClose, customImages = [] }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Romantic emojis for the cards (fallback)
  const emojis = ['💕', '💖', '💝', '💗', '💓', '💞', '💟', '💘', '🌹', '🌸', '🌺', '🌷'];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Use custom images if available, otherwise fall back to emojis
    const hasCustomImages = customImages && customImages.length >= 6;
    const gameItems = hasCustomImages ? customImages.slice(0, 6) : emojis.slice(0, 6);
    const gameCards: MemoryCard[] = [];
    
    gameItems.forEach((item, index) => {
      // Add two cards for each item (pair)
      gameCards.push(
        { id: index * 2, emoji: item, isFlipped: false, isMatched: false, pairId: index },
        { id: index * 2 + 1, emoji: item, isFlipped: false, isMatched: false, pairId: index }
      );
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameCompleted(false);
    setShowCelebration(false);
  };

  const handleCardClick = useCallback((cardId: number) => {
    if (gameCompleted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped || flippedCards.length >= 2) return;

    const newCards = [...cards];
    const cardIndex = newCards.findIndex(c => c.id === cardId);
    newCards[cardIndex] = { ...newCards[cardIndex], isFlipped: true };
    
    setCards(newCards);
    setFlippedCards([...flippedCards, cardId]);

    // Check for match when two cards are flipped
    if (flippedCards.length === 1) {
      const firstCard = cards.find(c => c.id === flippedCards[0]);
      const secondCard = newCards[cardIndex];
      
      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found!
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards.forEach(c => {
            if (c.pairId === firstCard.pairId) {
              c.isMatched = true;
            }
          });
          setCards(updatedCards);
          setMatchedPairs(matchedPairs + 1);
          setFlippedCards([]);
          
          // Check if game is completed
          if (matchedPairs + 1 === 6) {
            setTimeout(() => {
              setGameCompleted(true);
              setShowCelebration(true);
              onComplete(10); // 10 hearts for completing memory game
            }, 500);
          }
        }, 1000);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards.forEach(c => {
            if (c.id === flippedCards[0] || c.id === cardId) {
              c.isFlipped = false;
            }
          });
          setCards(updatedCards);
          setFlippedCards([]);
        }, 1500);
      }
      
      setMoves(moves + 1);
    }
  }, [cards, flippedCards, matchedPairs, moves, gameCompleted, onComplete]);

  const resetGame = () => {
    initializeGame();
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
        className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-pink-600 mb-2">💕 Memory of Love 💕</h2>
          <p className="text-gray-600">Match the romantic pairs to earn hearts!</p>
          
          {/* Game Stats */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-pink-500 font-semibold">Pairs: {matchedPairs}/6</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-purple-500 font-semibold">Moves: {moves}</span>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
              className={`
                aspect-square rounded-xl cursor-pointer flex items-center justify-center text-3xl font-bold
                transition-all duration-300 transform
                ${card.isMatched 
                  ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg' 
                  : card.isFlipped 
                    ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-pink-200 to-purple-200 hover:from-pink-300 hover:to-purple-300 shadow-md'
                }
              `}
              onClick={() => handleCardClick(card.id)}
            >
              <AnimatePresence mode="wait">
                {card.isFlipped || card.isMatched ? (
                  <motion.div
                    key="emoji"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {customImages && customImages.length >= 6 && customImages[card.pairId] ? (
                      <img 
                        src={customImages[card.pairId]} 
                        alt={`Card ${card.pairId + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">{card.emoji}</span>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                    transition={{ duration: 0.3 }}
                    className="text-pink-400"
                  >
                    ❤️
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🔄 New Game
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ❌ Close Game
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
                className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 text-center max-w-md mx-4"
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
                  🎉
                </motion.div>
                
                <h3 className="text-2xl font-bold text-pink-600 mb-4">Congratulations!</h3>
                <p className="text-gray-700 mb-6">You've completed the Memory of Love game!</p>
                
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold mb-4">
                  💖 +10 Hearts Earned! 💖
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCelebration(false)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
                >
                  🎊 Celebrate!
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default MemoryCardGame;
