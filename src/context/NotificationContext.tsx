import React, { createContext, useState, useContext, ReactNode } from 'react';
import Notification, { NotificationType } from '../components/comun/Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    message: string;
    duration: number;
  }>({
    show: false,
    type: 'info',
    message: '',
    duration: 5000,
  });

  const showNotification = (type: NotificationType, message: string, duration = 5000) => {
    setNotification({
      show: true,
      type,
      message,
      duration,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        duration={notification.duration}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
