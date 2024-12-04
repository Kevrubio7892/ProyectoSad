import React, { useEffect, useState } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { getUserRoleFromCollections } from "../firebaseConfig";
import { auth } from "../firebaseConfig";

interface ProtectedRouteProps extends RouteProps {
  role: string; // Rol requerido para acceder a la ruta
  component: React.ComponentType<any>; // Componente a renderizar
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const email = auth.currentUser?.email;
      if (email) {
        const fetchedRole = await getUserRoleFromCollections(email);
        setUserRole(fetchedRole);
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se obtiene el rol
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        userRole === role ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default ProtectedRoute;
