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
import Chats from "./pages/Chats";
import ForgotPassword from "./pages/ForgotPassword";
import ChatView from "./pages/ChatIndividual";
import { auth } from "./firebaseConfig"; // Firebase config
import ProtectedRoute from "./components/ProtectedRoute"; // Asegúrate de que esta ruta sea correcta

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

setupIonicReact();

const App: React.FC = () => {
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
          <ProtectedRoute
            path="/opciones"
            role="Estudiante"
            component={Opciones}
          />

          {/* Perfil del Usuario */}
          <ProtectedRoute
            path="/perfil"
            role="Estudiante"
            component={Perfil}
          />

          {/* Tarjetas de Usuarios */}
          <ProtectedRoute
            path="/tarjetas"
            role="Estudiante"
            component={Tarjetas}
          />

          {/* Configuración de Privacidad */}
          <ProtectedRoute
            path="/privacidad"
            role="Estudiante"
            component={Privacidad}
          />

          {/* Administración de Perfiles */}
          <ProtectedRoute
            path="/admin-perfil"
            role="Administrador"
            component={AdminPerfil}
          />

          {/* Página de Administración */}
          <ProtectedRoute
            path="/admin"
            role="Administrador"
            component={Admin}
          />

          {/* Registro de Usuarios */}
          <Route exact path="/register">
            <Register />
          </Route>

          {/* Registro con Google */}
          <Route exact path="/register-form-google">
            <RegistarFormGoogle />
          </Route>

          {/* Chats */}
          <ProtectedRoute
            path="/chats"
            role="Estudiante"
            component={Chats}
          />
          {/* Chat Individual */}
          <ProtectedRoute
            path="/chat/:userId"
            role="Estudiante"
            component={ChatView}
          />

          {/* Cargar Carreras */}
          <ProtectedRoute
            path="/cargar-carreras"
            role="Administrador"
            component={CarreraSetup}
          />

          {/* Cargar Géneros */}
          <ProtectedRoute
            path="/cargar-generos"
            role="Administrador"
            component={GeneroSetup}
          />

          {/* Forgot Password */}
          <Route exact path="/forgot-password">
            <ForgotPassword />
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
