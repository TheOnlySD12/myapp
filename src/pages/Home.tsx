import {IonContent, IonHeader, IonPage, IonText, IonTitle, IonToggle, IonToolbar} from '@ionic/react';
import './Home.css';
import React from "react";
import {useScanSettings} from "../Settings";

const Home: React.FC = () => {
    const { scanMode, setScanMode } = useScanSettings();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>ElfScanner</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonHeader>
                <IonToolbar>
                    <IonTitle style={{fontSize: "32px"}}>Home</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent scrollY={false} forceOverscroll={false}>
                <IonText color="white">
                    <p>Sara este <IonText color="danger">asa</IonText>.</p>
                </IonText>
                <IonToggle checked={scanMode === "battery"} onIonChange={(e) =>
                    setScanMode(e.detail.checked ? "battery" : "instant")
                }>
                    Low Power Mode
                </IonToggle>
            </IonContent>
        </IonPage>
    );
};

export default Home;