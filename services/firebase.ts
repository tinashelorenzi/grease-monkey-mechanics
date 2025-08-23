import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCp8Q8r0hT3ZnJJ09KmQylj35heyfOVrxY",
  authDomain: "grease-monkey-50e2d.firebaseapp.com",
  projectId: "grease-monkey-50e2d",
  storageBucket: "grease-monkey-50e2d.firebasestorage.app",
  messagingSenderId: "799214937281",
  appId: "1:799214937281:android:70e176132fc2eebb612040"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, app };

// Helper function to get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Helper function to get user ID
export const getUserId = () => {
  return auth.currentUser?.uid;
};
