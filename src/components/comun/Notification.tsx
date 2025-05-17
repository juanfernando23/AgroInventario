import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number; // en milisegundos
  onClose?: () => void;
  show: boolean;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  duration = 5000, // por defecto 5 segundos
  onClose,
  show
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-400';
      case 'error':
        return 'bg-red-50 border-red-400';
      case 'warning':
        return 'bg-yellow-50 border-yellow-400';
      case 'info':
        return 'bg-blue-50 border-blue-400';
      default:
        return 'bg-gray-50 border-gray-400';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div className={`p-4 rounded-md border-l-4 shadow-md ${getBgColor()} ${getTextColor()}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 mr-8">
            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getTextColor()} hover:bg-opacity-20 hover:bg-gray-500`}
                onClick={handleClose}
              >
                <span className="sr-only">Cerrar</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
