import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonAlert,
  
} from '@ionic/react';
import { logOut, person } from 'ionicons/icons';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../styles/Admin.css';

const AdminPage: React.FC = () => {
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
  const history = useHistory();

  // Datos de ejemplo para la lista de usuarios
  const users = [
    { name: 'Kevin Rubio', phone: '946857892' },
    { name: 'Edson Beltrán', phone: '947274412' },
    { name: 'Vicente Vilches', phone: '927721472' },
    { name: 'Jeanette Leonelli', phone: '921778127' },
  ];

  // Datos del gráfico de ejemplo
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Reportes',
        data: [120, 150, 200, 130, 140],
        backgroundColor: '#00BFFF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 250,
      },
    },
  };

  const handleLogout = () => {
    // Lógica para el cierre de sesión
    console.log('Sesión cerrada');
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="nav-container" color="danger">
          <IonTitle>Administrador</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={() => history.push('/adminperfil')}>
              <IonIcon icon={person} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowLogoutAlert(true)}>
              <IonIcon icon={logOut} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="user-management-section">
          <h2>Gestión de usuarios</h2>
          <div className="user-table">
            <table>
              <thead>
                <tr>
                  <th>Foto perfil</th>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        src="https://via.placeholder.com/40"
                        alt="profile"
                        className="profile-icon"
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>
                      <IonButton color="warning" size="small">
                        Ver detalles
                      </IonButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-section">
          <h2>Reportes</h2>
          <div className="chart-container">
            <Bar data={data} options={options} />
          </div>
          <IonButton expand="block" color="primary">
            Generar reporte
          </IonButton>
        </div>

        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={'Cerrar sesión'}
          message={'¿Desea cerrar su sesión?'}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Aceptar',
              handler: handleLogout,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
