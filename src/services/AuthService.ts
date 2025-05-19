// Servicio para manejar la autenticación de usuarios
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

const AUTH_URL = 'http://localhost:3001/api/auth';
const TOKEN_KEY = 'agroinventario_auth_token';
const USER_KEY = 'agroinventario_user';

// Hook personalizado para la gestión de autenticación
export const useAuthService = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Variable para controlar la inicialización
  const [, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const loadSavedAuth = () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    loadSavedAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ 
          error: 'Error de autenticación',
          errorType: 'connection_error' 
        }));
        
        setError(errorData.error || 'Credenciales inválidas');
        return false;
      }
    } catch (err) {
      console.error('Error de conexión con el servidor de autenticación:', err);
      setError('Error de conexión con el servidor. Verifica tu conexión a internet.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    getAuthHeader: () => (token ? { 'Authorization': `Bearer ${token}` } : {}),
    hasRole: (role: string) => user?.role === role,
    changePassword: async () => ({ success: false, message: 'No implementado' })
  };
};
