import { saveContentToFirebase, getContentFromFirebase, subscribeToContentUpdates, isFirebaseAvailable } from '../firebase/contentService';

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
};

// Enhanced saveContent function that saves to both localStorage and Firebase
export const saveContent = (content: WebsiteContent): void => {
  try {
    // Save to localStorage first
    localStorage.setItem('websiteContent', JSON.stringify(content));
    
    // Also save to Firebase if available
    if (isFirebaseAvailable()) {
      saveContentToFirebase(content).catch(error => {
        console.warn('⚠️ Firebase save failed, but localStorage save succeeded:', error);
      });
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
    
    // Save cleaned content
    saveContent(content);
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
};

export const compressImage = (imageData: string, maxSize: number = 500000): Promise<string> => {
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
        // Calculate new dimensions to reduce size
        let { width, height } = img;
        const ratio = Math.sqrt(maxSize / imageData.length);
        
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed format
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      };
      
      img.src = imageData;
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return Promise.resolve(imageData);
  }
};

// Enhanced saveContentWithCompression function
export const saveContentWithCompression = async (content: WebsiteContent): Promise<void> => {
  try {
    // Clean up old data first
    await cleanupOldData();
    
    // Check current storage size
    const currentSize = getStorageSizeMB();
    
    // If storage is getting full, compress large items
    if (currentSize > STORAGE_WARNING_THRESHOLD_MB) {
      // Compress large images and music
      if (content.customImages) {
        Object.entries(content.customImages).forEach(([key, dataUrl]) => {
          if (dataUrl && getDataUrlSize(dataUrl) > MAX_IMAGE_SIZE_MB) {
            content.customImages[key] = compressImage(dataUrl, MAX_IMAGE_SIZE_MB);
          }
        });
      }
      
      if (content.customMusic && getDataUrlSize(content.customMusic) > MAX_MUSIC_SIZE_MB) {
        content.customMusic = compressAudio(content.customMusic, MAX_MUSIC_SIZE_MB);
      }
      
      // Save compressed content
      localStorage.setItem('websiteContent', JSON.stringify(content));
    }
    
    // Save the content (both localStorage and Firebase)
    saveContent(content);
    
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

// Re-export isFirebaseAvailable from Firebase service
export { isFirebaseAvailable };
