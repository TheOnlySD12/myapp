import {
    IonAlert,
    IonButton,
    IonContent,
    IonHeader, IonItem,
    IonPage,
    IonText,
    IonTitle,
    IonToggle,
    IonToolbar
} from '@ionic/react';
import './Home.css';
import React from "react";
import {useScanSettings} from "../contexts/SettingsContext";
import {useTabel} from "../contexts/TabelContext";
import {createTestData, loadTabel} from "../storage/storage";

const rainbowStyle = {
    background: "linear-gradient(to right, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8F00FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
}


const Home: React.FC = () => {
    const {scanMode , setScanMode} = useScanSettings();
    const { setTabel } = useTabel();

    const handleReset = async () => {
        await createTestData();
        const fresh = await loadTabel();
        if (fresh) {
            setTabel(fresh);
        }
    };

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
                <p>
                    <IonText>
                        Sara este <IonText style={rainbowStyle}>asa</IonText>.
                    </IonText>
                </p>
                <IonItem>
                    <IonToggle
                        checked={scanMode === "battery"}
                        onIonChange={(e) => setScanMode(e.detail.checked ? "battery" : "instant")}
                    >Low Power Mode
                    </IonToggle>
                </IonItem>
                <IonButton id="present-alert">Test Alerta</IonButton>
                <IonButton onClick={() => void handleReset()}>Reset Data</IonButton>
                <IonAlert
                    header="Alert!"
                    trigger="present-alert"
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                                console.log('Alert canceled');
                            },
                        },
                        {
                            text: 'OK',
                            role: 'confirm',
                            handler: () => {
                                console.log('Alert confirmed');
                            },
                        },
                    ]}
                    onDidDismiss={({ detail }) => console.log(`Dismissed with role: ${detail.role}`)}
                ></IonAlert>
            </IonContent>

        </IonPage>
    );
};

export default Home;