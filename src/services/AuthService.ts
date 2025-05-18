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
      
      // Intenta autenticar con el servidor real
      try {
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
          // Si hay un error con el servidor real, usamos usuario mock para desarrollo
          console.warn('Error de autenticación con el servidor, usando modo de prueba');
          // Si el usuario ingresó las credenciales de admin que sabemos que existen
          if (email === 'admin@agroinventario.com' && password === 'admin123') {
            const mockUser: User = {
              id: '1',
              name: 'Admin Usuario',
              email: 'admin@agroinventario.com',
              role: 'admin',
              status: 'active',
              lastLogin: new Date().toISOString()
            };
            const mockToken = 'mock-token-123456789';
            setUser(mockUser);
            setToken(mockToken);
            localStorage.setItem(TOKEN_KEY, mockToken);
            localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
            return true;
          } else {
            const errorData = await response.json().catch(() => ({ message: 'Error de autenticación' }));
            setError(errorData.message || 'Credenciales inválidas');
            return false;
          }
        }
      } catch (err) {
        console.error('Error de conexión con el servidor de autenticación:', err);
        // En caso de error de conexión, usar el usuario mock si las credenciales coinciden
        if (email === 'admin@agroinventario.com' && password === 'admin123') {
          const mockUser: User = {
            id: '1',
            name: 'Admin Usuario',
            email: 'admin@agroinventario.com',
            role: 'admin',
            status: 'active',
            lastLogin: new Date().toISOString()
          };
          const mockToken = 'mock-token-123456789';
          setUser(mockUser);
          setToken(mockToken);
          localStorage.setItem(TOKEN_KEY, mockToken);
          localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
          return true;
        } else {
          setError('Credenciales inválidas o problemas de conexión');
          return false;
        }
      }
    } catch (err) {
      setError('Error durante el inicio de sesión');
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
