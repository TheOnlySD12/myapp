import {IonAlert, IonButton, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar} from '@ionic/react';
import './Home.css';
import React from "react";

const rainbowStyle = {
    background: "linear-gradient(to right, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8F00FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
}


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
                    <IonText>
                         Sara este <IonText style={rainbowStyle}>asa</IonText>.
                    </IonText>
                </p>
                <IonButton id="present-alert">Click Me</IonButton>
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