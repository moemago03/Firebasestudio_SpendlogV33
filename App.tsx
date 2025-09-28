import React, { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
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
import NotificationContainer from './components/NotificationContainer';
import FloatingActionButtons from './components/layout/FloatingActionButtons';
import DebugMenu from './components/DebugMenu';
import PrivacyPolicy from './PrivacyPolicy';

// Eagerly load main components
import Dashboard from './components/Dashboard';
import ProfileScreen from './components/ProfileScreen';
import ItineraryView from './components/itinerary/ItineraryView';

// Lazy load other components
const ExpenseForm = lazy(() => import('./components/ExpenseForm'));
const AIPanel = lazy(() => import('./components/AIPanel'));
const ReceiptScanner = lazy(() => import('./components/ReceiptScanner'));
const PlanView = lazy(() => import('./components/plan/PlanView'));
const Statistics = lazy(() => import('./components/Statistics'));
const GroupView = lazy(() => import('./components/GroupBalances'));

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [showingPrivacy, setShowingPrivacy] = useState(false);

    useEffect(() => {
        console.log("[AUTH] App.tsx useEffect triggered");

        if (Capacitor.isNativePlatform()) {
            // Mobile (Capacitor) Auth Logic
            let authStateListener: PluginListenerHandle | undefined;
            let idTokenListener: PluginListenerHandle | undefined;

            const setupNativeAuth = async () => {
                console.log("[AUTH] Setting up native auth listeners...");
                
                // 1. Register listeners FIRST to ensure no events are missed during startup.
                authStateListener = await FirebaseAuthentication.addAuthStateChangeListener((change) => {
                    console.log("[AUTH] Native authStateChange event received:", change.user);
                    setUser(change.user as unknown as User | null);
                });

                idTokenListener = await FirebaseAuthentication.addIdTokenChangeListener((result) => {
                    console.log("[AUTH] Native idTokenChange event received.", result.user ? 'Got user.' : 'No user.');
                    // This is mainly for token refreshes. If the user object changes, we update the state.
                    if (result.user && (!user || user.uid !== result.user.uid)) {
                         setUser(result.user as unknown as User | null);
                    }
                });

                // 2. THEN, get the current user state to handle the initial load.
                try {
                    console.log("[AUTH] Checking for current user...");
                    const result = await FirebaseAuthentication.getCurrentUser();
                    if (result.user) {
                        console.log("[AUTH] getCurrentUser successful:", result.user);
                        setUser(result.user as unknown as User | null);
                    } else {
                        console.log("[AUTH] getCurrentUser returned no user.");
                        setUser(null);
                    }
                } catch (err) {
                    console.error("[AUTH] getCurrentUser error:", err);
                    setUser(null);
                } finally {
                    // 3. Auth initialization is complete. We can hide the loading screen.
                    console.log("[AUTH] Auth loading finished.");
                    setLoadingAuth(false);
                }
            };

            setupNativeAuth();

            // 4. Cleanup function to remove listeners when the component unmounts.
            return () => {
                console.log("[AUTH] Cleaning up native auth listeners.");
                authStateListener?.remove();
                idTokenListener?.remove();
            };

        } else {
            // Web Auth Logic (already correct)
            console.log("[AUTH] Setting up web auth listener...");
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                console.log("[AUTH] Web onAuthStateChanged event received:", user);
                setUser(user);
                setLoadingAuth(false);
            });

            return () => {
                console.log("[AUTH] Cleaning up web auth listener.");
                unsubscribe();
            };
        }
    }, []); // Empty dependency array ensures this runs only once on mount.

    const handleLogout = useCallback(async () => {
        console.log("[AUTH] handleLogout called");
        setUser(null); // Explicitly set user to null for immediate UI feedback
        if (Capacitor.isNativePlatform()) {
            await FirebaseAuthentication.signOut();
        } else {
            await getAuth().signOut();
        }
    }, []);

    if (loadingAuth) {
        console.log("[AUTH] Render: loadingAuth is true");
        return <LoadingScreen />;
    }

    if (showingPrivacy) {
        console.log("[AUTH] Render: showing privacy policy");
        return <PrivacyPolicy onBack={() => setShowingPrivacy(false)} />;
    }
    
    console.log(`[AUTH] Render: user is ${user ? 'logged in' : 'logged out'}`);

    return (
        <ThemeProvider>
            <NotificationProvider>
                <CurrencyProvider>
                    <LocationProvider>
                        {user ? (
                            <DataProvider user={user.uid}>
                                <ItineraryProvider>
                                    <AuthenticatedApp user={user} onLogout={handleLogout} />
                                </ItineraryProvider>
                            </DataProvider>
                        ) : (
                            <LoginScreen onShowPrivacy={() => setShowingPrivacy(true)} />
                        )}
                        <NotificationContainer />
                    </LocationProvider>
                </CurrencyProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
};

// This new component is wrapped by DataProvider, so it can use the useData hook.
const AuthenticatedApp: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const { data, loading, firebaseStatus, setDefaultTrip } = useData();
    const [currentView, setCurrentView] = useState<AppView>('summary');
    
    const [editingExpense, setEditingExpense] = useState<Partial<Expense> | null>(null);
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const activeTripId = useMemo(() => {
        if (!data) return null;
        if (data.defaultTripId && data.trips.some(t => t.id === data.defaultTripId)) {
            return data.defaultTripId;
        }
        return data.trips[0]?.id || null;
    }, [data]);

    const activeTrip = useMemo(() => {
        return data?.trips.find(t => t.id === activeTripId) || null;
    }, [data?.trips, activeTripId]);

    useEffect(() => {
        const themeStyle = document.getElementById('dynamic-trip-theme');
        if (themeStyle) {
            if (activeTrip?.color) {
                const primary = activeTrip.color;
                const onPrimary = getContrastColor(primary);
                const primaryContainer = hexToRgba(primary, 0.2);
                themeStyle.innerHTML = `
                    :root {
                        --trip-primary: ${primary};
                        --trip-on-primary: ${onPrimary};
                        --trip-primary-container: ${primaryContainer};
                    }
                `;
            } else {
                themeStyle.innerHTML = '';
            }
        }
    }, [activeTrip?.color]);

    useEffect(() => {
        if (!loading && (!data || data.trips.length === 0)) {
            setCurrentView('profile');
        }
    }, [data, loading]);

    const renderContent = () => {
        if (loading && !data) return <LoadingScreen />;

        if (!activeTrip && data && data.trips.length > 0) {
            return (
                <div className="p-4 text-center">
                    <h2 className="text-xl font-semibold">No active trip.</h2>
                    <p className="text-on-surface-variant">Select a trip from your profile to get started.</p>
                </div>
            );
        }
        
        const mainViews: { [key in AppView]?: React.ReactNode } = {
            'summary': activeTrip && <Dashboard activeTripId={activeTrip.id} setEditingExpense={setEditingExpense} onNavigate={setCurrentView} />,
            'itinerary': activeTrip && <ItineraryView trip={activeTrip} onAddExpense={setEditingExpense} />,
            'plan': activeTrip && <Suspense fallback={<LoadingScreen />}><PlanView trip={activeTrip} onNavigate={setCurrentView} /></Suspense>,
            'stats': activeTrip && <Suspense fallback={<LoadingScreen />}><Statistics trip={activeTrip} expenses={activeTrip.expenses || []} /></Suspense>,
            'group': activeTrip && <Suspense fallback={<LoadingScreen />}><GroupView trip={activeTrip} /></Suspense>,
            'profile': <ProfileScreen trips={data?.trips || []} activeTripId={activeTripId} onSetDefaultTrip={setDefaultTrip} onLogout={onLogout} />
        };
        
        if (!activeTrip && currentView !== 'profile') {
             return <ProfileScreen trips={[]} activeTripId={null} onSetDefaultTrip={setDefaultTrip} onLogout={onLogout} />;
        }

        return mainViews[currentView] || <div>View not found</div>;
    };

    return (
        <>
            <MainLayout activeView={currentView} onNavigate={setCurrentView} isTripActive={!!activeTrip}>
                {renderContent()}
            </MainLayout>
            
            {activeTrip && currentView !== 'profile' && (
                <FloatingActionButtons 
                    onAddExpense={() => setEditingExpense({})}
                    onAIPanelOpen={() => setIsAIPanelOpen(true)}
                    onScanReceipt={() => setIsScannerOpen(true)}
                />
            )}

            <Suspense fallback={<div />}>
                {editingExpense && activeTrip && (
                    <ExpenseForm 
                        expense={editingExpense} 
                        trip={activeTrip}
                        onClose={() => setEditingExpense(null)}
                    />
                )}
                {isAIPanelOpen && activeTrip && (
                    <AIPanel 
                        trip={activeTrip} 
                        expenses={activeTrip.expenses || []} 
                        onClose={() => setIsAIPanelOpen(false)} 
                    />
                )}
                {isScannerOpen && (
                    <ReceiptScanner 
                        trip={activeTrip!}
                        onClose={() => setIsScannerOpen(false)}
                        onScanComplete={(expense) => setEditingExpense(expense)}
                    />
                )}
            </Suspense>

            <DebugMenu 
                user={user}
                dataContext={{ data, loading, firebaseStatus }}
                activeTripId={activeTripId}
            />
        </>
    );
};

export default App;
