import React, { createContext, useState, useContext, ReactNode } from 'react';
import { mockCurrentUser } from '../data/SimulacionDatos';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<typeof mockCurrentUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      
      if (email === 'admin@agroinventario.com' && password === 'password') {
        setUser(mockCurrentUser);
        setIsAuthenticated(true);
        setError(null);
        return true;
      } else {
        setError('Credenciales incorrectas');
        return false;
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, error }}>
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