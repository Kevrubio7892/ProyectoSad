// LikeAnimation.tsx
import React, { useEffect } from 'react';
import '../styles/XAnimation.css';// Asegúrate de crear este archivo CSS

const LikeAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000); // Duración de la animación

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="x-animation">
      ❌
    </div>
  );
};

export default LikeAnimation;
