import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, CheckCircle, XCircle, Trophy } from 'lucide-react';

interface QuizQuestion {
  question: string;
  option1: string;
  option2: string;
  correctAnswer: 1 | 2;
}

interface QuizGameProps {
  onComplete: (heartsEarned: number) => void;
  onClose: () => void;
  questions: QuizQuestion[];
  resetKey?: number; // Add this to force reset
}

const QuizGame: React.FC<QuizGameProps> = ({ onComplete, onClose, questions, resetKey }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [heartsEarned, setHeartsEarned] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Single useEffect to reset state when component remounts or resetKey changes
  useEffect(() => {
    console.log('🔄 QuizGame reset triggered - resetKey:', resetKey);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHeartsEarned(0);
    setShowResult(false);
    setIsCorrect(false);
    setGameCompleted(false);
  }, [resetKey]);

  // If no questions, just show the message - don't call onComplete
  useEffect(() => {
    // Don't call onComplete when there are no questions
    // This prevents the parent from thinking the quiz was completed
  }, [questions, onComplete]);

  const handleAnswerSelect = (answer: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return; // Safety check
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setHeartsEarned(prev => prev + 1);
    }
    
    setShowResult(true);
    
    // Show result for 2 seconds then move to next question
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Game completed - wait a bit longer before showing completion
        setGameCompleted(true);
        setTimeout(() => {
          onComplete(heartsEarned + (correct ? 1 : 0));
        }, 1000);
      }
    }, 2000);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const getCurrentQuestion = () => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return null;
    }
    return questions[currentQuestionIndex];
  };

  // Safety check - if no questions or invalid index, show no questions message
  if (questions.length === 0 || !getCurrentQuestion()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div 
          className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Close Quiz"
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" fill="currentColor" />
          <h2 className="text-2xl font-bold text-pink-600 mb-3 font-comic">
            No Love Quiz Questions Yet! 💕
          </h2>
          <p className="text-gray-600 font-comic">
            Your admin friend hasn't added any love quiz questions yet. 
            Check back later for some romantic brain teasers! 💖
          </p>
          
          {/* Close button at bottom too */}
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-comic"
          >
            Close Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div 
          className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Close Quiz"
          >
            <XCircle className="w-6 h-6" />
          </button>
          
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" fill="currentColor" />
          <h2 className="text-2xl font-bold text-pink-600 mb-3 font-comic">
            Love Quiz Complete! 💕🎉
          </h2>
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-pink-300 mb-4">
            <p className="text-lg font-comic text-pink-600 font-bold">
              You earned {heartsEarned} hearts! 💖
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {heartsEarned === questions.length ? 'Perfect score! You\'re a love expert! 🏆💕' : 'Great job! Keep spreading love! 💖'}
            </p>
          </div>
          <div className="flex justify-center space-x-4 mb-6">
            {Array.from({ length: heartsEarned }, (_, i) => (
              <Heart key={i} className="w-8 h-8 text-pink-500" fill="currentColor" />
            ))}
          </div>
          
          {/* Close button at bottom */}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-comic"
          >
            Close Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div 
        className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl shadow-2xl p-6 max-w-2xl w-full relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-8 h-8 text-pink-500" fill="currentColor" />
            <h2 className="text-2xl font-bold text-pink-600 font-comic">
              Love Quiz 💕
            </h2>
          </div>
          
          <p className="text-gray-600 font-comic mb-4">
            Test your knowledge about love and relationships! Answer correctly to earn hearts! 💖
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
              {heartsEarned} earned
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-comic text-gray-800 mb-6 leading-relaxed">
            {getCurrentQuestion()?.question}
          </h3>
          
          {/* Answer options */}
          <div className="space-y-3">
            {[
              { text: getCurrentQuestion()?.option1, value: 1 },
              { text: getCurrentQuestion()?.option2, value: 2 }
            ].map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleAnswerSelect(option.value)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-lg border-2 text-left font-comic transition-all duration-200 ${
                  selectedAnswer === null
                    ? 'border-pink-300 hover:border-pink-400 hover:bg-pink-50 cursor-pointer'
                    : selectedAnswer === option.value
                    ? option.value === getCurrentQuestion()?.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-500 bg-red-50 text-red-700'
                    : option.value === getCurrentQuestion()?.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-gray-50 text-gray-500'
                }`}
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{option.text}</span>
                  {selectedAnswer === option.value && (
                    option.value === getCurrentQuestion()?.correctAnswer ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg font-comic transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-pink-500 text-white hover:bg-pink-600'
            }`}
          >
            ← Previous
          </button>
          
          <button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`px-4 py-2 rounded-lg font-comic transition-colors ${
              currentQuestionIndex === questions.length - 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            Next →
          </button>
        </div>

        {/* Result feedback */}
        {showResult && (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isCorrect ? (
                <>
                  <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                  <span className="font-comic font-bold">Correct! +1 Heart 💖</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-comic font-bold">Wrong answer 💔</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default QuizGame;
