import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import authService, { MechanicProfile } from '../services/authService';

interface AuthContextType {
  user: User | null;
  mechanicProfile: MechanicProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  registerMechanic: (userData: any) => Promise<void>;
  updateMechanicProfile: (updates: Partial<MechanicProfile>) => Promise<void>;
  refreshMechanicProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mechanicProfile, setMechanicProfile] = useState<MechanicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to authentication state changes
  useEffect(() => {
    try {
      const unsubscribe = authService.onAuthStateChanged(async (user) => {
        setUser(user);
        
        if (user) {
          // Load mechanic profile when user is authenticated
          try {
            const profile = await authService.getMechanicProfile(user.uid);
            setMechanicProfile(profile);
          } catch (error) {
            console.error('Error loading mechanic profile:', error);
            setMechanicProfile(null);
          }
        } else {
          setMechanicProfile(null);
        }
        
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setIsLoading(false);
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.signIn(email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.signUp(email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setMechanicProfile(null);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const registerMechanic = async (userData: any) => {
    try {
      setIsLoading(true);
      const profile = await authService.registerMechanic(userData);
      setMechanicProfile(profile);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateMechanicProfile = async (updates: Partial<MechanicProfile>) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setIsLoading(true);
      await authService.updateMechanicProfile(user.uid, updates);
      
      // Update local state
      if (mechanicProfile) {
        setMechanicProfile({
          ...mechanicProfile,
          ...updates,
        });
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const refreshMechanicProfile = async () => {
    if (!user?.uid) {
      return;
    }

    try {
      const profile = await authService.getMechanicProfile(user.uid);
      setMechanicProfile(profile);
    } catch (error) {
      console.error('Error refreshing mechanic profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    mechanicProfile,
    isLoading,
    signIn,
    signUp,
    signOut,
    registerMechanic,
    updateMechanicProfile,
    refreshMechanicProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
