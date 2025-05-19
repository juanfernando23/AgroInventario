import React, { useState, useEffect } from 'react';

interface RecentItemProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string; // Ahora es opcional
  viewAllText?: string;
  delay?: number; // Añadir retraso para animación escalonada
  isLoading?: boolean; // Estado de carga
  error?: string | null; // Mensaje de error
}

const RecentList: React.FC<RecentItemProps> = ({ 
  title, 
  children, 
  viewAllLink,
  viewAllText = 'Ver todos',
  delay = 0,
  isLoading = false,
  error = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div 
      className={`bg-white shadow rounded-lg overflow-hidden transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-8'
      }`}
    >
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {viewAllLink && (
          <a 
            href={viewAllLink} 
            className="text-sm font-medium text-[#4b7480] hover:text-[#3a5a64] transition-colors duration-200"
          >
            {viewAllText}
          </a>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b7480]"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default RecentList;

