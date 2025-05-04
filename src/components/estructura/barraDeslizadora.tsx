import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package2, 
  RepeatIcon, 
  ShoppingCart, 
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../fuente/Autenticacion';

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/productos', name: 'Productos', icon: <Package2 className="w-5 h-5" /> },
    { path: '/movimientos', name: 'Movimientos', icon: <RepeatIcon className="w-5 h-5" /> },
    { path: '/ventas', name: 'Ventas', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/usuarios', name: 'Usuarios', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white h-full shadow-md flex flex-col">
      <div className="p-4 border-b flex justify-center items-center">
        <img
          src="/logo.png"
          alt="Logo"
          style={{ height: '120px', width: 'auto' }} // Usando un tamaño específico en píxeles
          className="object-contain"
        />
      </div>
      
      <div className="p-3 border-b">
        <div className="px-2 py-3">
          <p className="text-xs text-gray-500">USUARIO</p>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      
      <nav className="flex-grow py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 ease-in-out
                  ${pathname === item.path ? 'bg-green-50 text-green-700 border-r-4 border-green-600' : ''}
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
          onClick={logout} 
          className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded transition-colors duration-150 ease-in-out"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;