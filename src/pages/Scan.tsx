import React, {useEffect} from "react";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import { CameraPreview } from '@capacitor-community/camera-preview';



const Scan: React.FC = () => {
    useEffect(() => {
        // Start the camera when the page loads
        CameraPreview.start({
            parent: "cameraPreview",
            position: "rear",
            className: "cameraPreview",
            disableAudio: true
        });

        // Stop the camera when leaving the page
        return () => {
            CameraPreview.stop();
        };
    }, []);


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
                        <IonTitle size="large">Scan</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div id="cameraPreview"></div>
            </IonContent>
        </IonPage>
    );
};

export default Scan;