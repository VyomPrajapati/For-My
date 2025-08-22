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
