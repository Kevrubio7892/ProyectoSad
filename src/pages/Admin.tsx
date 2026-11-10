import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonAlert,
} from "@ionic/react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import "../styles/ModuleAdminStyles.css";
import { personOutline, logOutOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

interface User {
  id: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  tiempoSesion: number; // Tiempo total de sesión activa en horas
  fechaRegistro: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tiempoUsoPromedio, setTiempoUsoPromedio] = useState<number>(0); // Promedio del tiempo de uso
  const [showLogoutAlert, setShowLogoutAlert] = useState(false); // Estado para el IonAlert

  const history = useHistory(); // Hook para la navegación

  // Firebase Firestore
  const db = getFirestore();

  // Fetch Users and Usage Data from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "Estudiantes");
        const snapshot = await getDocs(usersCollection);

        // Simula datos de tiempo de sesión por usuario
        const usersList: User[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          nombreCompleto: doc.data().nombreCompleto || "N/A",
          telefono: doc.data().telefono || "N/A",
          email: doc.data().email || "N/A",
          tiempoSesion: doc.data().tiempoSesion || Math.random() * 5, // Simulación de tiempo de uso entre 0 y 5 horas
          fechaRegistro: doc.data().fechaRegistro || "N/A",
        }));

        setUsers(usersList);

        // Calcula el tiempo de uso promedio
        const totalTiempo = usersList.reduce(
          (acc, user) => acc + user.tiempoSesion,
          0
        );
        setTiempoUsoPromedio(totalTiempo / usersList.length || 0);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };

    fetchUsers();
  }, [db]);

  // Generar PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Uso de la Aplicación", 20, 20);

    // Usuarios registrados
    doc.setFontSize(12);
    doc.text(`Usuarios Registrados: ${users.length}`, 20, 30);

    // Tiempo de uso promedio
    doc.text(`Tiempo de Uso Promedio: ${tiempoUsoPromedio.toFixed(2)} horas`, 20, 40);

    // Detalles de tiempo de sesión activa
    doc.text("Tiempo de Sesión Activa por Usuario:", 20, 50);
    users.forEach((user, index) => {
      doc.text(
        `${index + 1}. ${user.nombreCompleto} - ${user.tiempoSesion.toFixed(2)} hrs`,
        20,
        60 + index * 10
      );
    });

    doc.save("Reporte_Usuarios.pdf");
  };

  // Maneja la navegación a /admin-perfil
  const handleAdminPerfil = () => {
    history.push("/admin-perfil");
  };

  // Maneja el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      window.location.href = "/login"; // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión. Inténtalo nuevamente.");
    }
  };

  return (
    <IonPage>
      <IonHeader className="header">
        <IonButtons slot="start">
          <IonButton color="light" onClick={handleAdminPerfil}>
            <IonIcon icon={personOutline} size="large" />
          </IonButton>
        </IonButtons>
        <IonTitle className="centered-title">Administrador</IonTitle>
        <IonButtons slot="end">
          <IonButton color="light" onClick={() => setShowLogoutAlert(true)}>
            <IonIcon icon={logOutOutline} size="large" />
          </IonButton>
        </IonButtons>
      </IonHeader>
      <IonContent className="admin-dashboard">
        {/* Gestión de Usuarios */}
        <div>
          <h2 className="table-tittle">Gestión de Usuarios</h2>
          <table className="user-management">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Usuario</th>
                <th>Teléfono</th>
                <th>Tiempo de Sesión (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Correo">{user.email}</td>
                  <td data-label="Usuario">{user.nombreCompleto}</td>
                  <td data-label="Teléfono">{user.telefono}</td>
                  <td data-label="Tiempo de Sesión">{user.tiempoSesion.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón para Generar Reporte */}
        <IonButton
          className="generate-report-button"
          expand="block"
          onClick={generatePDF}
          fill="clear"
        >
          Generar Reporte
        </IonButton>

        {/* Alert de Logout */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={"Cerrar sesión"}
          message={"¿Estás seguro de que deseas cerrar sesión?"}
          buttons={[
            {
              text: "Cancelar",
              role: "cancel",
            },
            {
              text: "Cerrar sesión",
              handler: handleLogout,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
