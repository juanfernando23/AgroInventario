import React from 'react';
import { Lightbulb } from 'lucide-react';

interface BotonRecomendacionesProps {
  onClick: () => void;
  delay?: number;
}

const BotonRecomendaciones: React.FC<BotonRecomendacionesProps> = ({ onClick, delay = 0 }) => {
  const animationClass = delay ? `animate-fadeIn animation-delay-${delay}` : 'animate-fadeIn';
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md shadow-md hover:shadow-lg transition-all ${animationClass}`}
    >
      <Lightbulb className="w-5 h-5 mr-2" />
      <span>Recomendaciones IA</span>
    </button>
  );
};

export default BotonRecomendaciones;
