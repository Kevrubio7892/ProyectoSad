import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";
import Login from "./pages/Login"; // Importa la página de Login
import NotiSettings from "./pages/NotiSettings";
import Opciones from './pages/Opciones';
import Perfil from './pages/Perfil';
import Tarjetas from "./pages/Tarjetas";
import Privacidad from "./pages/PrivacySettings";

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

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/notificaciones">
          <NotiSettings />
        </Route>
        <Route exact path="/opciones">
          <Opciones />
        </Route>
        <Route exact path="/perfil">
          <Perfil />
        </Route>
        <Route exact path="/tarjetas">
          <Tarjetas />
        </Route>
        <Route exact path="/privacidad">
          <Privacidad />
        </Route>
        
        {/* Redirige desde la ruta raíz a la página de login */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
