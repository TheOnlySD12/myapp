import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    IonCard,
    IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent,
    IonHeader, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonViewDidEnter, useIonViewDidLeave
} from "@ionic/react";
import {BrowserQRCodeReader, IScannerControls} from "@zxing/browser";
import {Elev, loadTabel} from "../storage/storage";
import {createPortal} from "react-dom";
import {useScanSettings} from "../Settings";


const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);

    const [result, setResult] = useState<{ name: string, class: string, desert: boolean; azi: boolean } | null>(null);
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [tabel, setTabel] = useState<Elev[]>([]);
    const lastScanRef = useRef<string | null>(null);
    const tabelRef = useRef<Elev[]>([]);

    const { setIsScanTabActive } = useScanSettings();
    const { scanMode, isScanTabActive } = useScanSettings();
    const scanModeRef = useRef(scanMode);
    const isScanTabActiveRef = useRef(isScanTabActive);
    const [loading, setLoading] = useState(true);

    useIonViewDidEnter(() => {
        setIsScanTabActive(true);
    });

    useIonViewDidLeave(() => {
        setIsScanTabActive(false);
        setResult(null);
        setLastScan(null);

        controlsRef.current?.stop();
        controlsRef.current = null;
    });

    useEffect(() => { scanModeRef.current = scanMode; }, [scanMode]);
    useEffect(() => { isScanTabActiveRef.current = isScanTabActive; }, [isScanTabActive]);
    useEffect(() => { lastScanRef.current = lastScan; }, [lastScan]);
    useEffect(() => { tabelRef.current = tabel; }, [tabel]);

    useEffect(() => {
        const loadData = async () => {
            const data = await loadTabel();
            if (data) {
                setTabel(data);
                tabelRef.current = data;
                console.log("Tabel loaded:", data);
            }
            setLoading(false);
        };
        loadData().then(r => r);
    }, []);

    const handleScan = useCallback((text: string) => {
        if (scanModeRef.current === "instant" && !isScanTabActiveRef.current) return;
        if (!tabelRef.current.length) {
            console.log("Scan ignored: data not ready");
            return;
        }
        if (text === lastScanRef.current) return;

        setLastScan(text);
        lastScanRef.current = text;

        const elevFound = tabelRef.current.find(elev => elev.name === text);

        if (elevFound) {
            setResult({ name: elevFound.name, class: elevFound.class, desert: elevFound.flags[0] , azi: elevFound.flags[new Date().getDay()]});
        } else {
            setResult({ name: "Elev", class: "-", desert: false, azi: false});
        }
    },[]);

    useEffect(() => {
        if (loading || !isScanTabActive) return;

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
    }, [handleScan, isScanTabActive, loading, tabel]);
    
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
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "90%",
                            maxWidth: "400px",
                            zIndex: 9999,
                            bottom: "calc((var(--ion-tab-bar-height, 40px)) + env(safe-area-inset-bottom))"
                        }}
                    >
                        <IonCardHeader>
                            <IonCardTitle>{result.name}</IonCardTitle>
                            <IonCardSubtitle>{result.class}</IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <p>Masa: {result.azi ? "Da" : "Nu"}</p>
                            <p>Desert: {result.desert ? "Da" : "Nu"}</p>
                        </IonCardContent>
                    </IonCard>,
                    document.body
                )}
                <IonLoading isOpen={loading} message="Loading data..." />
            </IonContent>
        </IonPage>
    );
};

export default Scan;