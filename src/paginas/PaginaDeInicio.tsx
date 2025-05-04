import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/autorizacion/InicioSesion';
import { useAuth } from '../fuente/Autenticacion';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <LoginForm />;
};

export default LoginPage;