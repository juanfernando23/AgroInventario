import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package2, 
  RepeatIcon, 
  ShoppingCart, 
  Users,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../fuente/Autenticacion';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/productos', name: 'Productos', icon: <Package2 className="w-5 h-5" /> },
    { path: '/movimientos', name: 'Movimientos', icon: <RepeatIcon className="w-5 h-5" /> },
    { path: '/ventas', name: 'Ventas', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/usuarios', name: 'Usuarios', icon: <Users className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    if (onClose) onClose();
    logout();
  };

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 768) onClose();
  };

  return (
    <div className="bg-white h-full shadow-md flex flex-col relative">
      {/* Botón para cerrar en móviles */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <div className="p-4 border-b flex justify-center items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-20 md:h-[120px] w-auto object-contain"
        />
      </div>
      
      <div className="p-3 border-b">
        <div className="px-2 py-3">
          <p className="text-xs text-gray-500">USUARIO</p>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      <nav className="flex-grow py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={handleNavClick}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-[#edf2f4] hover:text-[#4b7480] transition-colors duration-150 ease-in-out
                  ${pathname === item.path ? 'bg-[#edf2f4] text-[#4b7480] border-r-4 border-[#4b7480]' : ''}
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto border-t">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center px-4 py-2 text-white bg-[#255466] hover:bg-[#1d4050] rounded transition-colors duration-150 ease-in-out"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

