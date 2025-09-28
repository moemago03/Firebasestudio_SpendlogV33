import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const initializeApp = async () => {
  console.log('[AUTH_NATIVE] Initializing native auth listeners in main.tsx...');
  try {
    await FirebaseAuthentication.removeAllListeners();
    await FirebaseAuthentication.addAuthStateChangeListener(change => {
      console.log('[AUTH_NATIVE] Auth state changed, user:', change.user?.uid);
      // This event will now be caught by the new unified listener in App.tsx
    });
    await FirebaseAuthentication.addIdTokenChangeListener(token => {
      console.log('[AUTH_NATIVE] ID token changed.');
      // This event will also be caught by the App.tsx listener
    });
    console.log('[AUTH_NATIVE] Native listeners set up successfully.');
  } catch (error) {
    console.error('[AUTH_NATIVE] Error setting up listeners:', error);
  }
};

const startApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Initialize listeners first, then start the React application
initializeApp().then(startApp);