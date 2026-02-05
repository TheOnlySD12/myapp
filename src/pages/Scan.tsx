import React, {useCallback, useEffect, useRef, useState} from "react";
import {IonCard, IonCardContent, IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import {BrowserQRCodeReader, IScannerControls} from "@zxing/browser";
import {Elev, loadTabel} from "../storage/storage";
import {createPortal} from "react-dom";
import {useScanSettings} from "../Settings";


const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [result, setResult] = useState("");
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [tabel, setTabel] = useState<Elev[]>([]);
    const lastScanRef = useRef<string | null>(null);
    const tabelRef = useRef<Elev[]>([]);
    const { setIsScanTabActive } = useScanSettings();
    const { scanMode, isScanTabActive } = useScanSettings();
    const controlsRef = useRef<IScannerControls | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const data = await loadTabel();
            if (data) {
                setTabel(data);
                tabelRef.current = data;
                console.log("Tabel loaded:", data);
            }
        };
        loadData().then(r => r);
    }, []);

    useEffect(() => { lastScanRef.current = lastScan; }, [lastScan]);
    useEffect(() => { tabelRef.current = tabel; }, [tabel]);

    const handleScan = useCallback((text: string) => {
        if (scanMode === "instant" && !isScanTabActive) return;
        if (!tabelRef.current.length) {
            console.log("Scan ignored: data not ready");
            return;
        }
        if (text === lastScanRef.current) return;

        setLastScan(text);
        lastScanRef.current = text;

        const elevFound = tabelRef.current.find(elev => elev.name === text);

        if (elevFound) {
            setResult(elevFound.flags.toString());
        } else {
            console.log(text);
            setResult("No matching student found");
        }
    },[isScanTabActive, scanMode]);

    useEffect(() => {
        if (!tabel.length) return;

        const reader = new BrowserQRCodeReader();

        reader.decodeFromVideoDevice(
            undefined,
            videoRef.current || undefined,
            result => {
                if (result) handleScan(result.getText());
            }
        ).then(c => {
            controlsRef.current = c;
        });

        return () => {
            controlsRef.current?.stop();
            controlsRef.current = null;
        };
    }, [tabel, handleScan]);

    useEffect(() => {
        if (scanMode === "battery" && !isScanTabActive) {
            controlsRef.current?.stop();
        }
    }, [scanMode, isScanTabActive]);

    useEffect(() => {
        setIsScanTabActive(true);
        return () => {
            setIsScanTabActive(false);
            setResult("");
            setLastScan(null);
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
                    style={{ width: "auto" , height: "auto" }}
                />
                {result && createPortal(
                    <IonCard
                        style={{
                            position: "fixed",
                            bottom: "calc((var(--ion-tab-bar-height, 40px)) + env(safe-area-inset-bottom))"
                        }}
                    >
                        <IonCardContent>Elevul are masa: {result}</IonCardContent>
                    </IonCard>,
                    document.body
                )}
            </IonContent>
        </IonPage>
    );
};

export default Scan;