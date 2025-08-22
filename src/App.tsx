import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import HeartCatcherGame from './components/HeartCatcherGame';
import ScrollReveal from './components/ScrollReveal';
import CustomizationPanel from './components/CustomizationPanel';
import LoginModal from './components/LoginModal';
import UserInfo from './components/UserInfo';
import { WebsiteContent, loadContent, saveContent, getCustomImage, getCustomMusic } from './utils/contentManager';
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
const EnvelopeAnimation: React.FC<EnvelopeAnimationProps> = ({ onOpenComplete, envelopeLetterTitle, envelopeLetterContent }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showLetter, setShowLetter] = useState<boolean>(false);

  const handleEnvelopeClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => setShowLetter(true), 800);
      setTimeout(() => onOpenComplete(), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100 relative overflow-hidden">
      <motion.div
        className="cursor-pointer relative z-20"
        onClick={handleEnvelopeClick}
        style={{ perspective: 1000 }}
      >
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
            src={getCustomImage('envelope') || EnvelopeGif} 
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
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(loadContent());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const [isKaleshiAuratUser, setIsKaleshiAuratUser] = useState<boolean>(isKaleshiAurat());
  const [currentUser, setCurrentUser] = useState<any>(getCurrentUser());

  useEffect(() => {
    if (initialLetterOpened && !showContent) {
      const timer = setTimeout(() => setShowContent(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [initialLetterOpened, showContent]);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setIsKaleshiAuratUser(isKaleshiAurat());
    setCurrentUser(getCurrentUser());
  }, []);

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
    const customMusic = getCustomMusic();
    if (customMusic) {
      audioElement.src = customMusic;
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
      const customMusic = getCustomMusic();
      if (customMusic) {
        if (audioElement.src !== customMusic) {
          audioElement.src = customMusic;
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

  const handleContentUpdate = (newContent: WebsiteContent) => {
    setWebsiteContent(newContent);
    saveContent(newContent);
    
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

  if (!initialLetterOpened) {
    return <EnvelopeAnimation 
      onOpenComplete={() => { setInitialLetterOpened(true); setShowLetter(true); }}
      envelopeLetterTitle={websiteContent.envelopeLetterTitle}
      envelopeLetterContent={websiteContent.envelopeLetterContent}
    />;
  }

  const stickyNotes = websiteContent.stickyNotes.map((note, index) => ({
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
              {websiteContent.mainTitle || "Add your title here..."}
            </h1>
            <p className="text-sm md:text-base text-gray-600 font-comic">
              {websiteContent.subtitle || "Add your subtitle here..."}
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
              {websiteContent.letterTitle || "Add your letter title here..."}
            </h2>
            <p className="text-sm md:text-base text-gray-600 font-comic mt-2">
              {websiteContent.letterSubtitle || "Add your letter subtitle here..."}
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
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-600" fill="currentColor" />
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

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[{
            text: websiteContent.panel1Text || "Add your panel 1 text here...",
            img: Img1,
            caption: websiteContent.panel1Caption || "Add your panel 1 caption here..."
          }, {
            text: websiteContent.panel2Text || "Add your panel 2 text here...",
            img: Img2,
            caption: websiteContent.panel2Caption || "Add your panel 2 caption here..."
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
              {websiteContent.poemTitle || "Add your poem title here..."}
            </h2>
            <div className="bg-pink-50 p-4 md:p-6 rounded-lg border-2 border-dashed border-pink-300">
              <p 
                className="text-gray-700 italic leading-relaxed font-comic text-center text-base md:text-lg"
                dangerouslySetInnerHTML={{ 
                  __html: websiteContent.poemContent || "Add your poem content here... (use &lt;br /&gt; for line breaks)" 
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
                {websiteContent.panel3Text || "Add your panel 3 text here..."}
              </p>
            </div>
            <img src={getCustomImage('panel3') || Img3} alt="Custom image" className="rounded-lg mb-4 w-full h-48 md:h-64 object-cover" />
            <p className="text-sm md:text-base text-gray-700 font-comic text-center">
              {websiteContent.panel3Caption || "Add your panel 3 caption here..."}
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
                  {websiteContent.letterTitle || "Dear..."}
                </h3>
              </div>
              <div className="space-y-3 font-comic text-gray-700 leading-relaxed">
                <p className="text-sm md:text-base">{websiteContent.letterContent || "Add your letter content here..."}</p>
                <p className="text-right font-bold mt-4 text-sm md:text-base">
                  {websiteContent.letterSignature || "Your signature..."}
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
          gameMessage={websiteContent.gameMessage}
        />
      )}

      {/* Customization Panel - Only visible to admin */}
      {isLoggedIn && isKaleshiAuratUser && showCustomization && (
        <CustomizationPanel
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          currentContent={websiteContent}
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
