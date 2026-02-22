import { Route } from 'react-router-dom';
import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import { home as homeIcon, camera as scanIcon, documentText as tabelIcon } from 'ionicons/icons';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import React, {useEffect} from "react";
import Scan from "./pages/Scan";
import Tabel from "./pages/Tabel";
import {Redirect} from "react-router";
import {createTestData} from "./storage/storage";
import {ScanSettingsProvider} from "./contexts/SettingsProvider";
import {TabelProvider} from "./contexts/TabelProvider";

setupIonicReact();

const App: React.FC = () => {
    useEffect(() => {
        createTestData().then(() => console.log("Test data created"));
    }, []);


    return (
        <IonApp>
            <ScanSettingsProvider>
                <TabelProvider>
                    <IonReactRouter>
                        <IonTabs>
                            <IonRouterOutlet>
                                <Route exact path="/home" component={Home}/>
                                <Route exact path="/scan" component={Scan}/>
                                <Route exact path="/tabel" component={Tabel}/>
                                <Route exact path="/" render={() => <Redirect to="/home"/>}/>
                            </IonRouterOutlet>

                            <IonTabBar slot="bottom">
                                <IonTabButton tab="home" href="/home">
                                    <IonIcon icon={homeIcon}/>
                                    <IonLabel>Home</IonLabel>
                                </IonTabButton>

                                <IonTabButton tab="scan" href="/scan">
                                    <IonIcon icon={scanIcon}/>
                                    <IonLabel>Scan</IonLabel>
                                </IonTabButton>

                                <IonTabButton tab="tabel" href="/tabel">
                                    <IonIcon icon={tabelIcon}/>
                                    <IonLabel>Tabel</IonLabel>
                                </IonTabButton>
                            </IonTabBar>
                        </IonTabs>
                    </IonReactRouter>
                </TabelProvider>
            </ScanSettingsProvider>
        </IonApp>
    );
}


export default App;
