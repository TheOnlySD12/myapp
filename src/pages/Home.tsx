import {IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar} from '@ionic/react';
import './Home.css';
import React from "react";

const Home: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>ElfScanner</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent scrollY={false} forceOverscroll={false}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle size="large">Home</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <p>
                    <IonText color="white">
                         Sara este <IonText color="danger">asa</IonText>.
                    </IonText>
                </p>
            </IonContent>

        </IonPage>
    );
};

export default Home;