import {
    IonAlert,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonPage,
    IonTitle,
    IonToggle,
    IonToolbar
} from '@ionic/react';
import './Home.css';
import React, {useEffect, useState} from "react";
import {useScanSettings} from "../contexts/SettingsContext";
import {useTabel} from "../contexts/TabelContext";
import {createTestData, loadTabel} from "../storage/storage";

const rainbowStyle = {
    background: "linear-gradient(to right, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8F00FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
}


const Home: React.FC = () => {
    const {scanMode , setScanMode, sunetScanare, setSunetScanare, vibratieScanare, setVibratieScanare} = useScanSettings();
    const { tabel , setTabel , scannedToday} = useTabel();
    const today = [0, 6].includes(new Date().getDay()) ? 1 : new Date().getDay();
    const numarDesertElevi = tabel.filter(elev => elev.flags[0] && elev.flags[today]).length;
    const numarElevi = tabel.filter(elev => elev.flags[today]).length;
    const scanatiAzi = scannedToday.length;
    const [now, setNow] = useState(new Date());
    const cantinaActiva =
        now.getDay() >= 1 &&
        now.getDay() <= 5 &&
        now.getHours() === 13 &&
        now.getMinutes() <= 25;


    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 5000); // update every 5s
        return () => clearInterval(id);
    }, []);


    const handleReset = async () => {
        await createTestData();
        const fresh = await loadTabel();
        if (fresh) {
            setTabel(fresh);
        }
    };

    /*

    5. Un card „Ultima actualizare a datelor”
    Dacă datele vin dintr-un fișier sau sunt regenerate:
    - „Ultima actualizare: azi la 12:03”
    - „Sursa: local / server / fișier”
    Ajută operatorul să știe dacă lucrează cu date proaspete.


 Confirmare pentru Reset Data
În loc să resetezi instant, poți avea:
- un dialog cu două opțiuni: „Resetează doar scanările de azi” și „Reset complet tabel”

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
            <IonContent scrollY={true} forceOverscroll={false}> {/*modificat temp*/}
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Statistici</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList lines="none">
                            <IonItem>
                                <IonLabel>Total Elevi</IonLabel>
                                <IonNote>{numarElevi}</IonNote>
                            </IonItem>

                            <IonItem>
                                <IonLabel>Desert</IonLabel>
                                <IonNote>{numarDesertElevi}/{numarElevi}</IonNote>
                            </IonItem>

                            <IonItem>
                                <IonLabel>Total Scanați</IonLabel>
                                <IonNote>{scanatiAzi}</IonNote>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>
                <IonCard >
                    <IonCardHeader>
                        <IonCardTitle>Setari</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList lines="none" >
                            <IonItem>
                                <IonToggle
                                    checked={scanMode === "battery"}
                                    onIonChange={(e) => setScanMode(e.detail.checked ? "battery" : "instant")}
                                >Low Power Mode
                                </IonToggle>
                            </IonItem>
                            <IonItem>
                                <IonToggle
                                    checked={sunetScanare}
                                    onIonChange={(e) => setSunetScanare(!e)}
                                >Sunet Scanare
                                </IonToggle>
                            </IonItem>
                            <IonItem>
                                <IonToggle
                                    checked={vibratieScanare}
                                    onIonChange={(e) => setVibratieScanare(!e)}
                                >Vibratie Scanare
                                </IonToggle>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Actiuni</IonCardTitle>
                    </IonCardHeader>
                    <IonButton id="present-alert">Test Alerta</IonButton>
                    <IonButton onClick={() => void handleReset()}>Reset Data</IonButton>
                </IonCard>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>Informatii</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList lines="none">
                            <IonItem>
                                <IonLabel>Ultima actualizare:</IonLabel>
                                <IonNote>12:07</IonNote>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Sursa:</IonLabel>
                                <IonNote>server</IonNote>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Cantina: </IonLabel>
                                <IonNote>
                                    <IonBadge color={cantinaActiva ? "success" : "danger"}>{cantinaActiva ? "DESCHISA" : "INCHISA"}</IonBadge>
                                </IonNote>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>
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