'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User, SignInRequest, SignUpRequest } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInRequest) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        apiClient.setAuthToken(storedToken);
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (data: SignInRequest) => {
    try {
      const response = await apiClient.signIn(data);


      // Check if response contains the expected data
      if (response.sessionToken && response.user) {
        setToken(response.sessionToken);
        setUser(response.user);
        apiClient.setAuthToken(response.sessionToken);

        // Store in localStorage
        localStorage.setItem('auth_token', response.sessionToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Sign in failed - invalid response');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (data: SignUpRequest) => {
    try {
      const response = await apiClient.signUp(data);


      // Check if response contains the expected data
      if (response.sessionToken && response.user) {
        setToken(response.sessionToken);
        setUser(response.user);
        apiClient.setAuthToken(response.sessionToken);

        // Store in localStorage
        localStorage.setItem('auth_token', response.sessionToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      } else {
        // If signup was successful but didn't return token/user, try signing in
        await signIn({ email: data.email, password: data.password });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        await apiClient.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setToken(null);
      apiClient.setAuthToken(null);

      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const response = await apiClient.getCurrentUser();

      if (response.status === 'success') {
        setUser(response.user);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      } else {
        // Token might be invalid, clear auth state
        await signOut();
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await signOut();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}