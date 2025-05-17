import React, { useEffect, useRef, useState } from 'react';

type AnimationDirection = 'left' | 'right' | 'up' | 'down';
type AnimationType = 'fade' | 'slide' | 'scale' | 'fade-slide';

interface AnimatedItemProps {
  children: React.ReactNode;
  delay?: number; // Retraso en milisegundos
  duration?: number; // Duración en milisegundos
  direction?: AnimationDirection; // Dirección de la animación
  type?: AnimationType; // Tipo de animación
  className?: string; // Clases adicionales
  animate?: boolean; // Si debe animarse o no
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  type = 'fade-slide',
  className = '',
  animate = true
}) => {
  const [isVisible, setIsVisible] = useState(!animate);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si el elemento entra en el viewport y aún no es visible, hacerlo visible
        if (entry.isIntersecting && !isVisible) {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 } // Trigger cuando al menos 10% del elemento es visible
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, [animate, delay, isVisible]);

  // Configurar los estilos de animación según el tipo y dirección
  const getAnimationClasses = () => {
    let classes = `transition-all duration-${duration} ease-out `;

    if (!isVisible) {
      let transform = '';
      let opacity = 'opacity-0 ';

      if (type === 'fade' || type === 'fade-slide') {
        classes += opacity;
      }

      if (type === 'scale') {
        transform += 'scale-95 ';
      }

      if (type === 'slide' || type === 'fade-slide') {
        switch (direction) {
          case 'left':
            transform += 'translate-x-6 ';
            break;
          case 'right':
            transform += '-translate-x-6 ';
            break;
          case 'up':
            transform += 'translate-y-6 ';
            break;
          case 'down':
            transform += '-translate-y-6 ';
            break;
        }
      }

      if (transform) {
        classes += `transform ${transform}`;
      }

      return classes;
    }

    return classes + 'opacity-100 transform-none';
  };

  return (
    <div
      ref={itemRef}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedItem;