import React, { useEffect } from 'react';
import { addCarrerasMasivas } from '../services/FireStoreServices';

const CarreraSetup: React.FC = () => {
  useEffect(() => {
    // Ejecuta la función para agregar carreras masivamente solo una vez
    addCarrerasMasivas();
  }, []);

  return <div>Cargando carreras...</div>;
};

export default CarreraSetup;
