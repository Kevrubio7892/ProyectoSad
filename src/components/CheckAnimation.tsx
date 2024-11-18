// CheckAnimation.tsx
import React, { useEffect } from 'react';
import '../styles/CheckAnimationStyles.css'; // Asegúrate de crear este archivo CSS

const CheckAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 500); // Duración de la animación

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="check-animation">
      👍
    </div>
  );
};

export default CheckAnimation;
