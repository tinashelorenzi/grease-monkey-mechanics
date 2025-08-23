import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import locationService from './services/locationService';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import BillingScreen from './screens/BillingScreen';
import MessagingScreen from './screens/MessagingScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoadingScreen from './components/LoadingScreen';
import MainAppLayout from './components/MainAppLayout';

type Screen = 'login' | 'register' | 'dashboard' | 'history' | 'billing' | 'messaging' | 'settings';

function AppContent() {
  const { user, mechanicProfile, isLoading, signIn, signOut, registerMechanic } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState<Screen>('login');
  const [isOnline, setIsOnline] = React.useState(false);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

                // If user is authenticated and has a profile, show main app with persistent navigation
        if (user && mechanicProfile) {
          const handleNavigate = (screen: string) => {
            setCurrentScreen(screen as Screen);
          };

          const handleToggleOnline = async () => {
            if (user?.uid) {
              try {
                await locationService.updateOnlineStatus(user.uid, !isOnline);
                setIsOnline(!isOnline);
              } catch (error) {
                console.error('Error toggling online status:', error);
              }
            }
          };

          let screenContent;
          switch (currentScreen) {
            case 'dashboard':
              screenContent = (
                <DashboardScreen
                  onNavigateToHistory={() => setCurrentScreen('history')}
                  onNavigateToBilling={() => setCurrentScreen('billing')}
                  onNavigateToMessaging={() => setCurrentScreen('messaging')}
                  onNavigateToSettings={() => setCurrentScreen('settings')}
                  onLogout={signOut}
                  onOnlineStatusChange={setIsOnline}
                />
              );
              break;
            case 'history':
              screenContent = (
                <HistoryScreen
                  onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                />
              );
              break;
            case 'billing':
              screenContent = (
                <BillingScreen
                  onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                />
              );
              break;
            case 'messaging':
              screenContent = (
                <MessagingScreen
                  onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                />
              );
              break;
            case 'settings':
              screenContent = (
                <SettingsScreen
                  onNavigateToDashboard={() => setCurrentScreen('dashboard')}
                  onLogout={signOut}
                />
              );
              break;
            default:
              setCurrentScreen('dashboard');
              screenContent = (
                <DashboardScreen
                  onNavigateToHistory={() => setCurrentScreen('history')}
                  onNavigateToBilling={() => setCurrentScreen('billing')}
                  onNavigateToMessaging={() => setCurrentScreen('messaging')}
                  onNavigateToSettings={() => setCurrentScreen('settings')}
                  onLogout={signOut}
                  onOnlineStatusChange={setIsOnline}
                />
              );
          }

          return (
            <MainAppLayout
              currentScreen={currentScreen}
              isOnline={isOnline}
              onNavigate={handleNavigate}
              onToggleOnline={handleToggleOnline}
            >
              {screenContent}
            </MainAppLayout>
          );
        }

  // If user is authenticated but no profile, show registration
  if (user && !mechanicProfile) {
    return (
      <RegisterScreen
        onNavigateToLogin={() => signOut()}
        onRegister={registerMechanic}
      />
    );
  }

  // Show appropriate screen based on currentScreen state
  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onNavigateToLogin={() => setCurrentScreen('login')}
        onRegister={registerMechanic}
      />
    );
  }

  // Show login screen
  return (
    <LoginScreen
      onNavigateToRegister={() => setCurrentScreen('register')}
      onLogin={signIn}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
