import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Expose full config to window for verification
(window as any)._firebaseConfig = firebaseConfig;

// Ensure single initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with Singapore (asia-southeast1) region for data residency
export const db = getFirestore(app);
// Note: Region configuration is set at the Firestore database level in Firebase Console
// This ensures all data resides in asia-southeast1 (Singapore) per data residency requirements

// Initialize Storage
export const storage = getStorage(app);

// Export app instance for additional Firebase services if needed
export default app;
