import React, { useState } from 'react';
import MainLayout from '../components/estructura/principal';
import UsersList from '../components/usuarios/ListaUsuarios';
import { mockUsers } from '../data/SimulacionDatos';
import { User } from '../types';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  const handleAddUser = (userData: Omit<User, 'id' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: `${users.length + 1}`,
      lastLogin: '-'
    };
    
    setUsers([...users, newUser]);
  };

  const handleEditUser = (id: string, userData: Partial<User>) => {
    setUsers(
      users.map(user => (user.id === id ? { ...user, ...userData } : user))
    );
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h1>
        <UsersList
          users={users}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </MainLayout>
  );
};

export default UsersPage;