import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { LocationProvider } from './context/LocationContext';

import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import AppContent from './AppContent'; // Assuming AppContent is extracted to its own file

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      console.log('[AUTH] App.tsx: Setting up unified auth state management.');

      // Universal listener for auth state changes
      const authStateHandle = await FirebaseAuthentication.addAuthStateChangeListener(change => {
        console.log(`[AUTH] App.tsx: Auth state change received. User: ${change.user?.uid}`);
        setUser(change.user || null);
        setLoading(false); // Stop loading once we have a definitive auth state
      });

      // Initial check for the current user
      try {
        console.log('[AUTH] App.tsx: Checking for initial current user...');
        const result = await FirebaseAuthentication.getCurrentUser();
        if (result.user) {
          console.log(`[AUTH] App.tsx: Found initial user: ${result.user.uid}`);
          setUser(result.user);
        } else {
          console.log('[AUTH] App.tsx: No initial user found.');
          setUser(null);
        }
      } catch (error) {
        console.error('[AUTH] App.tsx: Error getting current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }

      return () => {
        console.log('[AUTH] App.tsx: Cleaning up auth listener.');
        authStateHandle.remove();
      };
    };

    setupAuth();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <CurrencyProvider>
          <ItineraryProvider>
            <LocationProvider>
              {user ? (
                <DataProvider user={user}>
                  <AppContent />
                </DataProvider>
              ) : (
                <LoginScreen />
              )}
            </LocationProvider>
          </ItineraryProvider>
        </CurrencyProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
