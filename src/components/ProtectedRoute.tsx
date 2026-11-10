import React, { useEffect, useState } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { getUserRoleByPhone, getUserRoleFromCollections } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface ProtectedRouteProps extends RouteProps {
  role: string; // Rol requerido para acceder a la ruta
  component: React.ComponentType<any>; // Componente a renderizar
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role, component: Component, ...rest }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authCheckId = 0;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentCheckId = ++authCheckId;
      if (!user?.email && !user?.phoneNumber) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedRole = user.email
          ? await getUserRoleFromCollections(user.email)
          : await getUserRoleByPhone(user.phoneNumber!);
        if (active && currentCheckId === authCheckId) {
          setUserRole(fetchedRole);
        }
      } catch (error) {
        console.error("Error al verificar el rol del usuario:", error);
        if (active && currentCheckId === authCheckId) {
          setUserRole(null);
        }
      } finally {
        if (active && currentCheckId === authCheckId) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
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
