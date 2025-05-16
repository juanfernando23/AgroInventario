import React, { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      setIsAnimating(true);
      setIsVisible(true);
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      onClose();
    }, 200); // Slightly shorter than animation duration to avoid visual glitches
    return () => clearTimeout(timer);
  };

  if (!isVisible && !isAnimating) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div 
          className={`fixed inset-0 bg-black/30 ${isOpen ? 'animate-fade-in' : 'animate-fade-out'}`}
          onClick={handleClose}
          aria-hidden="true"
        ></div>
        
        <div 
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl mx-auto my-8 max-h-[90vh] overflow-y-auto z-50 ${
            isOpen ? 'animate-scale-in' : 'animate-scale-out'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button 
              type="button"
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

