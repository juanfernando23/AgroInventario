import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface UserFormProps {
  user?: User;
  onSave: (userData: Partial<User>) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    status: 'active',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(!user);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when typing
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match if setting a password
    if (showPassword && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
      
      if (formData.password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }
    
    // Prepare data for save (exclude confirmPassword and conditionally exclude password)
    const userData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
    };
    
    // Only include password if we're showing the password fields and there is a password
    if (showPassword && formData.password) {
      userData.password = formData.password;
    }
    
    onSave(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-y-5">
        {passwordError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{passwordError}</p>
          </div>
        )}
        
        <div className="w-full">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Nombre Completo
          </label>
          <div>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            />
          </div>
        </div>
        
        <div className="w-full">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Correo Electrónico
          </label>
          <div>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Rol
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="appearance-none shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              >
                <option value="admin">Administrador</option>
                <option value="employee">Empleado</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Estado
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="appearance-none shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {user && (
          <div className="w-full">
            <div className="flex items-center">
              <input
                id="change_password"
                name="change_password"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="change_password" className="ml-2 block text-sm text-gray-900">
                Cambiar contraseña
              </label>
            </div>
          </div>
        )}
        
        {showPassword && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  Contraseña
                </label>
                <div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!user}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
                  />
                </div>
              </div>
              
              <div className="w-full">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  Confirmar Contraseña
                </label>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!user}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
                  />
                </div>
              </div>
            </div>
            
            {passwordError && (
              <div className="w-full">
                <p className="mt-2 text-sm text-red-600 text-left">{passwordError}</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#255466] hover:bg-[#1d4050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466]"
        >
          {user ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;