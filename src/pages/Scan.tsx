import React, {useEffect, useRef, useState} from "react";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import {BrowserQRCodeReader} from "@zxing/browser";
import {Elev, loadTabel} from "../storage/storage";


const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [result, setResult] = useState("");
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [tabel, setTabel] = useState<Elev[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await loadTabel();
            if (data) {
                setTabel(data);
                console.log("Tabel loaded:", data);
            }
        };
        loadData().then(r => r);
    }, []);

    const handleScan = (text: string) => {
        if (!tabel.length) {
            console.log("Scan ignored: data not ready");
            return;
        }
        if (text === lastScan) return;

        setLastScan(text);

        const elevGasit = tabel.find(elev => elev.name === text);

        if (elevGasit) {
            setResult(elevGasit.flags.toString());
        } else {
            setResult("No matching student found");
        }
    };

    useEffect(() => {
        if (!tabel.length) return;

        const reader = new BrowserQRCodeReader();
        let controls: any;

        reader.decodeFromVideoDevice(
            undefined,
            videoRef.current || undefined,
            result => {
                if (result) handleScan(result.getText());
            }
        ).then(c => controls = c);

        return () => {
            if (controls) controls.stop(); // ← ADD THIS
        };
    }, [tabel]);


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