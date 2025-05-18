// Servicio para la gestión de usuarios desde la API REST
import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';

// URL completa del servidor API
const API_URL = 'http://localhost:3001/api/users';

// Hook personalizado para la gestión de usuarios
export const useUserService = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los usuarios
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('No se pudo obtener la lista de usuarios');
      const data = await res.json();
      
      // Ordenar los usuarios por nombre
      const sortedUsers = [...data].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setUsers(sortedUsers);
    } catch (err: any) {
      setError('Error al cargar usuarios: ' + (err.message || 'Error desconocido'));
      console.error('Error al cargar usuarios:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Añadir un nuevo usuario
  const addUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'employee';
    status: 'active' | 'inactive';
  }): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) {
        let errorMsg = 'No se pudo registrar el usuario';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Si no es JSON, intentamos obtener el texto
          errorMsg = await res.text() || `Error del servidor: ${res.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser].sort((a, b) => 
        a.name.localeCompare(b.name)
      ));
      return newUser;
    } catch (err: any) {
      setError('Error al registrar usuario: ' + (err.message || 'Error desconocido'));
      console.error('Error al registrar usuario:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un usuario por ID
  const getUserById = async (id: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener el usuario');
      const user = await res.json();
      return user;
    } catch (err: any) {
      setError('Error al obtener usuario: ' + (err.message || 'Error desconocido'));
      console.error('Error al obtener usuario:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un usuario
  const updateUser = async (id: string, userData: {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'employee';
    status?: 'active' | 'inactive';
  }): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) {
        let errorMsg = 'No se pudo actualizar el usuario';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Si no es JSON, intentamos obtener el texto
          errorMsg = await res.text() || `Error del servidor: ${res.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const updatedUser = await res.json();
      
      setUsers((prev) => 
        prev.map(user => user.id === id ? updatedUser : user)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      
      return updatedUser;
    } catch (err: any) {
      setError('Error al actualizar usuario: ' + (err.message || 'Error desconocido'));
      console.error('Error al actualizar usuario:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un usuario
  const deleteUser = async (id: string): Promise<{success: boolean, message: string}> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        let errorMsg = 'No se pudo eliminar el usuario';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Si no es JSON, intentamos obtener el texto
          errorMsg = await res.text() || `Error del servidor: ${res.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const result = await res.json();
      
      setUsers((prev) => prev.filter(user => user.id !== id));
      
      return result;
    } catch (err: any) {
      setError('Error al eliminar usuario: ' + (err.message || 'Error desconocido'));
      console.error('Error al eliminar usuario:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const changePassword = async (
    id: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<{success: boolean, message: string}> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!res.ok) {
        let errorMsg = 'No se pudo cambiar la contraseña';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Si no es JSON, intentamos obtener el texto
          errorMsg = await res.text() || `Error del servidor: ${res.status}`;
        }
        throw new Error(errorMsg);
      }
      
      const result = await res.json();
      return result;
    } catch (err: any) {
      setError('Error al cambiar contraseña: ' + (err.message || 'Error desconocido'));
      console.error('Error al cambiar contraseña:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuarios
  const searchUsers = async (term?: string, role?: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      if (term) params.append('term', term);
      if (role) params.append('role', role);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/search/find?${queryString}` : `${API_URL}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al buscar usuarios');
      
      const data = await res.json();
      
      // Ordenar los usuarios por nombre
      const sortedUsers = [...data].sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setUsers(sortedUsers);
    } catch (err: any) {
      setError('Error al buscar usuarios: ' + (err.message || 'Error desconocido'));
      console.error('Error al buscar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    getUserById,
    updateUser,
    deleteUser,
    changePassword,
    searchUsers
  };
};
