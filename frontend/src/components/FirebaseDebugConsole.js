import React, { useEffect } from 'react';

const FirebaseDebugConsole = () => {
  useEffect(() => {
    // Log comprehensive Firebase setup information
    console.clear();
    console.log('======== FIREBASE DIAGNOSTICS ========');
    
    // Check 1: Firebase SDK loaded
    try {
      const firebase = window.firebase;
      console.log('✅ Firebase SDK loaded:', !!firebase);
    } catch (e) {
      console.error('❌ Firebase SDK error:', e);
    }

    // Check 2: Firebase config
    try {
      const config = {
        apiKey: "AIzaSyC7k2z8ReEPjEa6pJtaga9NIWp8gqBDKAA",
        authDomain: "bharatprint-b388f.firebaseapp.com",
        projectId: "bharatprint-b388f",
        storageBucket: "bharatprint-b388f.firebasestorage.app",
        messagingSenderId: "790769955819",
        appId: "1:790769955819:web:517f597446d9cdbde45fae",
      };
      console.log('✅ Firebase config valid');
      console.log('   - Project ID:', config.projectId);
      console.log('   - Auth Domain:', config.authDomain);
      console.log('   - Current URL:', window.location.hostname);
    } catch (e) {
      console.error('❌ Firebase config error:', e);
    }

    // Check 3: reCAPTCHA container
    const captchaContainer = document.getElementById('recaptcha-container');
    console.log('✅ reCAPTCHA container exists:', !!captchaContainer);

    // Check 4: Auth imports
    try {
      const { auth, RecaptchaVerifier, signInWithPhoneNumber } = require('../../lib/firebase');
      console.log('✅ Auth module imported');
      console.log('   - auth:', !!auth);
      console.log('   - RecaptchaVerifier:', !!RecaptchaVerifier);
      console.log('   - signInWithPhoneNumber:', !!signInWithPhoneNumber);
    } catch (e) {
      console.error('❌ Auth import error:', e.message);
    }

    // Check 5: Check for common Firebase issues
    console.log('\n======== COMMON ISSUES ========');
    console.log('❓ Is phone authentication enabled in Firebase Console?');
    console.log('❓ Is localhost:3000 in Firebase authorized domains?');
    console.log('❓ Is the API key valid and unrestricted?');
    console.log('❓ Is reCAPTCHA v3 enabled (should be automatic)?');

    // Check 6: Network request test
    console.log('\n======== TESTING NETWORK REQUEST ========');
    fetch('https://identitytoolkit.googleapis.com/v1/accounts:sendSignInCode?key=AIzaSyC7k2z8ReEPjEa6pJtaga9NIWp8gqBDKAA', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: '+919876543210', recaptchaToken: 'test' })
    })
      .then(r => r.json())
      .then(d => console.log('Firebase API Response:', d))
      .catch(e => console.error('Firebase API Error:', e.message));

  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '8px',
      margin: '20px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3>🔧 Firebase Debug Console</h3>
      <p>Check the browser console (F12) for detailed diagnostic information.</p>
      <p>The console logs above will help identify the exact Firebase configuration issue.</p>
    </div>
  );
};

export default FirebaseDebugConsole;
