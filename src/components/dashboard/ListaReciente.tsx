import React from 'react';

interface RecentItemProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string; // Ahora es opcional
  viewAllText?: string;
}

const RecentList: React.FC<RecentItemProps> = ({ 
  title, 
  children, 
  viewAllLink,
  viewAllText = 'Ver todos'
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {viewAllLink && (
          <a 
            href={viewAllLink} 
            className="text-sm font-medium text-[#4b7480] hover:text-[#3a5a64]"
          >
            {viewAllText}
          </a>
        )}
      </div>
      {children}
    </div>
  );
};

export default RecentList;