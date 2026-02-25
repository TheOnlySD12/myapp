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

    /*
     4) Afișarea ultimei sincronizări
        Dacă datele vin dintr-un fișier sau server, poți afișa:
        - „Ultima actualizare: azi la 10:32”
     1) Statistici rapide pentru ziua curentă
        Un mic card cu:
        - total elevi
        - câți au fost scanați azi
        - câți lipsesc
        - câți au desert / câți nu
        Ajută enorm la o privire rapidă asupra progresului.
    3. O secțiune „Setări rapide”
    Aici intră:
    - Low Power Mode (toggle-ul actual)
    - eventual un toggle pentru „Sunet la scanare”
    - un toggle pentru „Vibrație la scanare” (dacă vrei feedback haptic pe mobile)
    Operatorii apreciază setările rapide, mai ales când sunt sub presiune.
    5. Un card „Ultima actualizare a datelor”
    Dacă datele vin dintr-un fișier sau sunt regenerate:
    - „Ultima actualizare: azi la 12:03”
    - „Sursa: local / server / fișier”
    Ajută operatorul să știe dacă lucrează cu date proaspete.
    Indicator „Flux activ”
Un mic badge sau icon care arată:
- „Cantina este deschisă acum”
- „Program închis” (în afara orelor)
Poți seta automat în funcție de ora curentă (ex. 12:00–14:00).
 Confirmare pentru Reset Data
În loc să resetezi instant, poți avea:
- un dialog cu două opțiuni: „Resetează doar scanările de azi” și „Reset complet tabel”
Operatorii greșesc uneori apăsând butoane, iar asta previne pierderi de date.
Gruparea în secțiuni
În loc de elemente dispersate, poți avea:
- Statistici
- Setări rapide
- Acțiuni
- Informații
Structura ajută operatorul să navigheze rapid.



────────────────────────────────
  Home
────────────────────────────────

┌──────────────────────────────┐
│ 📊 STATISTICI                │
│ Total elevi: 320             │
│ Scanați azi: 180             │
│ Lipsă: 12                    │
│ Desert: 90 / 230             │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ⚙️ SETĂRI RAPIDE             │
│ Low Power Mode      [toggle] │
│ Sunet scanare       [toggle] │
│ Vibrație scanare    [toggle] │
└──────────────────────────────┘

┌──────────────────────────────┐
│ 🧰 ACȚIUNI                   │
│ [ Reset Data ]               │
│ [ Test Alertă ]              │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ℹ️ INFORMAȚII                │
│ Ultima actualizare: 12:03    │
│ Sursa: server                │
│ Cantina: DESCHISĂ            │
└──────────────────────────────┘
    * */


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar style={{ borderBottom: '0.5px solid #262626' }}>
                    <IonTitle>ElfScanner</IonTitle>
                </IonToolbar>
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