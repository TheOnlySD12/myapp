import {
    IonActionSheet,
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
import {createTestData, loadBaseline, loadTabel} from "../storage/storage";
import * as XLSX from "xlsx";

/*const rainbowStyle = {
    background: "linear-gradient(to right, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8F00FF)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
}*/


const Home: React.FC = () => {
    const {scanMode , setScanMode, sunetScanare, setSunetScanare, vibratieScanare, setVibratieScanare} = useScanSettings();
    const { tabel , setTabel , scannedToday, clearScannedForToday} = useTabel();
    const today = [0, 6].includes(new Date().getDay()) ? 1 : new Date().getDay();
    const numarDesertElevi = tabel.filter(elev => elev.flags[0] && elev.flags[today]).length;
    const numarElevi = tabel.filter(elev => elev.flags[today]).length;
    const scanatiAzi = scannedToday.length;
    const [now, setNow] = useState(new Date());
    const [showOptionsSheet, setShowOptionsSheet] = useState(false);
    const [showFormatSheet, setShowFormatSheet] = useState(false);
    const cantinaActiva =
        now.getDay() >= 1 &&
        now.getDay() <= 5 &&
        now.getHours() === 13 &&
        now.getMinutes() <= 25;

    const dayNames = ["Desert", "Luni", "Marți", "Miercuri", "Joi", "Vineri"];


    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 10000);
        return () => clearInterval(id);
    }, []);


    const handleResetTabel = async () => {
        await createTestData();
        const fresh = await loadTabel();
        if (fresh) {
            setTabel(fresh);
        }
    };

    async function getTabelDifferences() {
        const baseline = await loadBaseline();
        const current = tabel;

        if (!baseline || baseline.length !== current.length) {
            return [];
        }

        const differences: {
            name: string;
            class: string;
            changed: {
                dayIndex: number;
                oldValue: boolean;
                newValue: boolean;
            }[];
        }[] = [];

        for (let i = 0; i < baseline.length; i++) {
            const baseRow = baseline[i];
            const currRow = current[i];

            const changedFlags = [];

            for (let j = 0; j < baseRow.flags.length; j++) {
                if (baseRow.flags[j] !== currRow.flags[j]) {
                    changedFlags.push({
                        dayIndex: j,
                        oldValue: baseRow.flags[j],
                        newValue: currRow.flags[j]
                    });
                }
            }

            if (changedFlags.length > 0) {
                differences.push({
                    name: currRow.name,
                    class: currRow.class,
                    changed: changedFlags
                });
            }
        }

        return differences;
    }

    async function exportDifferences(format: "csv" | "xlsx") {
        const diffs = await getTabelDifferences();

        const rows = diffs.flatMap(diff =>
            diff.changed.map(change => ({
                Name: diff.name,
                Class: diff.class,
                Tip: dayNames[change.dayIndex],
                "Valoare veche": change.oldValue ? "Da" : "Nu",
                "Valoare noua": change.newValue ? "Da" : "Nu"
            }))
        );

        const worksheet = XLSX.utils.json_to_sheet(rows);

        let blob: Blob;
        let fileName: string;

        if (format === "csv") {
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            blob = new Blob([csv], { type: "text/csv" });
            fileName = "modificari.csv";
        } else {
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Modificări");

            const arrayBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array"
            });

            blob = new Blob([arrayBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            fileName = "modificari.xlsx";
        }

        const file = new File([blob], fileName, { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: "Modificări",
                    files: [file]
                });
                return;
            } catch (err){
                console.error(err);
            }
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);

    }


    /*
    5. Un card „Ultima actualizare a datelor”
    Dacă datele vin dintr-un fișier sau sunt regenerate:
    - „Ultima actualizare: azi la 12:03”
    - „Sursa: local / server / fișier”
    Ajută operatorul să știe dacă lucrează cu date proaspete.
     */


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
            <IonContent scrollY={true} forceOverscroll={false}>
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
                        <IonCardTitle>Setări</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        <IonList lines="none" >
                            <IonItem>
                                <IonToggle
                                    checked={scanMode === "battery"}
                                    onIonChange={(e) => setScanMode(e.detail.checked ? "battery" : "instant")}
                                >Mod Consum Redus
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
                    <IonButton >Actualizează</IonButton>
                    <IonButton onClick={() => setShowOptionsSheet(true)}>Opțiuni Date</IonButton>
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
                                    <IonBadge color={cantinaActiva ? "success" : "danger"}>{cantinaActiva ? "DESCHISĂ" : "INCHISĂ"}</IonBadge>
                                </IonNote>
                            </IonItem>
                        </IonList>
                    </IonCardContent>
                </IonCard>
                <IonActionSheet
                    isOpen={showOptionsSheet}
                    onDidDismiss={() => setShowOptionsSheet(false)}
                    header="Data Options"
                    buttons={[
                        {
                            text: 'Resetează tabelul',
                            handler: () => void handleResetTabel(),
                        },
                        {
                            text: 'Resetează scanari',
                            handler: () => clearScannedForToday(),
                        },
                        {
                            text: 'Export Date',
                            handler: () => {
                                setShowOptionsSheet(false);
                                setShowFormatSheet(true);
                            },
                        },
                        {
                            text: 'Anulează',
                            role: 'cancel'
                        },
                    ]}
                />
                <IonActionSheet
                    isOpen={showFormatSheet}
                    onDidDismiss={() => setShowFormatSheet(false)}
                    header="Alege formatul"
                    buttons={[
                        {
                            text: "CSV",
                            handler: () => exportDifferences("csv")
                        },
                        {
                            text: "XLSX",
                            handler: () => exportDifferences("xlsx")
                        },
                        {
                            text: "Anulează",
                            role: "cancel"
                        }
                    ]}
                />
            </IonContent>

        </IonPage>
    );
};

export default Home;