import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdHUpCwKaq472pweFEIlsBVwU5vUDJTiE",
  authDomain: "for-my-kuchupuchu.firebaseapp.com",
  projectId: "for-my-kuchupuchu",
  storageBucket: "for-my-kuchupuchu.firebasestorage.app",
  messagingSenderId: "114738449389",
  appId: "1:114738449389:web:506d56b4c4f49934d775e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulator in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below if you want to use Firebase emulator
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
