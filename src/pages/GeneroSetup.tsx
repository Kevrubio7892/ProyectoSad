import React, { useEffect } from 'react';
import { addGenerosMasivas } from '../services/FireStoreServices';

const GeneroSetup: React.FC = () => {
  useEffect(() => {
    // Ejecuta la función para agregar géneros masivamente solo una vez
    addGenerosMasivas();
  }, []);

  return <div>Cargando géneros...</div>;
};

export default GeneroSetup;
