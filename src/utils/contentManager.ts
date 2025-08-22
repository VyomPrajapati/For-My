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
  
  // Custom music - empty by default
  customMusic: "",
  
  // Custom images - empty by default
  customImages: {},
  
  // Profile pictures - empty by default
  profilePictures: {},
};

export const loadContent = (): WebsiteContent => {
  try {
    const saved = localStorage.getItem('websiteContent');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default content to ensure all fields exist
      return { ...defaultContent, ...parsed };
    }
  } catch (error) {
    console.error('Error loading content from localStorage:', error);
  }
  return defaultContent;
};

export const saveContent = (content: WebsiteContent): void => {
  try {
    localStorage.setItem('websiteContent', JSON.stringify(content));
  } catch (error) {
    console.error('Error saving content to localStorage:', error);
  }
};

export const saveCustomImage = (imageKey: string, imageData: string): void => {
  try {
    const content = loadContent();
    content.customImages = content.customImages || {};
    content.customImages[imageKey as keyof typeof content.customImages] = imageData;
    saveContent(content);
  } catch (error) {
    console.error('Error saving custom image:', error);
  }
};

export const getCustomImage = (imageKey: string): string | null => {
  try {
    const content = loadContent();
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
export const saveProfilePicture = (userType: 'kaleshiAurat' | 'user', imageData: string): void => {
  try {
    const content = loadContent();
    content.profilePictures = content.profilePictures || {};
    content.profilePictures[userType] = imageData;
    saveContent(content);
  } catch (error) {
    console.error('Error saving profile picture:', error);
  }
};

// Get profile picture
export const getProfilePicture = (userType: 'kaleshiAurat' | 'user'): string | null => {
  try {
    const content = loadContent();
    return content.profilePictures?.[userType] || null;
  } catch (error) {
    console.error('Error loading profile picture:', error);
    return null;
  }
};

// Remove profile picture
export const removeProfilePicture = (userType: 'kaleshiAurat' | 'user'): void => {
  try {
    const content = loadContent();
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

export const cleanupOldData = (): void => {
  try {
    // Remove old profile pictures if they're too large
    const content = loadContent();
    if (content.profilePictures) {
      for (const [userType, picture] of Object.entries(content.profilePictures)) {
        if (picture && picture.length > 500000) { // 500KB limit
          console.log(`Removing large profile picture for ${userType}`);
          delete content.profilePictures[userType as keyof typeof content.profilePictures];
        }
      }
      saveContent(content);
    }
    
    // Remove old custom images if they're too large
    if (content.customImages) {
      for (const [imageKey, image] of Object.entries(content.customImages)) {
        if (image && image.length > 1000000) { // 1MB limit
          console.log(`Removing large custom image for ${imageKey}`);
          delete content.customImages[imageKey as keyof typeof content.customImages];
        }
      }
      saveContent(content);
    }
    
    // Remove old custom music if it's too large
    if (content.customMusic && content.customMusic.length > 2000000) { // 2MB limit
      console.log('Removing large custom music');
      content.customMusic = '';
      saveContent(content);
    }
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

export const saveContentWithCompression = async (content: WebsiteContent): Promise<void> => {
  try {
    // Clean up old data first
    cleanupOldData();
    
    // Check current storage size
    const currentSize = getStorageSizeMB();
    console.log(`Current storage size: ${currentSize.toFixed(2)} MB`);
    
    // If storage is getting full, compress large items
    if (currentSize > 4) { // 4MB threshold
      console.log('Storage getting full, compressing large items...');
      
      // Compress profile pictures
      if (content.profilePictures) {
        for (const [userType, picture] of Object.entries(content.profilePictures)) {
          if (picture && picture.length > 300000) {
            content.profilePictures[userType as keyof typeof content.profilePictures] = 
              await compressImage(picture, 300000);
          }
        }
      }
      
      // Compress custom images
      if (content.customImages) {
        for (const [imageKey, image] of Object.entries(content.customImages)) {
          if (image && image.length > 500000) {
            content.customImages[imageKey as keyof typeof content.customImages] = 
              await compressImage(image, 500000);
          }
        }
      }
    }
    
    // Save the content
    saveContent(content);
    
    console.log(`Final storage size: ${getStorageSizeMB().toFixed(2)} MB`);
  } catch (error) {
    console.error('Error saving content with compression:', error);
    // Fallback to regular save
    saveContent(content);
  }
};
