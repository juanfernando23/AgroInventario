import React, { ReactNode, useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { 
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'green' | 'blue' | 'orange' | 'red';
  delay?: number; // Delay for staggered animation
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'default',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600'
    },
    green: {
      bg: 'bg-white',
      iconBg: 'bg-[#edf2f4]',
      iconText: 'text-[#4b7480]'
    },
    blue: {
      bg: 'bg-white',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600'
    },
    orange: {
      bg: 'bg-white',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600'
    },
    red: {
      bg: 'bg-white',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div 
      className={`${classes.bg} rounded-lg shadow p-4 sm:p-6 transition-all duration-500 hover:shadow-md hover:-translate-y-1 ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{value}</p>
          
          {trend && (
            <div className="mt-2 flex items-center">
              <div className={`mr-2 flex items-center text-xs sm:text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <span>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">vs. mes anterior</span>
            </div>
          )}
        </div>
        
        <div className={`${classes.iconBg} ${classes.iconText} p-2 sm:p-3 rounded-full transform transition-transform duration-300 hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
