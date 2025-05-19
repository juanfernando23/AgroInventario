import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/estructura/principal';
import UsersList from '../components/usuarios/ListaUsuarios';
import { useUserService } from '../services/UserService';
import { useAuth } from '../fuente/Autenticacion';
import { User } from '../types';

const UsersPage: React.FC = () => {
  const { users, loading, error, addUser, updateUser, deleteUser, loadUsers } = useUserService();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Verificar si el usuario es administrador
  useEffect(() => {
    if (!isAdmin) {
      // Redirigir a usuarios no admin
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);
  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      await addUser(userData);
    } catch (err) {
      console.error('Error al añadir usuario:', err);
    }
  };

  const handleEditUser = async (id: string, userData: Partial<User>) => {
    try {
      await updateUser(id, userData);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  if (!isAdmin) {
    return null; // No renderizar nada si no es admin (se redirigirá)
  }
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h1>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#255466]"></div>
          </div>
        ) : (
          <UsersList
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default UsersPage;