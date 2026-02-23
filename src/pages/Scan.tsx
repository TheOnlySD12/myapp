import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonContent,
    IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonNote,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonViewDidEnter, useIonViewDidLeave
} from "@ionic/react";
import {BrowserQRCodeReader, IScannerControls} from "@zxing/browser";
import {Elev} from "../storage/storage";
import {createPortal} from "react-dom";
import {addCircleOutline, checkmarkDoneCircle, refresh} from "ionicons/icons";
import {useScanSettings} from "../contexts/SettingsContext";
import {useTabel} from "../contexts/TabelContext";


function HistoryModal({list}: { list : string[] }) {
    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Istoric</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    {list.map((elev, index) => (
                        <IonItem key={index}>
                            <IonLabel>
                                {elev}
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </>
    );
}


const Scan: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);

    const [result, setResult] = useState<{ name: string, class: string, repetat: boolean,desert: boolean; azi: boolean } | null>(null);
    const lastScanListRef = useRef<string[]>([]);
    const lastScanRef = useRef<string | null>(null);
    const { tabel, setTabel, loaded, scannedToday, setScannedToday , clearScannedForToday} = useTabel();

    const { setIsScanTabActive, scanMode, isScanTabActive } = useScanSettings();
    const scanModeRef = useRef(scanMode);
    const isScanTabActiveRef = useRef(isScanTabActive);
    const [showHistory, setShowHistory] = useState(false);
    const [ignoreFinish, setIgnoreFinish] = useState(false);
    const showDone = !(tabel.length - scannedToday.length) && !ignoreFinish;

    useIonViewDidEnter(() => {
        setIsScanTabActive(true);
    });

    useIonViewDidLeave(() => {
        setIsScanTabActive(false);
        setResult(null);
        lastScanRef.current = null;

        if(scanModeRef.current == "battery"){
            controlsRef.current?.stop();
            controlsRef.current = null;
        }
    });

    useEffect(() => { scanModeRef.current = scanMode; }, [scanMode]);
    useEffect(() => { isScanTabActiveRef.current = isScanTabActive; }, [isScanTabActive]);

    useEffect(() => {
        lastScanListRef.current = scannedToday || [];
    }, [scannedToday]);

    const handleScan = useCallback(async (text: string) => {
        if (!isScanTabActiveRef.current) return;
        if (!tabel.length) return;
        if (lastScanRef.current === text) return;

        lastScanRef.current = text;
        const alreadyScanned = lastScanListRef.current.includes(text);
        const elevFound = tabel.find(elev => elev.name === text);

        if(elevFound){
            if(!alreadyScanned){
                const updatedList = [...lastScanListRef.current, text]
                lastScanListRef.current = updatedList;
                setScannedToday(updatedList);
            }
            setResult({
                name: elevFound.name,
                class: elevFound.class,
                repetat: alreadyScanned,
                desert: elevFound.flags[0] ,
                azi: elevFound.flags[new Date().getDay()]
            });
        } else {
            setResult({
                name: "Elev fara masa",
                class: "-",
                repetat: false,
                desert: false,
                azi: false
            });
        }
    },[setScannedToday, tabel]);

    useEffect(() => {
        if (!loaded || !isScanTabActive || controlsRef.current) return;

        const reader = new BrowserQRCodeReader();

        reader.decodeFromVideoDevice(
            undefined,
            videoRef.current || undefined,
            result => {
                if (result) void handleScan(result.getText());
            }
        ).then(c => {
            controlsRef.current = c;
        });
    }, [handleScan, isScanTabActive, loaded]);

    useEffect(() => {
        if (!isScanTabActive && scanModeRef.current === "battery") {
            controlsRef.current?.stop();
            controlsRef.current = null;
        }
    }, [isScanTabActive, scanMode]);


    async function updateFlag(name: string) {
        const index = tabel.findIndex(e => e.name === name);
        if (index === -1) return;

        const updated = [...tabel];

        const row: Elev = {
            ...updated[index],
            flags: [...updated[index].flags] as Elev["flags"]
        };

        row.flags[new Date().getDay()] = true;
        updated[index] = row;

        setTabel(updated);
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar style={{ borderBottom: '0.5px solid #262626' }}>
                    <IonTitle>ElfScanner</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonTitle style={{fontSize: "32px"}}>Scan</IonTitle>
                    <IonButtons slot="start">
                        <IonButton
                            onClick={async () => {
                                lastScanListRef.current = [];
                                clearScannedForToday();
                                lastScanRef.current = null;
                                setResult(null);
                            }}
                        >
                            <IonIcon size="large" icon={refresh}/>
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonBadge onClick={() => setShowHistory(true)} style={{fontSize: "20px"}}>
                            {tabel.length - scannedToday.length}
                        </IonBadge>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent scrollY={false} forceOverscroll={false}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    controls={false}
                    style={{ width: "auto" , height: "auto", pointerEvents: "none"}}
                />
                {result && createPortal(
                    <IonCard
                        style={{
                            position: "fixed",
                            width: "90%",
                            bottom: "calc((var(--ion-tab-bar-height, 40px)) + env(safe-area-inset-bottom))"
                        }}
                    >
                        <IonCardHeader>
                            {result.repetat && (
                                <IonIcon
                                    icon={checkmarkDoneCircle}
                                    color="medium"
                                    size="large"
                                    style={{ position: "absolute", top: 8, right: 8 }}
                                />
                            )}
                            {!result.azi && result.class !== "-" && (
                                <IonButton size={"small"} style={{ position: "absolute", top: 6, right: result.repetat ? "48px" : "8px"}}
                                           onClick={async () => {await updateFlag(result.name);
                                }}>
                                    <IonIcon icon={addCircleOutline}></IonIcon>
                                </IonButton>
                            )}
                            <IonCardTitle>{result.name}</IonCardTitle>
                            <IonCardSubtitle>{result.class}</IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonItem lines="none">
                                <IonLabel>Masa</IonLabel>
                                <IonNote slot="end" color={result.azi ? "success" : "medium"}>
                                    {result.azi ? "Da" : "Nu"}
                                </IonNote>
                            </IonItem>

                            <IonItem lines="none">
                                <IonLabel>Desert</IonLabel>
                                <IonNote slot="end" color={result.desert ? "success" : "medium"}>
                                    {result.desert ? "Da" : "Nu"}
                                </IonNote>
                            </IonItem>
                        </IonCardContent>
                    </IonCard>,
                    document.body
                )}
                {showDone && createPortal(
                    <IonCard
                        style={{
                            position: "fixed",
                            width: "90%",
                            bottom: "calc((var(--ion-tab-bar-height, 40px)) + env(safe-area-inset-bottom))"
                        }}
                    >
                        <IonCardHeader>
                            <IonCardTitle>Succes! Gata pe azi.</IonCardTitle>
                            <IonCardSubtitle>data de azi</IonCardSubtitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonButton onClick={() => setIgnoreFinish(true)}>Close</IonButton>
                        </IonCardContent>
                    </IonCard>,
                    document.body
                )}
            </IonContent>
            <IonModal
                isOpen={showHistory}
                onWillPresent={() => {setIsScanTabActive(false); setResult(null); lastScanRef.current = null;}}
                onWillDismiss={() => {setIsScanTabActive(true); setShowHistory(false)}}
                breakpoints={[0, 0.25,0.5, 0.75,1]}
                initialBreakpoint={0.25}
                expandToScroll={false}
            >
                <HistoryModal list={scannedToday} />
            </IonModal>
        </IonPage>
    );
};

export default Scan;