import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Song {
  id: number;
  title: string;
  artist: string;
  notes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LoveSongPuzzleProps {
  onComplete: (hearts: number) => void;
  onClose: () => void;
}

const LoveSongPuzzle: React.FC<LoveSongPuzzleProps> = ({ onComplete, onClose }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerNotes, setPlayerNotes] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);

  // Romantic love songs with their note sequences
  const songs: Song[] = [
    {
      id: 1,
      title: "Can't Help Falling in Love",
      artist: "Elvis Presley",
      notes: ["Do", "Mi", "Sol", "Do", "Mi", "Sol", "Do"],
      difficulty: "easy"
    },
    {
      id: 2,
      title: "Perfect",
      artist: "Ed Sheeran",
      notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do"],
      difficulty: "medium"
    },
    {
      id: 3,
      title: "All of Me",
      artist: "John Legend",
      notes: ["Do", "Mi", "Sol", "Ti", "Do", "Mi", "Sol", "Ti"],
      difficulty: "medium"
    },
    {
      id: 4,
      title: "Just the Way You Are",
      artist: "Bruno Mars",
      notes: ["Do", "Re", "Mi", "Fa", "Sol", "Fa", "Mi", "Re"],
      difficulty: "easy"
    },
    {
      id: 5,
      title: "A Thousand Years",
      artist: "Christina Perri",
      notes: ["Do", "Mi", "Sol", "Do", "Mi", "Sol", "La", "Sol"],
      difficulty: "hard"
    }
  ];

  const musicalNotes = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do"];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setCurrentSongIndex(0);
    setPlayerNotes([]);
    setSelectedNote(null);
    setGameCompleted(false);
    setShowCelebration(false);
    setScore(0);
    setAttempts(0);
  };

  const handleNoteSelect = (note: string) => {
    if (gameCompleted) return;
    
    const currentSong = songs[currentSongIndex];
    if (playerNotes.length >= currentSong.notes.length) return;

    setPlayerNotes([...playerNotes, note]);
  };

  const handleNoteRemove = (index: number) => {
    if (gameCompleted) return;
    
    const newNotes = playerNotes.filter((_, i) => i !== index);
    setPlayerNotes(newNotes);
  };

  const handleSubmit = () => {
    if (gameCompleted) return;
    
    const currentSong = songs[currentSongIndex];
    const isCorrect = playerNotes.every((note, index) => note === currentSong.notes[index]);
    
    setAttempts(attempts + 1);
    
    if (isCorrect) {
      // Calculate score based on difficulty and attempts
      let songScore = 0;
      switch (currentSong.difficulty) {
        case 'easy': songScore = 3; break;
        case 'medium': songScore = 5; break;
        case 'hard': songScore = 8; break;
      }
      
      // Bonus for first attempt
      if (attempts === 0) songScore += 2;
      
      setScore(score + songScore);
      
      // Move to next song or complete game
      if (currentSongIndex < songs.length - 1) {
        setTimeout(() => {
          setCurrentSongIndex(currentSongIndex + 1);
          setPlayerNotes([]);
          setSelectedNote(null);
        }, 1500);
      } else {
        // Game completed!
        setTimeout(() => {
          setGameCompleted(true);
          setShowCelebration(true);
          onComplete(score + songScore); // Total hearts earned
        }, 1500);
      }
    } else {
      // Wrong answer, clear notes
      setTimeout(() => {
        setPlayerNotes([]);
      }, 1000);
    }
  };

  const resetSong = () => {
    setPlayerNotes([]);
    setSelectedNote(null);
  };

  const getCurrentSong = () => songs[currentSongIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🌱';
      case 'medium': return '🌺';
      case 'hard': return '🌹';
      default: return '🎵';
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
        className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-pink-600 mb-2">🎵 Love Song Puzzle 🎵</h2>
          <p className="text-gray-600">Arrange the musical notes to complete romantic love songs!</p>
          
          {/* Game Stats */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-pink-500 font-semibold">Song: {currentSongIndex + 1}/{songs.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-purple-500 font-semibold">Score: {score}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-md">
              <span className="text-blue-500 font-semibold">Attempts: {attempts}</span>
            </div>
          </div>
        </div>

        {/* Current Song Info */}
        <div className="bg-white rounded-xl p-6 mb-6 text-center shadow-lg">
          <h3 className="text-2xl font-bold text-pink-600 mb-2">{getCurrentSong().title}</h3>
          <p className="text-gray-600 mb-3">by {getCurrentSong().artist}</p>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-lg font-semibold ${getDifficultyColor(getCurrentSong().difficulty)}`}>
              {getDifficultyEmoji(getCurrentSong().difficulty)} {getCurrentSong().difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Musical Staff */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h4 className="text-lg font-semibold text-center mb-4 text-gray-700">Your Melody</h4>
          <div className="flex justify-center gap-3 mb-4">
            {getCurrentSong().notes.map((_, index) => (
              <div
                key={index}
                className={`
                  w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-sm font-semibold
                  ${playerNotes[index] 
                    ? 'bg-gradient-to-br from-pink-400 to-purple-400 text-white border-solid' 
                    : 'bg-gray-100 text-gray-400 border-gray-300'
                  }
                `}
              >
                {playerNotes[index] || '?'}
              </div>
            ))}
          </div>
          
          {/* Target Notes */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Target: {getCurrentSong().notes.length} notes</p>
            <p className="text-xs text-gray-400">Arrange the notes in the correct order</p>
          </div>
        </div>

        {/* Note Selection */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h4 className="text-lg font-semibold text-center mb-4 text-gray-700">Select Notes</h4>
          <div className="grid grid-cols-4 gap-3">
            {musicalNotes.map((note, index) => (
              <motion.button
                key={`${note}-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNoteSelect(note)}
                disabled={playerNotes.length >= getCurrentSong().notes.length}
                className={`
                  p-4 rounded-xl font-bold text-lg transition-all duration-200
                  ${playerNotes.length >= getCurrentSong().notes.length
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {note}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetSong}
            disabled={playerNotes.length === 0}
            className={`
              px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200
              ${playerNotes.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-xl'
              }
            `}
          >
            🔄 Reset Song
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={playerNotes.length !== getCurrentSong().notes.length}
            className={`
              px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200
              ${playerNotes.length !== getCurrentSong().notes.length
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-xl'
              }
            `}
          >
            🎯 Submit Melody
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
                  🎵
                </motion.div>
                
                <h3 className="text-2xl font-bold text-pink-600 mb-4">Melody Master!</h3>
                <p className="text-gray-700 mb-6">You've completed all the love songs!</p>
                
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold mb-4">
                  💖 +{score} Hearts Earned! 💖
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

export default LoveSongPuzzle;
