import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7k2z8ReEPjEa6pJtaga9NIWp8gqBDKAA",
  authDomain: "bharatprint-b388f.firebaseapp.com",
  projectId: "bharatprint-b388f",
  storageBucket: "bharatprint-b388f.firebasestorage.app",
  messagingSenderId: "790769955819",
  appId: "1:790769955819:web:517f597446d9cdbde45fae",
  measurementId: "G-V3LLXVGC2S"
};

// Initialize Firebase
let app = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.useDeviceLanguage();
  
  // Set persistence to LOCAL so auth state persists across browser sessions
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('⚠️ Failed to set persistence:', error.code);
  });
  
  // Enable debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Firebase initialized with project:', firebaseConfig.projectId);
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

/**
 * Create and manage reCAPTCHA verifier for phone authentication
 * Following Firebase Phone Auth documentation:
 * https://firebase.google.com/docs/auth/web/phone-auth
 */
const createRecaptchaVerifier = () => {
  // Verify container exists before creating verifier
  const container = document.getElementById('recaptcha-container');
  if (!container) {
    const error = new Error('reCAPTCHA container not found in HTML');
    console.error('❌', error.message);
    throw error;
  }
  
  try {
    console.log('📝 Creating reCAPTCHA verifier...');
    
    // Create reCAPTCHA verifier with proper configuration
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible', // Invisible reCAPTCHA - best for phone auth
      'callback': (token) => {
        console.log('✅ reCAPTCHA verification succeeded');
      },
      'expired-callback': () => {
        console.warn('⚠️ reCAPTCHA token expired - will need to verify again');
        // Clear stored verifier so it gets recreated on next attempt
        window.recaptchaVerifier = null;
      },
      'error-callback': (error) => {
        console.error('❌ reCAPTCHA error:', error);
        // Clear on error so verifier can be recreated
        window.recaptchaVerifier = null;
      }
    });
    
    console.log('✅ reCAPTCHA verifier created successfully');
    return verifier;
  } catch (error) {
    console.error('❌ Failed to create reCAPTCHA verifier:', error);
    window.recaptchaVerifier = null;
    throw error;
  }
};

/**
 * Reset reCAPTCHA verifier - call this when user cancels or encounters error
 */
const resetRecaptchaVerifier = () => {
  console.log('🔄 Resetting reCAPTCHA verifier...');
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }
};

export { auth, RecaptchaVerifier, signInWithPhoneNumber, createRecaptchaVerifier, resetRecaptchaVerifier };
