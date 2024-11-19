import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotiSettings from "./pages/NotiSettings";
import Opciones from './pages/Opciones';
import Perfil from './pages/Perfil';
import Tarjetas from "./pages/Tarjetas";
import Privacidad from "./pages/PrivacySettings";
import Admin from "./pages/Admin";
import AdminPerfil from "./pages/AdminPerfil";
import Register from "./pages/Register";
import RegistarFormGoogle from "./pages/RegisterFormGoogle";
import CarreraSetup from "./pages/CarreraSetup";
import GeneroSetup from "./pages/GeneroSetup";
import KhipuPayment from "./components/KhipuPayments";
import Chats from "./pages/Chats";
import { auth } from "./firebaseConfig"; // Importa Firebase config

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import ChatView from "./pages/ChatIndividual";

setupIonicReact();

const App: React.FC = () => {
  const currentUserId = auth.currentUser?.uid || ''; // Obtiene el ID del usuario autenticado

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Página de Login */}
          <Route exact path="/login">
            <Login />
          </Route>

          {/* Página Principal */}
          <Route exact path="/home">
            <Home />
          </Route>

          {/* Configuración de Notificaciones */}
          <Route exact path="/notificaciones">
            <NotiSettings />
          </Route>

          {/* Opciones de Usuario */}
          <Route exact path="/opciones">
            <Opciones />
          </Route>

          {/* Perfil del Usuario */}
          <Route exact path="/perfil">
            <Perfil />
          </Route>

          {/* Tarjetas de Usuarios */}
          <Route exact path="/tarjetas">
            <Tarjetas />
          </Route>

          {/* Configuración de Privacidad */}
          <Route exact path="/privacidad">
            <Privacidad />
          </Route>

          {/* Administración de Perfiles */}
          <Route exact path="/adminperfil">
            <AdminPerfil />
          </Route>

          {/* Página de Administración */}
          <Route exact path="/admin">
            <Admin />
          </Route>

          {/* Registro de Usuarios */}
          <Route exact path="/register">
            <Register />
          </Route>

          {/* Registro con Google */}
          <Route exact path="/register-form-google">
            <RegistarFormGoogle />
          </Route>
          <Route path="/chat/:userId" component={ChatView} />


          {/* Chats */}
          <Route exact path="/chats">
            <Chats/>
          </Route>

          {/* Cargar Carreras */}
          <Route exact path="/cargar-carreras">
            <CarreraSetup />
          </Route>

          {/* Cargar Géneros */}
          <Route exact path="/cargar-generos">
            <GeneroSetup />
          </Route>

          {/* Pagos con Khipu */}
          <Route exact path="/pago">
            <KhipuPayment />
          </Route>

          {/* Ruta por defecto: redirige a login */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
