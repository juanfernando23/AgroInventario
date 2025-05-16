import React, { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './barraDeslizadora';
import { useAuth } from '../../fuente/Autenticacion';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
      {/* Barra superior móvil */}
      <div className="md:hidden bg-white shadow-md p-4 flex items-center justify-between">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-10 w-auto object-contain"
        />
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-[#255466] hover:bg-gray-100 focus:outline-none transition-colors duration-200"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Sidebar - visible en móviles solo cuando está abierto */}
      <div 
        className={`
          md:w-64 md:flex-shrink-0 transition-all duration-300 ease-in-out
          ${sidebarOpen 
            ? 'fixed inset-0 z-40 md:relative md:inset-auto animate-slide-in-right md:animate-none' 
            : 'hidden md:block'}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Overlay para cerrar el sidebar en móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      <div className="flex-1 overflow-auto">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

