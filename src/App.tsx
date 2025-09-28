import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { Trip, Expense, AppView } from './types';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ItineraryProvider } from './context/ItineraryContext';
import { LocationProvider } from './context/LocationContext';
import { getContrastColor, hexToRgba } from './utils/colorUtils';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import MainLayout from './components/layout/MainLayout';

const AppContent: React.FC = () => {
  const { trips, expenses, addTrip, addExpense, deleteTrip, deleteExpense, updateTrip, updateExpense, reorderTrips } = useData();
  const [currentView, setCurrentView] = useState<AppView>({ type: 'dashboard' });
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);

  const selectedTrip = useMemo(() => {
    if (currentView.type === 'trip' && currentView.tripId) {
      return trips.find(t => t.id === currentView.tripId) || null;
    }
    return activeTrip;
  }, [currentView, trips, activeTrip]);

  const handleSelectTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId) || null;
    setActiveTrip(trip);
    setCurrentView({ type: 'trip', tripId });
  };

  const handleBackToDashboard = () => {
    setCurrentView({ type: 'dashboard' });
    setActiveTrip(null);
  };

  const Dashboard = lazy(() => import('./components/Dashboard'));
  const TripDetail = lazy(() => import('./components/TripDetail'));

  return (
    <MainLayout>
      <Suspense fallback={<LoadingScreen />}>
        {currentView.type === 'dashboard' ? (
          <Dashboard
            trips={trips}
            onSelectTrip={handleSelectTrip}
            onAddTrip={addTrip}
            onDeleteTrip={deleteTrip}
            onUpdateTrip={updateTrip}
            onReorderTrips={reorderTrips}
          />
        ) : (
          selectedTrip && (
            <TripDetail
              trip={selectedTrip}
              onBack={handleBackToDashboard}
              expenses={expenses.filter(e => e.tripId === selectedTrip.id)}
              onAddExpense={(expense: Omit<Expense, 'id'>) => addExpense({ ...expense, id: `exp-${Date.now()}` })}
              onDeleteExpense={deleteExpense}
              onUpdateExpense={updateExpense}
            />
          )
        )}
      </Suspense>
    </MainLayout>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authStateListener = useRef<PluginListenerHandle | null>(null);
  const idTokenListener = useRef<PluginListenerHandle | null>(null);

  useEffect(() => {
    console.log("[AUTH] useEffect init: Starting auth setup...");

    const setupAuthListeners = async () => {
      console.log('[AUTH] Setting up native auth listeners...');
      await authStateListener.current?.remove();
      await idTokenListener.current?.remove();
      
      authStateListener.current = await FirebaseAuthentication.addAuthStateChangeListener(change => {
        console.log('[AUTH] Auth state changed:', change.user?.uid);
        setUser(change.user);
      });
      
      idTokenListener.current = await FirebaseAuthentication.addIdTokenChangeListener(token => {
        console.log('[AUTH] ID token changed event received.');
        if (!token.token) {
          setUser(null);
        }
      });
      console.log('[AUTH] Native auth listeners have been set up.');
    };

    const checkCurrentUser = async () => {
      try {
        console.log('[AUTH] Checking for current user...');
        const result = await FirebaseAuthentication.getCurrentUser();
        if (result.user) {
          console.log('[AUTH] Found current user:', result.user.uid);
          setUser(result.user);
        } else {
          console.log('[AUTH] No user is currently signed in.');
          setUser(null);
        }
      } catch (error) {
        console.error('[AUTH] Error checking current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const initializeAuth = async () => {
        await setupAuthListeners();
        await checkCurrentUser();
    };

    initializeAuth();

    return () => {
      console.log('[AUTH] Cleanup: Removing auth listeners.');
      authStateListener.current?.remove();
      idTokenListener.current?.remove();
    };
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