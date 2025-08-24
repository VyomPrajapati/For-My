import { saveContentToFirebase, getContentFromFirebase, subscribeToContentUpdates, isFirebaseAvailable } from '../firebase/contentService';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// Constants for storage management
const MAX_IMAGE_SIZE_MB = 0.2; // 200KB - More reasonable size
const MAX_MUSIC_SIZE_MB = 2.0; // 2MB
const STORAGE_WARNING_THRESHOLD_MB = 4.0; // 4MB

// Helper function to get data URL size in MB
const getDataUrlSize = (dataUrl: string): number => {
  if (!dataUrl) return 0;
  // Remove data URL prefix to get base64 length
  const base64 = dataUrl.split(',')[1];
  if (!base64) return 0;
  // Calculate size: base64 length * 0.75 (base64 is ~75% of original size)
  return (base64.length * 0.75) / (1024 * 1024);
};

// Helper function to compress audio (placeholder)
const compressAudio = (audioData: string, maxSizeMB: number): string => {
  // For now, just return the original data
  // In a real implementation, you'd compress the audio
  return audioData;
};

export interface WebsiteContent {
  // Header
  mainTitle: string;
  subtitle: string;
  
  // Letter content
  letterTitle: string;
  letterSubtitle: string;
  letterContent: string;
  letterSignature: string;
  
  // Envelope letter content (the letter that slides out)
  envelopeLetterTitle: string;
  envelopeLetterContent: string;
  
  // Panel content
  panel1Text: string;
  panel1Caption: string;
  panel2Text: string;
  panel2Caption: string;
  panel3Text: string;
  panel3Caption: string;
  
  // Poem
  poemTitle: string;
  poemContent: string;
  
  // Sticky notes
  stickyNotes: string[];
  
  // Game completion message
  gameMessage: string;
  
  // Quiz questions
  quizQuestions: Array<{
    question: string;
    option1: string;
    option2: string;
    correctAnswer: 1 | 2;
  }>;
  
  // Custom music
  customMusic?: string;
  
  // Custom images
  customImages: {
    panel3?: string;
    envelope?: string;
  };
  
  // Profile pictures
  profilePictures: {
    kaleshiAurat?: string;
    user?: string;
  };
  
  // Game Stats (for tracking completion and achievements)
  gameStats?: {
    memoryCardCompleted: boolean;
    loveSongCompleted: boolean;
    flowerGardenCompleted: boolean;
    catchTheKittyCompleted: boolean;
    quizCompleted: boolean;
    gamesPlayed: number;
    daysActive: number;
    totalHearts: number;
  };
  
  // Game Customization
  gameCustomization: {
    // Memory Card Game
    memoryCardGame: {
      title: string;
      description: string;
      emojis: string[];
      heartsReward: number;
      celebrationMessage: string;
      customImages: string[]; // Array of 6 custom images for 6 pairs
    };
    
    // Love Song Puzzle Game
    loveSongPuzzleGame: {
      title: string;
      description: string;
      songs: Array<{
        title: string;
        artist: string;
        notes: string[];
        difficulty: 'easy' | 'medium' | 'hard';
        heartsReward: number;
      }>;
      celebrationMessage: string;
    };
    
    // Flower Garden Game
    flowerGardenGame: {
      title: string;
      description: string;
      flowerTypes: Array<{
        type: string;
        emoji: string;
        daysToGrow: number;
        heartsReward: number;
        rarity: 'common' | 'medium' | 'rare' | 'special';
      }>;
      waterLevel: number;
      gridSize: number;
      celebrationMessage: string;
    };
    
    // Catch the Kitty Game
    catchTheKittyGame: {
      title: string;
      description: string;
      heartsReward: number;
      celebrationMessage: string;
      numberOfKitties: number;
      fallSpeed: number;
      customImages: string[];
    };
    
    // Quiz Game
    quizGame: {
      celebrationMessage: string;
    };
    
    // Achievement System
    achievementSystem: {
      title: string;
      description: string;
      celebrationMessage: string;
      dailyTasks: Array<{
        title: string;
        description: string;
        heartsReward: number;
      }>;
      weeklyChallenges: Array<{
        title: string;
        description: string;
        heartsReward: number;
      }>;
      monthlyMilestones: Array<{
        title: string;
        description: string;
        heartsReward: number;
      }>;
    };
  };
}

export const defaultContent: WebsiteContent = {
  // Header - blank for customization
  mainTitle: "",
  subtitle: "",
  
  // Letter content - blank for customization
  letterTitle: "",
  letterSubtitle: "",
  letterContent: "",
  letterSignature: "",
  
  // Envelope letter content - blank for customization
  envelopeLetterTitle: "",
  envelopeLetterContent: "",
  
  // Panel content - blank for customization
  panel1Text: "",
  panel1Caption: "",
  panel2Text: "",
  panel2Caption: "",
  panel3Text: "",
  panel3Caption: "",
  
  // Poem - blank for customization
  poemTitle: "",
  poemContent: "",
  
  // Sticky notes - blank for customization
  stickyNotes: ["", "", "", "", ""],
  
  // Game completion message - blank for customization
  gameMessage: "",
  
  // Quiz questions - blank for customization
  quizQuestions: [],
  
  // Custom music - empty by default
  customMusic: "",
  
  // Custom images - empty by default
  customImages: {},
  
  // Profile pictures - empty by default
  profilePictures: {},
  
  // Game Stats - default values
  gameStats: {
    memoryCardCompleted: false,
    loveSongCompleted: false,
    flowerGardenCompleted: false,
    catchTheKittyCompleted: false,
    quizCompleted: false,
    gamesPlayed: 0,
    daysActive: 0,
    totalHearts: 0,
  },
  
  // Game Customization - default values
  gameCustomization: {
    // Memory Card Game
    memoryCardGame: {
      title: "Memory Card Game!",
      description: "Match romantic pairs to earn hearts",
      emojis: ['💕', '💖', '💝', '💗', '💓', '💞', '💟', '💘', '🌹', '🌸', '🌺', '🌷'],
      heartsReward: 10,
      celebrationMessage: "🎉 Amazing! You've completed the Memory Card Game! Your love memory is perfect! 💕",
      customImages: [], // Empty array for admin to add custom images
    },
    
    // Love Song Puzzle Game
    loveSongPuzzleGame: {
      title: "Love Song Puzzle!",
      description: "Arrange musical notes to complete love songs",
      songs: [
        {
          title: "Can't Help Falling in Love",
          artist: "Elvis Presley",
          notes: ["Do", "Mi", "Sol", "Do", "Mi", "Sol", "Do"],
          difficulty: "easy",
          heartsReward: 3,
        },
        {
          title: "Perfect",
          artist: "Ed Sheeran",
          notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do"],
          difficulty: "medium",
          heartsReward: 5,
        },
        {
          title: "All of Me",
          artist: "John Legend",
          notes: ["Do", "Mi", "Sol", "Ti", "Do", "Mi", "Sol", "Ti"],
          difficulty: "medium",
          heartsReward: 5,
        },
        {
          title: "Just the Way You Are",
          artist: "Bruno Mars",
          notes: ["Do", "Re", "Mi", "Fa", "Sol", "Fa", "Mi", "Re"],
          difficulty: "easy",
          heartsReward: 3,
        },
        {
          title: "A Thousand Years",
          artist: "Christina Perri",
          notes: ["Do", "Mi", "Sol", "Do", "Mi", "Sol", "La", "Sol"],
          difficulty: "hard",
          heartsReward: 8,
        }
      ],
      celebrationMessage: "🎵 Beautiful! You've completed the Love Song Puzzle! Your musical heart is in perfect harmony! 💖",
    },
    
    // Flower Garden Game
    flowerGardenGame: {
      title: "Flower Garden!",
      description: "Plant, water, and grow flowers for hearts",
      flowerTypes: [
        { type: 'rose', emoji: '🌹', daysToGrow: 6, heartsReward: 3, rarity: 'rare' },
        { type: 'daisy', emoji: '🌸', daysToGrow: 3, heartsReward: 1, rarity: 'common' },
        { type: 'tulip', emoji: '🌷', daysToGrow: 4, heartsReward: 2, rarity: 'medium' },
        { type: 'sunflower', emoji: '🌻', daysToGrow: 7, heartsReward: 4, rarity: 'special' },
        { type: 'carnation', emoji: '🌺', daysToGrow: 5, heartsReward: 2, rarity: 'medium' },
        { type: 'marigold', emoji: '🌼', daysToGrow: 4, heartsReward: 1, rarity: 'common' }
      ],
      waterLevel: 10,
      gridSize: 6,
      celebrationMessage: "🌺 Wonderful! You've completed the Flower Garden! Your love has bloomed beautifully! 🌸",
    },
    
    // Catch the Kitty Game
    catchTheKittyGame: {
      title: "Catch the Kitty!",
      description: "Catch falling kitties in your basket to earn hearts",
      heartsReward: 15,
      celebrationMessage: "🐱 Amazing! You've caught all the kitties! Your love reflexes are purr-fect! 💕",
      numberOfKitties: 10,
      fallSpeed: 2,
      customImages: [],
    },
    
    // Quiz Game
    quizGame: {
      celebrationMessage: "🧠 Brilliant! You've completed the Quiz! Your love knowledge is perfect! 💝",
    },
    
    // Achievement System
    achievementSystem: {
      title: "Achievements!",
      description: "Complete challenges and unlock rewards",
      celebrationMessage: "Congratulations! You've unlocked a new achievement! 🎉",
      dailyTasks: [
        { title: "Quiz Master", description: "Complete the daily quiz", heartsReward: 2 },
        { title: "Game Enthusiast", description: "Play at least 2 games today", heartsReward: 1 },
        { title: "Heart Collector", description: "Earn 5 hearts today", heartsReward: 3 }
      ],
      weeklyChallenges: [
        { title: "Perfect Week", description: "Complete all daily tasks for 7 days", heartsReward: 10 },
        { title: "Game Champion", description: "Win 10 games this week", heartsReward: 8 },
        { title: "Heart Millionaire", description: "Earn 50 hearts this week", heartsReward: 15 }
      ],
      monthlyMilestones: [
        { title: "Loyal Player", description: "Visit for 30 consecutive days", heartsReward: 25 },
        { title: "Game Master", description: "Complete all games at least once", heartsReward: 30 },
        { title: "Heart Legend", description: "Earn 200 hearts this month", heartsReward: 40 }
      ],
    },
  },
};

// Enhanced saveContent function that saves to both localStorage and Firebase
export const saveContent = (content: WebsiteContent): void => {
  try {
    // Clean the content first to remove any invalid values
    const cleanedContent = cleanContent(content);
    
    // Validate content before saving to prevent Firebase errors
    const validateContent = (obj: any): boolean => {
      if (obj === null || obj === undefined) return false;
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.every(validateContent);
        } else {
          return Object.values(obj).every(validateContent);
        }
      }
      return true;
    };
    
    // Check if cleaned content is valid for Firebase
    if (!validateContent(cleanedContent)) {
      console.warn('⚠️ Content contains invalid values after cleaning. Saving to localStorage only.');
      localStorage.setItem('websiteContent', JSON.stringify(cleanedContent));
      return;
    }
    
    // Check content size before saving
    const contentSize = JSON.stringify(cleanedContent).length;
    const maxFirebaseSize = 800000; // Leave buffer below 1MB limit
    
    // Save to localStorage first
    try {
      localStorage.setItem('websiteContent', JSON.stringify(cleanedContent));
    } catch (storageError) {
      console.warn('⚠️ localStorage save failed:', storageError);
      // If localStorage fails, try to save a compressed version
      if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded, attempting to save compressed version...');
        // This will be handled by saveContentWithCompression
        return;
      }
    }
    
    // Only save to Firebase if content is small enough and valid
    if (isFirebaseAvailable() && contentSize <= maxFirebaseSize) {
      saveContentToFirebase(cleanedContent).catch(error => {
        console.warn('⚠️ Firebase save failed, but localStorage save succeeded:', error);
      });
    } else if (contentSize > maxFirebaseSize) {
      console.warn('⚠️ Content too large for Firebase (', contentSize, 'bytes). Saving to localStorage only.');
    }
  } catch (error) {
    console.error('Error saving content:', error);
  }
};

// Enhanced loadContent function that tries Firebase first, then localStorage
export const loadContent = async (): Promise<WebsiteContent> => {
  try {
    // Try Firebase first if available
    if (isFirebaseAvailable()) {
      const firebaseContent = await getContentFromFirebase();
      if (firebaseContent) {
        // Save to localStorage for offline access
        localStorage.setItem('websiteContent', JSON.stringify(firebaseContent));
        return firebaseContent;
      }
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem('websiteContent');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultContent, ...parsed };
    }
  } catch (error) {
    console.error('Error loading content:', error);
  }
  
  return defaultContent;
};

// Save custom image
export const saveCustomImage = async (imageKey: string, imageData: string): Promise<void> => {
  try {
    const content = await loadContent();
    content.customImages = content.customImages || {};
    content.customImages[imageKey as keyof typeof content.customImages] = imageData;
    saveContent(content);
  } catch (error) {
    console.error('Error saving custom image:', error);
  }
};

// Get custom image
export const getCustomImage = async (imageKey: string): Promise<string | null> => {
  try {
    const content = await loadContent();
    return content.customImages?.[imageKey as keyof typeof content.customImages] || null;
  } catch (error) {
    console.error('Error loading custom image:', error);
    return null;
  }
};

// Get custom image synchronously (for use in components)
export const getCustomImageSync = (imageKey: string): string | null => {
  try {
    const saved = localStorage.getItem('websiteContent');
    if (saved) {
      const content = JSON.parse(saved) as WebsiteContent;
      return content.customImages?.[imageKey as keyof typeof content.customImages] || null;
    }
  } catch (error) {
    console.error('Error getting custom image synchronously:', error);
  }
  return null;
};

export const resetContent = (): WebsiteContent => {
  localStorage.removeItem('websiteContent');
  return defaultContent;
};

export const exportContent = (content: WebsiteContent): void => {
  try {
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'website-content.json';
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting content:', error);
  }
};

export const importContent = (file: File): Promise<WebsiteContent> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        resolve({ ...defaultContent, ...content });
      } catch (error) {
        reject(new Error('Invalid content file format'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

// Save custom music
export const saveCustomMusic = (musicData: string): void => {
  localStorage.setItem('customMusic', musicData);
};

// Get custom music
export const getCustomMusic = (): string | null => {
  return localStorage.getItem('customMusic');
};

// Remove custom music
export const removeCustomMusic = (): void => {
  localStorage.removeItem('customMusic');
};

// Save profile picture
export const saveProfilePicture = async (userType: 'kaleshiAurat' | 'user', imageData: string): Promise<void> => {
  try {
    const content = await loadContent();
    content.profilePictures = content.profilePictures || {};
    content.profilePictures[userType] = imageData;
    saveContent(content);
  } catch (error) {
    console.error('Error saving profile picture:', error);
  }
};

// Get profile picture
export const getProfilePicture = async (userType: 'kaleshiAurat' | 'user'): Promise<string | null> => {
  try {
    const content = await loadContent();
    return content.profilePictures?.[userType] || null;
  } catch (error) {
    console.error('Error loading profile picture:', error);
    return null;
  }
};

// Remove profile picture
export const removeProfilePicture = async (userType: 'kaleshiAurat' | 'user'): Promise<void> => {
  try {
    const content = await loadContent();
    if (content.profilePictures) {
      delete content.profilePictures[userType];
      saveContent(content);
    }
  } catch (error) {
    console.error('Error removing profile picture:', error);
  }
};

// Data management utilities
export const getStorageSize = (): number => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  } catch (error) {
    return 0;
  }
};

export const getStorageSizeMB = (): number => {
  return getStorageSize() / (1024 * 1024);
};

// Clean up old data to prevent storage quota issues
export const cleanupOldData = async (): Promise<void> => {
  try {
    const content = await loadContent();
    
    // Clean up oversized profile pictures
    if (content.profilePictures) {
      Object.entries(content.profilePictures).forEach(([userType, dataUrl]) => {
        if (dataUrl && getDataUrlSize(dataUrl) > MAX_IMAGE_SIZE_MB) {
          content.profilePictures[userType] = null;
        }
      });
    }

    // Clean up oversized custom images
    if (content.customImages) {
      Object.entries(content.customImages).forEach(([imageKey, dataUrl]) => {
        if (dataUrl && getDataUrlSize(dataUrl) > MAX_IMAGE_SIZE_MB) {
          content.customImages[imageKey] = null;
        }
      });
    }

    // Clean up oversized custom music
    if (content.customMusic && getDataUrlSize(content.customMusic) > MAX_MUSIC_SIZE_MB) {
      content.customMusic = null;
    }
    
    // Clean up oversized game customization images
    if (content.gameCustomization?.memoryCardGame?.customImages) {
      const cleanedImages = content.gameCustomization.memoryCardGame.customImages.filter(image => {
        if (image && getDataUrlSize(image) > MAX_IMAGE_SIZE_MB) {
          return false; // Remove oversized images
        }
        return true;
      });
      content.gameCustomization.memoryCardGame.customImages = cleanedImages;
    }
    
    // Save cleaned content
    saveContent(content);
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
};

export const compressImage = (imageData: string, maxSize: number = 200000): Promise<string> => {
  try {
    // If image is already small enough, return as is
    if (imageData.length <= maxSize) {
      return Promise.resolve(imageData);
    }
    
    // Create a canvas to resize the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        let { width, height } = img;
        let quality = 0.8; // Start with high quality
        
        // Calculate target size based on original image size
        const originalSize = imageData.length;
        const compressionRatio = maxSize / originalSize;
        
        // Determine target dimensions
        let targetWidth = width;
        let targetHeight = height;
        
        // If image is very large, be more aggressive with resizing
        if (originalSize > maxSize * 3) {
          // For very large images, reduce dimensions significantly
          const scaleFactor = Math.sqrt(compressionRatio) * 0.6;
          targetWidth = Math.floor(width * scaleFactor);
          targetHeight = Math.floor(height * scaleFactor);
          quality = 0.7;
        } else if (originalSize > maxSize * 2) {
          // For large images, moderate reduction
          const scaleFactor = Math.sqrt(compressionRatio) * 0.8;
          targetWidth = Math.floor(width * scaleFactor);
          targetHeight = Math.floor(height * scaleFactor);
          quality = 0.75;
        } else {
          // For moderately large images, slight reduction
          const scaleFactor = Math.sqrt(compressionRatio);
          targetWidth = Math.floor(width * scaleFactor);
          targetHeight = Math.floor(height * scaleFactor);
          quality = 0.8;
        }
        
        // Ensure minimum dimensions for usability
        targetWidth = Math.max(targetWidth, 150);
        targetHeight = Math.max(targetHeight, 150);
        
        // Ensure maximum dimensions don't exceed reasonable limits
        targetWidth = Math.min(targetWidth, 800);
        targetHeight = Math.min(targetHeight, 800);
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw resized image
        ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Try to compress with calculated quality
        let compressed = canvas.toDataURL('image/jpeg', quality);
        
        // If still too large, progressively reduce quality
        const qualityLevels = [0.7, 0.6, 0.5, 0.4, 0.3];
        for (const testQuality of qualityLevels) {
          if (compressed.length <= maxSize) break;
          
          compressed = canvas.toDataURL('image/jpeg', testQuality);
          
          // If we're getting close, try even lower quality
          if (compressed.length > maxSize * 1.2 && testQuality > 0.2) {
            compressed = canvas.toDataURL('image/jpeg', testQuality * 0.8);
          }
        }
        
        // If still too large, try WebP format (better compression)
        if (compressed.length > maxSize && canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                const webpData = reader.result as string;
                resolve(webpData.length <= maxSize ? webpData : compressed);
              };
              reader.readAsDataURL(blob);
            } else {
              resolve(compressed);
            }
          }, 'image/webp', 0.8);
        } else {
          resolve(compressed);
        }
      };
      
      img.src = imageData;
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return Promise.resolve(imageData);
  }
};

// Helper function to clean up undefined/null values that cause Firebase errors
const cleanContent = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      const cleanedArray = obj.map(cleanContent).filter(item => item !== null);
      return cleanedArray.length > 0 ? cleanedArray : [];
    } else {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = cleanContent(value);
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : {};
    }
  }
  return obj;
};

// Enhanced saveContentWithCompression function
export const saveContentWithCompression = async (content: WebsiteContent): Promise<void> => {
  try {
    // Clean up old data first
    await cleanupOldData();
    
    // Always compress images before saving to prevent size issues
    const compressedContent = { ...content };
    
    // Clean the content to remove invalid nested entities
    const cleanedContent = cleanContent(compressedContent);
    
    // Compress custom images in gameCustomization
    if (cleanedContent.gameCustomization?.memoryCardGame?.customImages) {
      const compressedImages = await Promise.all(
        cleanedContent.gameCustomization.memoryCardGame.customImages.map(async (image) => {
          if (image && getDataUrlSize(image) > MAX_IMAGE_SIZE_MB) {
            return await compressImage(image, MAX_IMAGE_SIZE_MB);
          }
          return image;
        })
      );
      cleanedContent.gameCustomization.memoryCardGame.customImages = compressedImages;
    }
    
    // Compress other custom images
    if (cleanedContent.customImages) {
      for (const [key, dataUrl] of Object.entries(cleanedContent.customImages)) {
        if (dataUrl && getDataUrlSize(dataUrl) > MAX_IMAGE_SIZE_MB) {
          cleanedContent.customImages[key] = await compressImage(dataUrl, MAX_IMAGE_SIZE_MB);
        }
      }
    }
    
    // Compress custom music
    if (cleanedContent.customMusic && getDataUrlSize(cleanedContent.customMusic) > MAX_MUSIC_SIZE_MB) {
      cleanedContent.customMusic = compressAudio(cleanedContent.customMusic, MAX_MUSIC_SIZE_MB);
    }
    
         // Check if content is still too large for Firebase (approximate check)
     const contentSize = JSON.stringify(cleanedContent).length;
     if (contentSize > 800000) { // Leave some buffer below 1MB limit
       console.warn('⚠️ Content still too large for Firebase after compression. Attempting aggressive size reduction...');
       
       // Try to reduce size by removing non-essential data
       const reducedContent = { ...cleanedContent };
       
       // Remove old profile pictures if they exist
       if (reducedContent.profilePictures) {
         Object.keys(reducedContent.profilePictures).forEach(key => {
           if (reducedContent.profilePictures[key] && 
               getDataUrlSize(reducedContent.profilePictures[key]) > 0.1) { // Remove if > 100KB
             reducedContent.profilePictures[key] = null;
           }
         });
       }
       
       // Remove old custom images if they exist
       if (reducedContent.customImages) {
         Object.keys(reducedContent.customImages).forEach(key => {
           if (reducedContent.customImages[key] && 
               getDataUrlSize(reducedContent.customImages[key]) > 0.1) { // Remove if > 100KB
             reducedContent.customImages[key] = null;
           }
         });
       }
       
       // Remove old custom music if it exists
       if (reducedContent.customMusic && getDataUrlSize(reducedContent.customMusic) > 1.0) {
         reducedContent.customMusic = null;
       }
       
       // Check if reduction helped
       const reducedSize = JSON.stringify(reducedContent).length;
       if (reducedSize <= 800000) {
         console.warn('✅ Content size reduced successfully. Saving to Firebase.');
         saveContent(reducedContent);
         return;
       } else {
         console.warn('⚠️ Content still too large after reduction. Saving to localStorage only.');
         // Save to localStorage only
         localStorage.setItem('websiteContent', JSON.stringify(reducedContent));
         return;
       }
     }
    
    // Save the cleaned and compressed content (both localStorage and Firebase)
    saveContent(cleanedContent);
    
  } catch (error) {
    console.error('Error saving content with compression:', error);
    // Fallback to regular save
    saveContent(content);
  }
};

// Function to sync content from Firebase
export const syncContentFromFirebase = async (): Promise<WebsiteContent | null> => {
  try {
    if (!isFirebaseAvailable()) {
      return null;
    }

    const docRef = doc(db, 'websiteContent', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as WebsiteContent;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error syncing content from Firebase:', error);
    return null;
  }
};

// Function to subscribe to Firebase updates
export const subscribeToFirebaseUpdates = (callback: (content: WebsiteContent | null) => void) => {
  if (!isFirebaseAvailable()) {
    return () => {};
  }

  const docRef = doc(db, 'websiteContent', 'main');
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const content = doc.data() as WebsiteContent;
      callback(content);
    } else {
      callback(null);
    }
  });
};

// Function to handle image uploads with automatic compression
export const handleImageUpload = async (file: File, maxSizeMB: number = 0.2): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Validate file
      if (!file || !(file instanceof File)) {
        reject(new Error('Invalid file provided'));
        return;
      }
      
      // Accept any file size - we'll compress it automatically
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!event.target || !event.target.result) {
            reject(new Error('Failed to read file'));
            return;
          }
          
          const result = event.target.result as string;
          
          // Always compress images to ensure they fit within Firebase limits
          // Target size is 200KB for optimal storage and performance
          const compressed = await compressImage(result, maxSizeMB * 1024 * 1024);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// Function to clean up and fix existing content issues
export const cleanupAndFixContent = async (): Promise<WebsiteContent> => {
  try {
    // Load current content
    const currentContent = await loadContent();
    
    // Clean the content structure
    const cleanedContent = cleanContent(currentContent);
    
    // Ensure all required properties exist
    const fixedContent: WebsiteContent = {
      ...defaultContent,
      ...cleanedContent,
      // Ensure gameCustomization exists and is properly structured
      gameCustomization: {
        ...defaultContent.gameCustomization,
        ...cleanedContent.gameCustomization,
        // Ensure memoryCardGame exists
        memoryCardGame: {
          ...defaultContent.gameCustomization.memoryCardGame,
          ...cleanedContent.gameCustomization?.memoryCardGame,
          customImages: cleanedContent.gameCustomization?.memoryCardGame?.customImages || []
        }
      },
      // Ensure gameStats exists
      gameStats: {
        ...defaultContent.gameStats,
        ...cleanedContent.gameStats
      }
    };
    
    // Save the fixed content
    saveContent(fixedContent);
    
    return fixedContent;
  } catch (error) {
    console.error('Error cleaning up content:', error);
    return defaultContent;
  }
};

// Re-export isFirebaseAvailable from Firebase service
export { isFirebaseAvailable };
