import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';
import { WebsiteContent } from '../utils/contentManager';

const WEBSITE_CONTENT_DOC = 'websiteContent';
const CONTENT_COLLECTION = 'websiteContent';

// Save content to Firebase
export const saveContentToFirebase = async (content: WebsiteContent): Promise<boolean> => {
  try {
    if (!isFirebaseAvailable()) {
      return false;
    }

    const docRef = doc(db, 'websiteContent', 'main');
    await setDoc(docRef, content);
    return true;
  } catch (error) {
    console.error('Error saving content to Firebase:', error);
    return false;
  }
};

// Get content from Firebase
export const getContentFromFirebase = async (): Promise<WebsiteContent | null> => {
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
    console.error('Error getting content from Firebase:', error);
    return null;
  }
};

// Listen for real-time content updates
export const subscribeToContentUpdates = (
  callback: (content: WebsiteContent | null) => void
): (() => void) => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, WEBSITE_CONTENT_DOC);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Remove Firebase-specific fields
        const { lastUpdated, updatedBy, ...content } = data;
        callback(content as WebsiteContent);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('❌ Error listening to content updates:', error);
      callback(null);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up content listener:', error);
    return () => {}; // Return empty function if setup fails
  }
};

// Check if Firebase is available
export const isFirebaseAvailable = (): boolean => {
  try {
    return db !== null && db !== undefined;
  } catch {
    return false;
  }
};

// Get last update timestamp
export const getLastUpdateTime = async (): Promise<string | null> => {
  try {
    const docRef = doc(db, CONTENT_COLLECTION, WEBSITE_CONTENT_DOC);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.lastUpdated || null;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting last update time:', error);
    return null;
  }
};
