import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Customization Types
interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  emojis: string[];
  cursor: string;
  particles: string[];
  floatingHearts: {
    colors: string[];
    shapes: string[];
    speed: number;
    count: number;
  };
  backgroundImage?: string;
}

interface CustomizationSystemProps {
  isAdmin?: boolean;
  onThemeChange?: (theme: ThemeConfig) => void;
}

interface CustomThemeCreatorProps {
  onCreateTheme: (themeData: Omit<ThemeConfig, 'id'>) => ThemeConfig;
}

// Default Themes
const defaultThemes: Record<string, ThemeConfig> = {
  romantic: {
    id: 'romantic',
    name: 'Romantic Rose',
    description: 'Elegant and passionate love theme',
    colors: {
      primary: '#FF6B9D',
      secondary: '#C44569',
      accent: '#FFE0E9',
      background: '#FFF0F5',
      text: '#2C1810'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FF6B9D, #C44569)',
      secondary: 'linear-gradient(135deg, #FFE0E9, #FFB6C1)',
      accent: 'linear-gradient(135deg, #FF69B4, #FF1493)'
    },
    emojis: ['🌹', '💕', '💖', '💝', '💘', '💗', '💓', '💞'],
    cursor: '💖',
    particles: ['✨', '💫', '🌟', '💎', '🌸', '🌺'],
    floatingHearts: {
      colors: ['#FF6B9D', '#C44569', '#FF69B4', '#FF1493'],
      shapes: ['💖', '💕', '💗', '💓', '💞'],
      speed: 2,
      count: 15
    }
  },
  cute: {
    id: 'cute',
    name: 'Kawaii Dreams',
    description: 'Super cute and adorable theme',
    colors: {
      primary: '#FFB6C1',
      secondary: '#FFC0CB',
      accent: '#FFE4E1',
      background: '#FFF8DC',
      text: '#8B4513'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FFB6C1, #FFC0CB)',
      secondary: 'linear-gradient(135deg, #FFE4E1, #FFF8DC)',
      accent: 'linear-gradient(135deg, #FF69B4, #FFB6C1)'
    },
    emojis: ['🐱', '🐰', '🐻', '🐼', '🦄', '🌈', '🍭', '🎀'],
    cursor: '🐱',
    particles: ['✨', '💫', '🌟', '🎈', '🎀', '🍭'],
    floatingHearts: {
      colors: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FF1493'],
      shapes: ['🐱', '🐰', '🐻', '🐼', '🦄'],
      speed: 1.5,
      count: 20
    }
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant Love',
    description: 'Sophisticated and refined theme',
    colors: {
      primary: '#DDA0DD',
      secondary: '#9370DB',
      accent: '#E6E6FA',
      background: '#F8F8FF',
      text: '#2F2F2F'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #DDA0DD, #9370DB)',
      secondary: 'linear-gradient(135deg, #E6E6FA, #F8F8FF)',
      accent: 'linear-gradient(135deg, #9370DB, #8A2BE2)'
    },
    emojis: ['💎', '✨', '🌙', '⭐', '💫', '🌟', '🌺', '🌷'],
    cursor: '💎',
    particles: ['✨', '💫', '🌟', '💎', '🌙', '⭐'],
    floatingHearts: {
      colors: ['#DDA0DD', '#9370DB', '#8A2BE2', '#9932CC'],
      shapes: ['💎', '✨', '🌙', '⭐', '💫'],
      speed: 1,
      count: 12
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Romance',
    description: 'Warm and passionate sunset colors',
    colors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFD23F',
      background: '#FFF8E7',
      text: '#2C1810'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      secondary: 'linear-gradient(135deg, #FFD23F, #FFF8E7)',
      accent: 'linear-gradient(135deg, #FF6B35, #FFD23F)'
    },
    emojis: ['🌅', '🌇', '🔥', '💛', '🧡', '❤️', '🌞', '⭐'],
    cursor: '🌅',
    particles: ['✨', '💫', '🌟', '🌅', '🌇', '🔥'],
    floatingHearts: {
      colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF6B9D'],
      shapes: ['🌅', '🌇', '🔥', '💛', '🧡'],
      speed: 1.8,
      count: 18
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Love',
    description: 'Calm and deep ocean vibes',
    colors: {
      primary: '#4A90E2',
      secondary: '#357ABD',
      accent: '#7FB3D3',
      background: '#F0F8FF',
      text: '#1A1A2E'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4A90E2, #357ABD)',
      secondary: 'linear-gradient(135deg, #7FB3D3, #F0F8FF)',
      accent: 'linear-gradient(135deg, #4A90E2, #7FB3D3)'
    },
    emojis: ['🌊', '🐚', '🐬', '💙', '💎', '🌊', '🌊', '💙'],
    cursor: '🌊',
    particles: ['✨', '💫', '🌟', '🌊', '🐚', '💎'],
    floatingHearts: {
      colors: ['#4A90E2', '#357ABD', '#7FB3D3', '#1E90FF'],
      shapes: ['🌊', '🐚', '🐬', '💙', '💎'],
      speed: 1.2,
      count: 14
    }
  }
};

// Custom Theme Creator Component
const CustomThemeCreator: React.FC<CustomThemeCreatorProps> = ({ onCreateTheme }) => {
  const [showCreator, setShowCreator] = useState(false);
  const [themeData, setThemeData] = useState({
    name: '',
    description: '',
    colors: {
      primary: '#FF6B9D',
      secondary: '#C44569',
      accent: '#FFE0E9',
      background: '#FFF0F5',
      text: '#2C1810'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #FF6B9D, #C44569)',
      secondary: 'linear-gradient(135deg, #FFE0E9, #FFB6C1)',
      accent: 'linear-gradient(135deg, #FF69B4, #FF1493)'
    },
    emojis: ['💖', '💕', '💗', '💓'],
    cursor: '💖',
    particles: ['✨', '💫', '🌟', '💎'],
    floatingHearts: {
      colors: ['#FF6B9D', '#C44569', '#FF69B4'],
      shapes: ['💖', '💕', '💗', '💓'],
      speed: 2,
      count: 15
    }
  });

  const handleCreateTheme = () => {
    if (themeData.name.trim() && themeData.description.trim()) {
      onCreateTheme(themeData);
      setShowCreator(false);
      setThemeData({
        name: '',
        description: '',
        colors: {
          primary: '#FF6B9D',
          secondary: '#C44569',
          accent: '#FFE0E9',
          background: '#FFF0F5',
          text: '#2C1810'
        },
        gradients: {
          primary: 'linear-gradient(135deg, #FF6B9D, #C44569)',
          secondary: 'linear-gradient(135deg, #FFE0E9, #FFB6C1)',
          accent: 'linear-gradient(135deg, #FF69B4, #FF1493)'
        },
        emojis: ['💖', '💕', '💗', '💓'],
        cursor: '💖',
        particles: ['✨', '💫', '🌟', '💎'],
        floatingHearts: {
          colors: ['#FF6B9D', '#C44569', '#FF69B4'],
          shapes: ['💖', '💕', '💗', '💓'],
          speed: 2,
          count: 15
        }
      });
    }
  };

  if (!showCreator) {
    return (
      <button
        onClick={() => setShowCreator(true)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-bold"
      >
        ✨ Create New Theme
      </button>
    );
  }

  return (
    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-purple-800">New Theme Details</h4>
          <button
            onClick={() => setShowCreator(false)}
            className="text-purple-600 hover:text-purple-800"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Theme Name"
            value={themeData.name}
            onChange={(e) => setThemeData({ ...themeData, name: e.target.value })}
            className="p-2 border border-purple-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Theme Description"
            value={themeData.description}
            onChange={(e) => setThemeData({ ...themeData, description: e.target.value })}
            className="p-2 border border-purple-300 rounded-lg"
          />
        </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
           {Object.entries(themeData.colors).map(([key, color]) => (
             <div key={key} className="text-center">
               <label className="block text-xs font-medium text-purple-700 mb-1 capitalize">
                 {key}
               </label>
               <input
                 type="color"
                 value={color}
                 onChange={(e) => setThemeData({
                   ...themeData,
                   colors: { ...themeData.colors, [key]: e.target.value }
                 })}
                 className="w-full h-8 sm:h-10 border border-purple-300 rounded-lg cursor-pointer"
               />
             </div>
           ))}
         </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Cursor emoji (e.g., 💖)"
            value={themeData.cursor}
            onChange={(e) => setThemeData({ ...themeData, cursor: e.target.value })}
            className="flex-1 p-2 border border-purple-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Hearts speed"
            value={themeData.floatingHearts.speed}
            onChange={(e) => setThemeData({
              ...themeData,
              floatingHearts: { ...themeData.floatingHearts, speed: parseFloat(e.target.value) }
            })}
            className="w-20 p-2 border border-purple-300 rounded-lg"
            min="0.5"
            max="5"
            step="0.1"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateTheme}
            disabled={!themeData.name.trim() || !themeData.description.trim()}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Theme
          </button>
          <button
            onClick={() => setShowCreator(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomizationSystem: React.FC<CustomizationSystemProps> = ({
  isAdmin = false,
  onThemeChange
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultThemes.romantic);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customEmojis, setCustomEmojis] = useState<string[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<string[]>([]);
  const [customThemes, setCustomThemes] = useState<Record<string, ThemeConfig>>({});
  const [allThemes, setAllThemes] = useState<Record<string, ThemeConfig>>(defaultThemes);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const heartsContainerRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load saved data from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('currentTheme');
    const savedCustomThemes = localStorage.getItem('customThemes');
    const savedCustomEmojis = localStorage.getItem('customEmojis');
    const savedMessageTemplates = localStorage.getItem('messageTemplates');
    const savedBackgroundImage = localStorage.getItem('backgroundImage');

    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      setCurrentTheme(theme);
      applyTheme(theme);
    }

    if (savedCustomThemes) {
      const themes = JSON.parse(savedCustomThemes);
      setCustomThemes(themes);
      setAllThemes({ ...defaultThemes, ...themes });
    }

    if (savedCustomEmojis) {
      setCustomEmojis(JSON.parse(savedCustomEmojis));
    }

    if (savedMessageTemplates) {
      setMessageTemplates(JSON.parse(savedMessageTemplates));
    }

    if (savedBackgroundImage) {
      setBackgroundImage(savedBackgroundImage);
      applyBackgroundImage(savedBackgroundImage);
    }
  }, []);

  // Custom Cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Floating Hearts Animation
  useEffect(() => {
    if (!heartsContainerRef.current) return;

    const createHeart = () => {
      const heart = document.createElement('div');
      const theme = currentTheme.floatingHearts;
      const randomShape = theme.shapes[Math.floor(Math.random() * theme.shapes.length)];
      const randomColor = theme.colors[Math.floor(Math.random() * theme.colors.length)];
      
      heart.innerHTML = randomShape;
      heart.style.cssText = `
        position: absolute;
        font-size: ${20 + Math.random() * 20}px;
        color: ${randomColor};
        left: ${Math.random() * 100}vw;
        top: 100vh;
        pointer-events: none;
        z-index: 1;
        opacity: 0.7;
        animation: floatUp ${10 + Math.random() * 10}s linear infinite;
      `;

      heartsContainerRef.current?.appendChild(heart);

      // Remove heart after animation
      setTimeout(() => {
        heart.remove();
      }, 15000);
    };

    const interval = setInterval(createHeart, 2000);
    return () => clearInterval(interval);
  }, [currentTheme]);

  // Particle Effects on Click
  const createParticles = useCallback((x: number, y: number) => {
    if (!particlesContainerRef.current) return;

    const particleCount = 8;
    const theme = currentTheme;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const randomParticle = theme.particles[Math.floor(Math.random() * theme.particles.length)];
      
      particle.innerHTML = randomParticle;
      particle.style.cssText = `
        position: fixed;
        font-size: 16px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 1000;
        animation: particleFloat 1.5s ease-out forwards;
      `;

      particlesContainerRef.current.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1500);
    }
  }, [currentTheme]);

  // Global click handler for particles
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      createParticles(e.clientX, e.clientY);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [createParticles]);

  // Listen for quick theme change events
  useEffect(() => {
    const handleThemeChangeEvent = (e: CustomEvent) => {
      const themeId = e.detail?.themeId;
      if (themeId && allThemes[themeId]) {
        handleThemeChange(themeId);
      }
    };

    document.addEventListener('themeChange', handleThemeChangeEvent as EventListener);
    return () => document.removeEventListener('themeChange', handleThemeChangeEvent as EventListener);
  }, [allThemes]);

  // Apply theme to document
  const applyTheme = (theme: ThemeConfig) => {
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
    document.documentElement.style.setProperty('--background-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    
    // Apply theme to body for immediate visual feedback
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text;
    
    // Apply theme to main content areas
    const mainElements = document.querySelectorAll('main, .main-content, .content');
    mainElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = theme.colors.background;
        element.style.color = theme.colors.text;
      }
    });
    
    // Apply theme to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if (button instanceof HTMLElement) {
        if (button.classList.contains('btn-primary') || button.classList.contains('bg-pink-500')) {
          button.style.backgroundColor = theme.colors.primary;
        }
        if (button.classList.contains('btn-secondary') || button.classList.contains('bg-red-500')) {
          button.style.backgroundColor = theme.colors.secondary;
        }
      }
    });
    
    // Apply theme to cards and containers
    const cards = document.querySelectorAll('.card, .bg-white, .bg-gray-50');
    cards.forEach(card => {
      if (card instanceof HTMLElement) {
        card.style.backgroundColor = theme.colors.accent;
        card.style.borderColor = theme.colors.primary;
      }
    });
  };

  // Background Image Functions
  const applyBackgroundImage = (imageUrl: string) => {
    if (imageUrl) {
      // Create a global CSS rule for the background image
      let styleElement = document.getElementById('global-background-style');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'global-background-style';
        document.head.appendChild(styleElement);
      }
      
      // Apply comprehensive background styling
      styleElement.textContent = `
        body, html, #root, .min-h-screen {
          background-image: url(${imageUrl}) !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-attachment: fixed !important;
          min-height: 100vh !important;
        }
        
        /* Ensure all main containers inherit the background */
        .min-h-screen, main, .main-content, .content {
          background-image: url(${imageUrl}) !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-attachment: fixed !important;
        }
        
        /* Mobile optimization */
        @media (max-width: 768px) {
          body, html, #root, .min-h-screen, main, .main-content, .content {
            background-attachment: scroll !important;
          }
        }
      `;
      
      // Also apply directly to key elements
      document.body.style.backgroundImage = `url(${imageUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
      
      document.documentElement.style.backgroundImage = `url(${imageUrl})`;
      document.documentElement.style.backgroundSize = 'cover';
      document.documentElement.style.backgroundPosition = 'center';
      document.documentElement.style.backgroundRepeat = 'no-repeat';
      document.documentElement.style.backgroundAttachment = 'fixed';
      
      // Add CSS class for additional styling
      document.body.classList.add('has-background-image');
      document.documentElement.classList.add('has-background-image');
      
    } else {
      // Remove global CSS rule
      const styleElement = document.getElementById('global-background-style');
      if (styleElement) {
        styleElement.remove();
      }
      
      // Force remove from all elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.backgroundImage = '';
          element.style.backgroundSize = '';
          element.style.backgroundPosition = '';
          element.style.backgroundRepeat = '';
          element.style.backgroundAttachment = '';
          element.style.background = '';
        }
      });
      
      // Remove from body and html
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.background = '';
      
      document.documentElement.style.backgroundImage = '';
      document.documentElement.style.backgroundSize = '';
      document.documentElement.style.backgroundPosition = '';
      document.documentElement.style.backgroundRepeat = '';
      document.documentElement.style.backgroundAttachment = '';
      document.documentElement.style.background = '';
      
      // Remove CSS classes
      document.body.classList.remove('has-background-image');
      document.documentElement.classList.remove('has-background-image');
      
      // Re-apply current theme to restore default background
      if (currentTheme) {
        applyTheme(currentTheme);
      }
    }
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setBackgroundImage(imageUrl);
        applyBackgroundImage(imageUrl);
        localStorage.setItem('backgroundImage', imageUrl);
        showNotification('Background image applied successfully!');
        setShowBackgroundUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage('');
    applyBackgroundImage('');
    localStorage.removeItem('backgroundImage');
    
    // Force remove background from all possible elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element instanceof HTMLElement) {
        // Reset background properties
        element.style.backgroundImage = '';
        element.style.backgroundSize = '';
        element.style.backgroundPosition = '';
        element.style.backgroundRepeat = '';
        element.style.backgroundAttachment = '';
        element.style.background = '';
      }
    });
    
    // Reset body and html specifically
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundAttachment = '';
    document.body.style.background = '';
    
    document.documentElement.style.backgroundImage = '';
    document.documentElement.style.backgroundSize = '';
    document.documentElement.style.backgroundPosition = '';
    document.documentElement.style.backgroundRepeat = '';
    document.documentElement.style.backgroundAttachment = '';
    document.documentElement.style.background = '';
    
    // Remove any custom CSS classes
    document.body.classList.remove('has-background-image');
    document.documentElement.classList.remove('has-background-image');
    
    // Re-apply current theme to restore default background
    if (currentTheme) {
      applyTheme(currentTheme);
    }
    
    showNotification('Background image removed successfully!');
  };

  // Theme Change Handler
  const handleThemeChange = (themeId: string) => {
    const newTheme = allThemes[themeId];
    if (newTheme) {
      setCurrentTheme(newTheme);
      onThemeChange?.(newTheme);
      applyTheme(newTheme);
      
      // Save to localStorage
      localStorage.setItem('currentTheme', JSON.stringify(newTheme));
      showNotification(`Theme "${newTheme.name}" applied successfully!`);
    }
  };

  // Admin Functions
  const addCustomEmoji = (emoji: string) => {
    if (emoji && !customEmojis.includes(emoji)) {
      const newEmojis = [...customEmojis, emoji];
      setCustomEmojis(newEmojis);
      localStorage.setItem('customEmojis', JSON.stringify(newEmojis));
    }
  };

  const addMessageTemplate = (message: string) => {
    if (message && !messageTemplates.includes(message)) {
      const newTemplates = [...messageTemplates, message];
      setMessageTemplates(newTemplates);
      localStorage.setItem('messageTemplates', JSON.stringify(newTemplates));
    }
  };

  const createCustomTheme = (themeData: Omit<ThemeConfig, 'id'>) => {
    const newTheme: ThemeConfig = {
      ...themeData,
      id: `custom_${Date.now()}`
    };
    
    const updatedCustomThemes = { ...customThemes, [newTheme.id]: newTheme };
    const updatedAllThemes = { ...allThemes, [newTheme.id]: newTheme };
    
    setCustomThemes(updatedCustomThemes);
    setAllThemes(updatedAllThemes);
    localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes));
    
    showNotification(`Theme "${newTheme.name}" created successfully!`);
    return newTheme;
  };

  const deleteCustomTheme = (themeId: string) => {
    if (themeId.startsWith('custom_')) {
      const updatedCustomThemes = { ...customThemes };
      delete updatedCustomThemes[themeId];
      
      const updatedAllThemes = { ...allThemes };
      delete updatedAllThemes[themeId];
      
      setCustomThemes(updatedCustomThemes);
      setAllThemes(updatedAllThemes);
      localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      
      // If deleted theme was current, switch to default
      if (currentTheme.id === themeId) {
        const defaultTheme = defaultThemes.romantic;
        setCurrentTheme(defaultTheme);
        applyTheme(defaultTheme);
        localStorage.setItem('currentTheme', JSON.stringify(defaultTheme));
      }
    }
  };

  const exportTheme = (themeId: string) => {
    const theme = allThemes[themeId];
    if (theme) {
      const dataStr = JSON.stringify(theme, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${theme.name.replace(/\s+/g, '_')}_theme.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const shareTheme = async (themeId: string) => {
    const theme = allThemes[themeId];
    if (theme && navigator.share) {
      try {
        const themeData = JSON.stringify(theme, null, 2);
        await navigator.share({
          title: `${theme.name} Theme`,
          text: `Check out this amazing ${theme.name} theme!`,
          files: [new File([themeData], `${theme.name}_theme.json`, { type: 'application/json' })]
        });
      } catch (error) {
        // Fallback to export if sharing fails
        exportTheme(themeId);
      }
    } else {
      // Fallback to export if sharing is not supported
      exportTheme(themeId);
    }
  };

  const startThemePreview = (themeId: string) => {
    const theme = allThemes[themeId];
    if (theme) {
      setPreviewTheme(theme);
      applyTheme(theme);
    }
  };

  const cancelThemePreview = () => {
    if (previewTheme) {
      setPreviewTheme(null);
      applyTheme(currentTheme);
    }
  };

  const applyPreviewedTheme = () => {
    if (previewTheme) {
      setCurrentTheme(previewTheme);
      setPreviewTheme(null);
      onThemeChange?.(previewTheme);
      localStorage.setItem('currentTheme', JSON.stringify(previewTheme));
    }
  };

  const duplicateTheme = (themeId: string) => {
    const theme = allThemes[themeId];
    if (theme) {
      const duplicatedTheme: ThemeConfig = {
        ...theme,
        id: `custom_${Date.now()}`,
        name: `${theme.name} (Copy)`,
        description: `${theme.description} - Duplicated version`
      };
      
      const newTheme = createCustomTheme(duplicatedTheme);
      return newTheme;
    }
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);
          if (themeData.name && themeData.colors) {
            const newTheme = createCustomTheme(themeData);
            handleThemeChange(newTheme.id);
          }
        } catch (error) {
          alert('Invalid theme file!');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all custom themes? This will remove all custom themes and reset to default themes.')) {
      setCustomThemes({});
      setAllThemes(defaultThemes);
      localStorage.removeItem('customThemes');
      
      // Reset to default theme
      const defaultTheme = defaultThemes.romantic;
      setCurrentTheme(defaultTheme);
      applyTheme(defaultTheme);
      localStorage.setItem('currentTheme', JSON.stringify(defaultTheme));
    }
  };

  return (
    <>
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="text-2xl animate-pulse">
          {currentTheme.cursor}
        </div>
      </div>

      {/* Floating Hearts Background */}
      <div
        ref={heartsContainerRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Particles Container */}
      <div
        ref={particlesContainerRef}
        className="fixed inset-0 pointer-events-none z-[1000]"
      />

             {/* Current Theme Info */}
       <div className="fixed bottom-4 right-16 sm:right-20 z-50">
         <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-lg border border-gray-200">
           <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
             <span className="text-base sm:text-lg">{currentTheme.cursor}</span>
             <span className="font-medium text-gray-700 hidden sm:block">{currentTheme.name}</span>
           </div>
         </div>
       </div>

       {/* Customization Panel (Admin Only) */}
       {isAdmin && (
         <div className="fixed bottom-4 right-4 z-50">
           <button
             onClick={() => setShowCustomization(!showCustomization)}
             className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-lg sm:text-xl"
           >
             🎨
           </button>
         </div>
       )}

      {/* Customization Modal */}
      <AnimatePresence>
        {showCustomization && isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          >
                         <motion.div
               initial={{ y: 50 }}
               animate={{ y: 0 }}
               className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4"
             >
              {/* Notification */}
              {notification && (
                <div className={`p-4 rounded-lg mb-4 ${
                  notification.type === 'success' 
                    ? 'bg-green-100 border border-green-400 text-green-700' 
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>{notification.message}</span>
                    <button
                      onClick={() => setNotification(null)}
                      className="text-sm opacity-70 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">🎨 Customization Panel</h2>
                    <p className="text-sm opacity-90">Make everything cute and customizable!</p>
                  </div>
                  {previewTheme && (
                    <div className="flex items-center gap-3">
                      <div className="text-sm opacity-90">
                        👁️ Previewing: {previewTheme.name}
                      </div>
                      <button
                        onClick={applyPreviewedTheme}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        ✅ Apply Theme
                      </button>
                      <button
                        onClick={cancelThemePreview}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Cancel Preview
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                                 {/* Theme Switcher */}
                 <div>
                   <h3 className="text-xl font-bold mb-4">🎭 Theme Switcher</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {Object.values(allThemes).map((theme) => (
                      <div
                        key={theme.id}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          currentTheme.id === theme.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div 
                            className="text-2xl cursor-pointer"
                            onClick={() => handleThemeChange(theme.id)}
                          >
                            {theme.emojis[0]}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startThemePreview(theme.id);
                              }}
                              className="text-purple-500 hover:text-purple-700 text-sm"
                              title="Preview theme"
                            >
                              👁️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateTheme(theme.id);
                              }}
                              className="text-orange-500 hover:text-orange-700 text-sm"
                              title="Duplicate theme"
                            >
                              📋
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                shareTheme(theme.id);
                              }}
                              className="text-green-500 hover:text-green-700 text-sm"
                              title="Share theme"
                            >
                              📤
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportTheme(theme.id);
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                              title="Export theme"
                            >
                              💾
                            </button>
                            {theme.id.startsWith('custom_') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete "${theme.name}" theme?`)) {
                                    deleteCustomTheme(theme.id);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                                title="Delete custom theme"
                              >
                                🗑️
                                </button>
                            )}
                          </div>
                        </div>
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleThemeChange(theme.id)}
                        >
                          <h4 className="font-bold">{theme.name}</h4>
                          <p className="text-sm text-gray-600">{theme.description}</p>
                          
                          {/* Theme Color Preview */}
                          <div className="flex gap-1 mt-2">
                            {Object.values(theme.colors).slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          
                          {theme.id.startsWith('custom_') && (
                            <div className="text-xs text-pink-600 mt-1">Custom Theme</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Custom Theme */}
                <div>
                  <h3 className="text-xl font-bold mb-4">✨ Create Custom Theme</h3>
                  <CustomThemeCreator onCreateTheme={createCustomTheme} />
                </div>

                {/* Import Theme */}
                <div>
                  <h3 className="text-xl font-bold mb-4">📥 Import Theme</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-3">
                      Import a theme file (.json) to add it to your collection
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTheme}
                      className="block w-full text-sm text-blue-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Reset to Defaults */}
                <div>
                  <h3 className="text-xl font-bold mb-4">🔄 Reset to Defaults</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800 mb-3">
                      Remove all custom themes and reset to default themes
                    </p>
                    <button
                      onClick={resetToDefaults}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      🔄 Reset All Themes
                    </button>
                  </div>
                </div>

                {/* Custom Emojis */}
                <div>
                  <h3 className="text-xl font-bold mb-4">😊 Custom Emojis</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add emoji (e.g., 🦄)"
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          addCustomEmoji(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="emoji"]') as HTMLInputElement;
                        if (input?.value) {
                          addCustomEmoji(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customEmojis.map((emoji, index) => (
                      <span key={index} className="text-2xl">{emoji}</span>
                    ))}
                  </div>
                </div>

                {/* Message Templates */}
                <div>
                  <h3 className="text-xl font-bold mb-4">💌 Message Templates</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add love message template"
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          addMessageTemplate(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="message"]') as HTMLInputElement;
                        if (input?.value) {
                          addMessageTemplate(input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {messageTemplates.map((message, index) => (
                      <div key={index} className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                        {message}
                      </div>
                    ))}
                  </div>
                </div>

                                                  {/* Background Image */}
                 <div>
                   <h3 className="text-xl font-bold mb-4">🖼️ Background Image</h3>
                   <div className="space-y-4">
                     {backgroundImage ? (
                       <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                         <div className="flex items-center justify-between mb-3">
                           <h4 className="font-semibold text-green-800">Current Background</h4>
                           <button
                             onClick={removeBackgroundImage}
                             className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                           >
                             🗑️ Remove
                           </button>
                         </div>
                         <div className="relative">
                           <img
                             src={backgroundImage}
                             alt="Background preview"
                             className="w-full h-32 object-cover rounded-lg border border-green-300"
                           />
                           <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                             <span className="text-white text-sm font-medium">Background Applied</span>
                           </div>
                         </div>
                         <p className="text-xs text-green-600 mt-2">
                           Image is automatically optimized for mobile and desktop
                         </p>
                       </div>
                     ) : (
                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                         <div className="text-4xl mb-2">🖼️</div>
                         <p className="text-gray-600 mb-3">No background image set</p>
                         <button
                           onClick={() => setShowBackgroundUpload(true)}
                           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                         >
                           📁 Upload Image
                         </button>
                       </div>
                     )}

                     {!backgroundImage && (
                       <button
                         onClick={() => setShowBackgroundUpload(true)}
                         className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-bold"
                       >
                         🖼️ Set Background Image
                       </button>
                     )}
                   </div>

                   {/* Background Upload Modal */}
                   {showBackgroundUpload && (
                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
                       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                         <div className="text-center mb-6">
                           <h3 className="text-xl font-bold text-gray-800">🖼️ Upload Background Image</h3>
                           <p className="text-sm text-gray-600 mt-2">
                             Choose an image to set as website background
                           </p>
                         </div>
                         
                         <div className="space-y-4">
                           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                             <input
                               type="file"
                               accept="image/*"
                               onChange={handleBackgroundImageUpload}
                               className="hidden"
                               id="background-image-upload"
                             />
                             <label
                               htmlFor="background-image-upload"
                               className="cursor-pointer block"
                             >
                               <div className="text-4xl mb-2">📁</div>
                               <p className="text-gray-600 mb-2">Click to select image</p>
                               <p className="text-xs text-gray-500">
                                 Supports: JPG, PNG, GIF, WebP
                               </p>
                               <p className="text-xs text-gray-500 mt-1">
                                 Mobile responsive - auto-optimized
                               </p>
                             </label>
                           </div>
                           
                           <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                             <h4 className="font-semibold text-blue-800 text-sm mb-2">💡 Tips for Best Results:</h4>
                             <ul className="text-xs text-blue-700 space-y-1">
                               <li>• Use high-resolution images (1920x1080 or higher)</li>
                               <li>• Choose images with good contrast for readability</li>
                               <li>• Avoid busy patterns that might interfere with text</li>
                               <li>• Image will automatically scale for mobile devices</li>
                             </ul>
                           </div>
                         </div>
                         
                         <div className="flex gap-3 mt-6">
                           <button
                             onClick={() => setShowBackgroundUpload(false)}
                             className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                           >
                             Cancel
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Color Schemes */}
                 <div>
                   <h3 className="text-xl font-bold mb-4">🎨 Color Schemes</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {Object.entries(currentTheme.colors).map(([key, color]) => (
                      <div key={key} className="text-center">
                        <div
                          className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-sm font-medium capitalize">{key}</p>
                        <p className="text-xs text-gray-500">{color}</p>
                      </div>
                    ))}
                   </div>
                 </div>
              </div>

              {/* Close Button */}
              <div className="p-6 border-t">
                <button
                  onClick={() => setShowCustomization(false)}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close Customization Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      

               {/* CSS for animations and background image */}
        <style>{`
          @keyframes floatUp {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 0.7;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes particleFloat {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
              opacity: 0;
            }
          }

          /* Background Image Responsive Styles */
          body, html {
            transition: background-image 0.3s ease-in-out;
            min-height: 100vh;
          }

          /* Ensure background covers entire viewport */
          body.has-background-image,
          html.has-background-image {
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
          }

          /* Target the main container specifically */
          .min-h-screen {
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
          }

          /* Ensure content remains readable over background images */
          .main-content, .content, main {
            position: relative;
            z-index: 1;
          }

          /* Add subtle overlay to improve text readability */
          body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.1);
            pointer-events: none;
            z-index: 0;
          }

          /* Mobile-specific background adjustments */
          @media (max-width: 768px) {
            body, html, .min-h-screen {
              background-attachment: scroll !important;
            }
          }

          /* Force background to cover entire viewport */
          body, html, .min-h-screen {
            min-height: 100vh;
            width: 100%;
          }
        `}</style>
    </>
  );
};

export default CustomizationSystem;
