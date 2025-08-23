import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import HeartCatcherGame from './components/HeartCatcherGame';
import QuizGame from './components/QuizGame';
import ScrollReveal from './components/ScrollReveal';
import CustomizationPanel from './components/CustomizationPanel';
import LoginModal from './components/LoginModal';
import UserInfo from './components/UserInfo';
import { 
  WebsiteContent, 
  defaultContent, 
  saveContent, 
  getCustomImage, 
  getCustomMusic,
  syncContentFromFirebase,
  subscribeToFirebaseUpdates
} from './utils/contentManager';
import { isAuthenticated, isKaleshiAurat, getCurrentUser } from './utils/auth';

// Import images
import Img1 from './images/pic1.gif';
import Img2 from './images/pic2.gif';
import Img3 from './images/pic3.jpg';
import EnvelopeGif from './images/intro.gif';
import HelloKitty from './images/hellokitty.gif';

// Import music
import musicFile from './music.mp3';

// Types
interface StickyNoteProps {
  text: string;
  style: React.CSSProperties;
  delay?: number;
}

interface EnvelopeAnimationProps {
  onOpenComplete: () => void;
  envelopeLetterTitle?: string;
  envelopeLetterContent?: string;
  envelopeImage?: string;
}

interface Heart {
  id: number;
  x: number;
  y: number;
}

// StickyNote component for comic-style sticky notes with a wiggle effect
const StickyNote: React.FC<StickyNoteProps> = ({ text, style, delay = 0 }) => (
  <motion.div
    className="absolute bg-yellow-200 p-1.5 md:p-2 rounded shadow-lg font-comic text-xs md:text-sm border-2 border-dashed border-yellow-300"
    style={style}
    initial={{ opacity: 0, y: -20, rotate: -5 }}
    animate={{ opacity: 1, y: 0, rotate: [0, -3, 3, 0] }}
    transition={{ delay, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
  >
    {text || "Add your message here..."}
  </motion.div>
);

// EnvelopeAnimation component
const EnvelopeAnimation: React.FC<EnvelopeAnimationProps> = ({ 
  onOpenComplete, 
  envelopeLetterTitle, 
  envelopeLetterContent,
  envelopeImage 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showLetter, setShowLetter] = useState<boolean>(false);

  const handleEnvelopeClick = () => {
    console.log('🎯 Envelope clicked!');
    if (!isOpen) {
      console.log('🚀 Starting envelope animation...');
      setIsOpen(true);
      setTimeout(() => {
        console.log('📜 Showing letter...');
        setShowLetter(true);
      }, 800);
      // Give more time for the animation to complete before showing content
      setTimeout(() => {
        console.log('✅ Envelope animation complete, calling onOpenComplete...');
        onOpenComplete();
      }, 3000);
    } else {
      console.log('⚠️ Envelope already open');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100 relative overflow-hidden">
      <motion.div
        className="cursor-pointer relative z-20 p-4"
        onClick={handleEnvelopeClick}
        style={{ perspective: 1000 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Click indicator */}
        <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* GIF positioned above the envelope */}
        <motion.div
          className="absolute -top-24 md:-top-36 left-1/2 transform -translate-x-1/2 w-32 h-32 md:w-48 md:h-48 z-30"
          initial={{ y: -10 }}
          animate={{ y: [-10, 0, -10] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <img 
            src={envelopeImage || EnvelopeGif} 
            alt="Animated hearts" 
            className="w-full h-full object-contain filter drop-shadow-lg"
            style={{ pointerEvents: 'none' }}
          />
        </motion.div>

        {/* Envelope body */}
        <motion.div
          className="w-[280px] h-[180px] md:w-[360px] md:h-[240px] bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg shadow-2xl relative"
          animate={isOpen ? { scale: 0.95, opacity: 0.7 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Flap */}
          <motion.div
            className="absolute top-0 left-0 right-0 w-0 h-0 border-l-[140px] border-r-[140px] border-t-[90px] md:border-l-[180px] md:border-r-[180px] md:border-t-[120px] border-l-transparent border-r-transparent border-t-blue-200"
            initial={{ rotateX: 0 }}
            animate={isOpen ? { rotateX: -180 } : { rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
          />

          {/* Heart Seal */}
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 bg-pink-500 rounded-full p-2 md:p-3 shadow-lg">
            <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>

          {/* Inner letter sliding out */}
          {showLetter && (
            <motion.div
              className="absolute inset-x-3 md:inset-x-4 top-2 h-[150px] md:h-[200px] bg-white rounded-lg shadow-lg p-3 md:p-4 text-center"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: -20, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <div className="space-y-2">
                {envelopeLetterTitle && (
                  <h4 className="font-comic font-bold text-blue-600 text-base md:text-lg">
                    {envelopeLetterTitle}
                  </h4>
                )}
                <p className="text-gray-600 font-comic text-xs md:text-sm leading-relaxed">
                  {envelopeLetterContent || "💌 A letter for you..."}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Hint text */}
        {!isOpen && (
          <motion.div
            className="text-blue-600/80 text-base md:text-lg font-medium text-center mt-4"
            animate={{ opacity: [0, 1, 0], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Click to open
          </motion.div>
        )}
        
        {/* Backup button in case main click doesn't work */}
        {!isOpen && (
          <motion.button
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-comic"
            onClick={handleEnvelopeClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎯 Click Here to Open Envelope
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

function App() {
  // Music state and control
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showLetter, setShowLetter] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [initialLetterOpened, setInitialLetterOpened] = useState<boolean>(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [showGame, setShowGame] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [showQuizGame, setShowQuizGame] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizResetKey, setQuizResetKey] = useState<number>(0);
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(defaultContent);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const [isKaleshiAuratUser, setIsKaleshiAuratUser] = useState<boolean>(isKaleshiAurat());
  const [currentUser, setCurrentUser] = useState<any>(getCurrentUser());

  // Helper function to get custom images synchronously from local state
  const getCustomImageSync = (imageKey: string): string | null => {
    return websiteContent.customImages?.[imageKey as keyof typeof websiteContent.customImages] || null;
  };

  useEffect(() => {
    if (initialLetterOpened && !showContent) {
      // Wait a bit longer to ensure smooth transition
      const timer = setTimeout(() => setShowContent(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [initialLetterOpened, showContent]);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setIsKaleshiAuratUser(isKaleshiAurat());
    setCurrentUser(getCurrentUser());
  }, []);

  // Load content on mount
  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        console.log('🔄 Loading initial content...');
        
        // Try to sync from Firebase first
        const firebaseContent = await syncContentFromFirebase();
        if (firebaseContent) {
          console.log('✅ Content loaded from Firebase:', firebaseContent);
          // Ensure all required properties are present by merging with defaults
          const mergedContent = { ...defaultContent, ...firebaseContent };
          console.log('🔗 Merged Firebase content with defaults:', mergedContent);
          setWebsiteContent(mergedContent);
        } else {
          console.log('📱 Firebase not available, loading from localStorage...');
          // Fallback to localStorage
          const saved = localStorage.getItem('websiteContent');
          if (saved) {
            const parsed = JSON.parse(saved);
            console.log('📝 Content loaded from localStorage:', parsed);
            // Ensure all required fields are present by merging with defaults
            const mergedContent = { ...defaultContent, ...parsed };
            console.log('🔗 Merged content:', mergedContent);
            setWebsiteContent(mergedContent);
          } else {
            console.log('🆕 No saved content found, using defaults');
            setWebsiteContent(defaultContent);
          }
        }
      } catch (error) {
        console.error('❌ Error loading initial content:', error);
        setWebsiteContent(defaultContent);
      }
    };

    loadInitialContent();
  }, []);

  // Subscribe to Firebase updates
  useEffect(() => {
    if (isLoggedIn) {
      const unsubscribe = subscribeToFirebaseUpdates((newContent) => {
        if (newContent) {
          setWebsiteContent(newContent);
        }
      });

      return unsubscribe;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Ensure audio element exists
    let audioElement = document.getElementById('bgMusic') as HTMLAudioElement;
    
    if (!audioElement) {
      // Create audio element if it doesn't exist
      audioElement = document.createElement('audio');
      audioElement.id = 'bgMusic';
      audioElement.loop = true;
      document.body.appendChild(audioElement);
    }
    
    setAudio(audioElement);
    
    // Set initial audio source immediately
    if (websiteContent.customMusic) {
      audioElement.src = websiteContent.customMusic;
      audioElement.load();
    } else {
      audioElement.src = musicFile;
      audioElement.load();
    }
    
    return () => {
      // Cleanup
    };
  }, [websiteContent.customMusic]); // Re-run when custom music changes

  const toggleMusic = async () => {
    try {
      // Get the audio element directly
      const audioElement = document.getElementById('bgMusic') as HTMLAudioElement;
      
      if (!audioElement) {
        return;
      }

      // Always ensure audio source is set and loaded
      if (websiteContent.customMusic) {
        if (audioElement.src !== websiteContent.customMusic) {
          audioElement.src = websiteContent.customMusic;
        }
      } else {
        if (audioElement.src !== musicFile) {
          audioElement.src = musicFile;
        }
      }

      // Force audio to load and wait for it to be ready
      audioElement.load();
      
      // Wait for audio to be ready
      if (audioElement.readyState < 4) {
        await new Promise((resolve) => {
          audioElement.addEventListener('canplay', resolve, { once: true });
          // Timeout after 5 seconds
          setTimeout(resolve, 5000);
        });
      }

      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        // Try to play
        await audioElement.play();
        setIsPlaying(true);
      }
    } catch (error) {
      // Try alternative approach
      try {
        const audioElement = document.getElementById('bgMusic') as HTMLAudioElement;
        if (audioElement) {
          audioElement.load();
          await new Promise(resolve => setTimeout(resolve, 100));
          await audioElement.play();
          setIsPlaying(true);
        }
      } catch (altError) {
        // Final attempt - user interaction required
        const audioElement = document.getElementById('bgMusic') as HTMLAudioElement;
        if (audioElement) {
          audioElement.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Silent fail - user can try again
          });
        }
      }
    }
  };

  const addHeart = (e: React.MouseEvent) => {
    const newHeart: Heart = { id: Date.now(), x: e.clientX, y: e.clientY };
    setHearts([...hearts, newHeart]);
    setTimeout(() => setHearts((hs) => hs.filter((h) => h.id !== newHeart.id)), 1500);
  };

  const handleContentUpdate = async (newContent: WebsiteContent) => {
    // Update local state immediately
    setWebsiteContent(newContent);
    
    // Save to both localStorage and Firebase
    saveContent(newContent);
    
    // Force a re-render by updating the state again to ensure changes are reflected
    setTimeout(() => {
      setWebsiteContent(prev => ({ ...prev, ...newContent }));
    }, 100);
    
    // Refresh audio if custom music changed
    if (newContent.customMusic !== websiteContent.customMusic) {
      const audioElement = document.getElementById('bgMusic') as HTMLAudioElement;
      if (audioElement) {
        if (newContent.customMusic) {
          audioElement.src = newContent.customMusic;
        } else {
          audioElement.src = musicFile;
        }
        // Reset play state when music changes
        setIsPlaying(false);
      }
    }
  };

  // Show login screen first if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => {}} // Cannot close login modal - must login first
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setIsKaleshiAuratUser(isKaleshiAurat());
            setCurrentUser(getCurrentUser());
          }}
        />
      </div>
    );
  }

  // Ensure websiteContent has all required properties
  const safeWebsiteContent = {
    ...defaultContent,
    ...websiteContent,
    stickyNotes: websiteContent.stickyNotes || defaultContent.stickyNotes,
    quizQuestions: websiteContent.quizQuestions || defaultContent.quizQuestions,
    customImages: websiteContent.customImages || defaultContent.customImages,
    profilePictures: websiteContent.profilePictures || defaultContent.profilePictures
  };

  if (!initialLetterOpened) {
    return <EnvelopeAnimation 
      onOpenComplete={() => { 
        console.log('Envelope opened, setting initialLetterOpened to true');
        setInitialLetterOpened(true); 
        setShowLetter(true); 
      }}
      envelopeLetterTitle={safeWebsiteContent.envelopeLetterTitle}
      envelopeLetterContent={safeWebsiteContent.envelopeLetterContent}
      envelopeImage={getCustomImageSync('envelope') || EnvelopeGif}
    />;
  }

  // If envelope is opened but content is not showing yet, show a loading state
  if (initialLetterOpened && !showContent) {
    console.log('📊 Current state:', { initialLetterOpened, showContent, websiteContent });
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <Heart className="w-full h-full text-pink-500 animate-pulse" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-pink-600 font-comic mb-2">
            Loading Your Special Website...
          </h2>
          <p className="text-gray-600 font-comic">
            Just a moment while we prepare everything for you! 💕
          </p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-500">
            Debug: initialLetterOpened={initialLetterOpened.toString()}, showContent={showContent.toString()}
          </div>
        </motion.div>
      </div>
    );
  }

  const stickyNotes = (safeWebsiteContent.stickyNotes || []).map((note, index) => ({
    text: note,
    style: [
      { top: '8%', left: '4%' },
      { top: '20%', right: '6%' },
      { bottom: '18%', left: '5%' },
      { bottom: '12%', right: '8%' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    ][index],
    delay: index * 0.2
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 p-4 md:p-8 cursor-pointer relative overflow-hidden" onClick={addHeart}>
      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute pointer-events-none"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [1, 1.5], y: -80, opacity: 0 }}
          transition={{ duration: 1.5 }}
          style={{ left: heart.x - 10, top: heart.y - 10 }}
        >
          <Heart className="text-pink-500 w-5 h-5" fill="currentColor" />
        </motion.div>
      ))}

      {/* Sticky Notes */}
      {stickyNotes.map((note, index) => (
        <StickyNote key={index} text={note.text} style={note.style} delay={note.delay} />
      ))}

      {/* Music Player */}
      <audio id="bgMusic" loop>
        {/* Source will be set dynamically via JavaScript */}
      </audio>
      <div className="fixed top-2 md:top-4 left-2 md:left-4 flex flex-col items-start gap-2 z-40">
        <button
          onClick={toggleMusic}
          className="p-2 md:p-3 bg-white rounded-full shadow-md hover:scale-110 transition-transform border-2 border-blue-200 hover:border-blue-400 cursor-pointer"
          title="Click to Play/Pause Music"
        >
          {isPlaying ? <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-blue-600" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
        </button>
        <button
          onClick={toggleMusic}
          className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-md hover:scale-105 transition-transform border-2 border-blue-200 hover:border-blue-400 cursor-pointer"
          title="Click to Play/Pause Music"
        >
          <p className="text-xs md:text-sm font-comic text-blue-600 font-semibold">
            {isPlaying ? '⏸️ Pause' : '▶️ Play'} 🎵
          </p>
        </button>
        
        {/* Settings Button - Only visible to admin */}
        {isLoggedIn && isKaleshiAuratUser && (
          <button
            onClick={() => setShowCustomization(true)}
            className="p-2 md:p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-pink-200 hover:border-pink-400"
            title="Customize Website"
          >
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-600" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-16 px-4 md:px-8">
        <ScrollReveal animation="fade" duration={0.8}>
          <div className="text-center pt-4 md:pt-8">
            <h1 className="text-2xl md:text-4xl font-bold text-pink-600 mb-2 font-comic">
              {safeWebsiteContent.mainTitle || "Add your title here..."}
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-comic">
              {safeWebsiteContent.subtitle || "Add your subtitle here..."}
            </p>
          </div>
        </ScrollReveal>

        {/* Letter Card */}
        <ScrollReveal animation="zoom" duration={0.7} delay={0.1}>
          <motion.div
            className="comic-panel bg-white p-4 md:p-6 text-center rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer"
            whileHover={{ rotate: [-1, 1, -1, 0] }}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowLetter(true); }}
          >
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-pink-600 mx-auto mb-2" />
            <h2 className="text-lg md:text-xl font-bold text-pink-600 font-comic">
              {safeWebsiteContent.letterTitle || "Add your letter title here..."}
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-comic mt-2">
              {safeWebsiteContent.letterSubtitle || "Add your letter subtitle here..."}
            </p>
          </motion.div>
        </ScrollReveal>

        {/* Game Card */}
        <ScrollReveal animation="slide" duration={0.7} delay={0.3}>
          <motion.div
            className="comic-panel bg-white p-4 md:p-6 text-center rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer"
            whileHover={{ rotate: [-1, 1, -1, 0] }}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowGame(true); }}
          >
            <div className="bg-pink-100 w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-3">
              <Heart className="w-6 h-6 md:w-8 md:w-8 text-pink-600" fill="currentColor" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-pink-600 font-comic">Play a Game!</h2>
            <p className="text-sm md:text-base text-gray-600 font-comic mt-2">
              Catch some hearts to unlock a special message
            </p>
            {gameCompleted && (
              <div className="mt-3 bg-pink-50 p-2 rounded-lg border border-pink-200">
                <p className="text-pink-600 font-comic text-xs md:text-sm">
                  You've completed the game! ✨ But you can play again if you want!
                </p>
              </div>
            )}
          </motion.div>
        </ScrollReveal>

        {/* Quiz Game Card */}
        <ScrollReveal animation="slide" duration={0.7} delay={0.4}>
          <motion.div
            className="comic-panel bg-white p-4 md:p-6 text-center rounded-lg shadow-lg hover:scale-105 transition-transform cursor-pointer"
            whileHover={{ rotate: [-1, 1, -1, 0] }}
            onClick={(e: React.MouseEvent) => { 
              e.stopPropagation(); 
              setQuizCompleted(false); // Reset quiz state when opening
              setQuizResetKey(prev => prev + 1); // Force component reset
              setShowQuizGame(true); 
            }}
          >
            <div className="bg-purple-100 w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-3">
              <div className="w-6 h-6 md:w-8 md:h-8 text-purple-600 flex items-center justify-center">
                🧠
              </div>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-purple-600 font-comic">Quiz Game!</h2>
            <p className="text-sm md:text-base text-gray-600 font-comic mt-2">
              Test your knowledge and earn hearts for correct answers
            </p>
            {safeWebsiteContent.quizQuestions && safeWebsiteContent.quizQuestions.length > 0 && (
              <div className="mt-3 bg-purple-50 p-2 rounded-lg border border-purple-200">
                <p className="text-purple-600 font-comic text-xs md:text-sm">
                  {safeWebsiteContent.quizQuestions.length} questions available! 🎯
                </p>
              </div>
            )}
            {quizCompleted && safeWebsiteContent.quizQuestions && safeWebsiteContent.quizQuestions.length > 0 && (
              <div className="mt-3 bg-green-50 p-2 rounded-lg border border-green-200">
                <p className="text-green-600 font-comic text-xs md:text-sm">
                  Quiz completed! 🎉 Try again to improve your score!
                </p>
              </div>
            )}
          </motion.div>
        </ScrollReveal>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[{
            text: safeWebsiteContent.panel1Text || "Add your panel 1 text here...",
            img: Img1,
            caption: safeWebsiteContent.panel1Caption || "Add your panel 1 caption here..."
          }, {
            text: safeWebsiteContent.panel2Text || "Add your panel 2 text here...",
            img: Img2,
            caption: safeWebsiteContent.panel2Caption || "Add your panel 2 caption here..."
          }].map((p, i) => (
            <ScrollReveal key={i} animation="slide" delay={i * 0.2} duration={0.8}>
              <motion.div
                className="comic-panel bg-white p-4 md:p-6 rounded-lg shadow-lg hover:scale-105 transition-transform"
                whileHover={{ y: -5 }}
              >
                <div className="comic-speech-bubble mb-4">
                  <p className="font-comic text-base md:text-lg text-gray-800">{p.text}</p>
                </div>
                <img src={p.img} alt="panel" className="rounded-lg mb-4 w-full h-48 md:h-64 object-cover" />
                <p className="text-sm md:text-base text-gray-700 font-comic text-center">{p.caption}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Poem */}
        <ScrollReveal animation="flip" threshold={0.3} duration={1.2}>
          <div className="comic-panel bg-white p-4 md:p-8 rounded-lg shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300" />
            <h2 className="text-xl md:text-2xl font-bold text-pink-600 mb-4 font-comic text-center">
              {safeWebsiteContent.poemTitle || "Add your poem title here..."}
            </h2>
            <div className="bg-pink-50 p-4 md:p-6 rounded-lg border-2 border-dashed border-pink-300">
              <p 
                className="text-gray-700 italic leading-relaxed font-comic text-center text-base md:text-lg"
                dangerouslySetInnerHTML={{ 
                  __html: safeWebsiteContent.poemContent || "Add your poem content here... (use &lt;br /&gt; for line breaks)" 
                }}
              />
              <div className="mt-4 flex justify-center">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500" fill="currentColor" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Extra Panel */}
        <ScrollReveal animation="zoom" duration={0.9} threshold={0.4}>
          <motion.div
            className="comic-panel bg-white p-4 md:p-6 rounded-lg shadow-lg hover:scale-105 transition-transform"
            whileHover={{ rotate: 1 }}
          >
            <div className="comic-speech-bubble mb-4">
              <p className="font-comic text-base md:text-lg text-gray-800">
                {safeWebsiteContent.panel3Text || "Add your panel 3 text here..."}
              </p>
            </div>
            <img src={getCustomImageSync('panel3') || Img3} alt="Custom image" className="rounded-lg mb-4 w-full h-48 md:h-64 object-cover" />
            <p className="text-sm md:text-base text-gray-700 font-comic text-center">
              {safeWebsiteContent.panel3Caption || "Add your panel 3 caption here..."}
            </p>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* Letter Modal */}
      {showLetter && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center p-2 md:p-4 z-50" 
          onClick={() => setShowLetter(false)}
        >
          <motion.div
            className="bg-white bg-opacity-95 p-4 md:p-6 max-w-lg w-full relative rounded-lg shadow-xl overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button onClick={() => setShowLetter(false)} className="absolute top-2 md:top-4 right-2 md:right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1">
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="prose max-w-none">
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500 mr-2" fill="currentColor" />
                <h3 className="text-xl md:text-2xl font-bold text-pink-600 font-comic m-0">
                  {safeWebsiteContent.letterTitle || "Dear..."}
                </h3>
              </div>
              <div className="space-y-3 font-comic text-gray-700 leading-relaxed">
                <p className="text-sm md:text-base">{safeWebsiteContent.letterContent || "Add your letter content here..."}</p>
                <p className="text-right font-bold mt-4 text-sm md:text-base">
                  {safeWebsiteContent.letterSignature || "Your signature..."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Modal */}
      {showGame && (
        <HeartCatcherGame 
          onComplete={() => setGameCompleted(true)} 
          onClose={() => setShowGame(false)} 
          gameMessage={safeWebsiteContent.gameMessage}
        />
      )}

      {/* Quiz Game Modal */}
      {showQuizGame && (
        <QuizGame 
          key={`quiz-${quizResetKey}`} // Use resetKey to force complete remount
          resetKey={quizResetKey} // Pass resetKey to force state reset
          onComplete={(heartsEarned) => {
            setQuizCompleted(true);
            // Add floating hearts for each correct answer
            for (let i = 0; i < heartsEarned; i++) {
              setTimeout(() => {
                const randomX = Math.random() * window.innerWidth;
                const randomY = Math.random() * window.innerHeight;
                const newHeart: Heart = { 
                  id: Date.now() + i, 
                  x: randomX, 
                  y: randomY 
                };
                setHearts(prev => [...prev, newHeart]);
                setTimeout(() => setHearts((hs) => hs.filter((h) => h.id !== newHeart.id)), 2000);
              }, i * 200);
            }
          }} 
          onClose={() => {
            setShowQuizGame(false);
            setQuizCompleted(false); // Reset quiz completed state when closing
          }} 
          questions={safeWebsiteContent.quizQuestions || []}
        />
      )}

      {/* Customization Panel - Only visible to admin */}
      {isLoggedIn && isKaleshiAuratUser && showCustomization && (
        <CustomizationPanel
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          currentContent={safeWebsiteContent}
          onContentUpdate={handleContentUpdate}
        />
      )}

      {/* User Info */}
      <UserInfo
        isLoggedIn={isLoggedIn}
        isAdmin={isKaleshiAuratUser}
        user={currentUser}
        onLogout={() => {
          setIsLoggedIn(false);
          setIsKaleshiAuratUser(false);
          setCurrentUser(null);
        }}
      />
    </div>
  );
}

export default App;
