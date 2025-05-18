import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthService } from '../services/AuthService';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin,
    loading, 
    error, 
    login, 
    logout 
  } = useAuthService();

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isAdmin,
        user, 
        login, 
        logout, 
        error,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};