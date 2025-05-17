import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './fuente/Autenticacion';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './paginas/PaginaDeInicio';
import DashboardPage from './paginas/PanelDeControl';
import ProductsPage from './paginas/PaginaDeProductos';
import MovementsPage from './paginas/PaginaDeMovimientos';
import SalesPage from './paginas/PaginaDeVentas';
import UsersPage from './paginas/PaginaDeUsuarios';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/movimientos" element={<MovementsPage />} />
            <Route path="/ventas" element={<SalesPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;