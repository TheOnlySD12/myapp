import React, {useEffect, useRef, useState} from "react";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import {BrowserQRCodeReader, IScannerControls} from "@zxing/browser";
import {Elev, loadTabel} from "../storage/storage";



const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [result, setResult] = useState("");
    const [scannedItems, setScannedItems] = useState<string[]>([]);
    const [tabel, setTabel] = useState<Elev[]>([]);


    useEffect(() => {
        const loadData = async () => {
            const data = await loadTabel();
            if (data) {
                setTabel(data);
            }
        };
        loadData().then(() => console.log("Loaded Tabel"));
    }, []);

    function handleScan(text: string) {
        console.log("Scan", text);

        if (!scannedItems.some(item => item === text)) {
            const newScannedItems = [...scannedItems, text];

            setScannedItems(newScannedItems);

            const elevGasit = tabel.find(elev => elev.name === text);

            console.log("Scanned:", elevGasit);

            if(elevGasit){
                console.log('Flags:', elevGasit.flags);
                setResult(elevGasit.flags.toString)
            }
        }


    }

    useEffect(() => {
        const reader = new BrowserQRCodeReader();
        let controls: IScannerControls | undefined;

        reader.decodeFromVideoDevice(
                undefined,
                videoRef.current || undefined,
                (output,_, c) => {
                    if (!controls && c) controls = c; // save controls once
                    if (output) handleScan(output.getText());
                }
            )
            .catch(() => {});

        return () => {
            if (controls) controls.stop();
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
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%" , height: "80%" }}
                />
                <p>{result}</p>
            </IonContent>
        </IonPage>
    );
};

export default Scan;