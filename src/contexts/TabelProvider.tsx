import React, {useEffect, useState, useCallback, useMemo} from "react";
import {
    Elev,
    loadScanDate,
    loadScannedToday,
    loadTabel,
    saveScanDate,
    saveScannedToday,
    saveTabel
} from "../storage/storage";
import { TabelContext } from "./TabelContext";
import {IonAlert} from "@ionic/react";
import {useScanSettings} from "./SettingsContext";

const coloane = {
    name: "Vă rugăm să alegeți din listă numele elevului:",
    class: "Alegeți clasa din care faceți parte:",
    menu: "Selectați tipul de meniu preferat:",
    luni: "Selectați zilele în care doriți servirea mesei: [Luni]",
    marti: "Selectați zilele în care doriți servirea mesei: [Marți]",
    miercuri: "Selectați zilele în care doriți servirea mesei: [Miercuri]",
    joi: "Selectați zilele în care doriți servirea mesei: [Joi]",
    vineri: "Selectați zilele în care doriți servirea mesei: [Vineri]",
};

function getWeekStart(input: Date | string): number {
    let d: Date;

    if (typeof input === "string") {
        const [y, m, day] = input.split("-").map(Number);
        d = new Date(y, m - 1, day);
    } else {
        d = new Date(input);
    }

    const dayOfWeek = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dayOfWeek);
    d.setHours(0, 0, 0, 0);

    return d.getTime();
}

function getTodayStrRO(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

async function fetchFromSheet(source: string): Promise<Elev[]> {
    const res = await fetch(source);

    console.log("final URL:", res.url);
    console.log("content-type:", res.headers.get("content-type"));

    const text = await res.text();
    console.log(text.slice(0, 200));

    console.log(source);

    if (!res.ok) throw new Error("Failed to fetch");

    const data: Record<string, string>[] = await res.json();

    return data.map(row => ({
        name: row[coloane.name] || "",
        class: row[coloane.class] || "",
        flags: [
            row[coloane.menu]?.includes("1") ?? false, // desert
            row[coloane.luni] === "Da",
            row[coloane.marti] === "Da",
            row[coloane.miercuri] === "Da",
            row[coloane.joi] === "Da",
            row[coloane.vineri] === "Da",
        ] as [boolean, boolean, boolean, boolean, boolean, boolean],
    }));
}

export const TabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tabel, setTabelState] = useState<Elev[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [scannedToday, setScannedTodayState] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {source} = useScanSettings();

    const setTabel = useCallback((data: Elev[]) => {
        setTabelState(data);
        void saveTabel(data);
    }, []);

    const setScannedToday = useCallback((list: string[]) => {
        setScannedTodayState(list);
        void saveScannedToday(list);
    }, []);

    const clearScannedForToday = useCallback(() => { //curata pentru azi nu de azi
        setScannedTodayState([]);
        void saveScannedToday([]);
        void saveScanDate(getTodayStrRO());
    }, []);

    const checkDateAndSync = useCallback(
        async (options?: { forceFetch?: boolean }) => {
            const { forceFetch = false } = options || {};
            const todayStr = getTodayStrRO();

            if (forceFetch) {
                try {
                    const freshData = await fetchFromSheet(source);
                    setTabel(freshData)
                } catch (e) {
                    console.warn("Fetch failed, keeping old data", e);
                    setErrorMessage("Actualizarea tabelului a esuat.");
                }
                return;
            }

            const [savedDate, savedTabel] = await Promise.all([loadScanDate(), loadTabel()]);

            const hasNoData = !savedDate || !savedTabel || savedTabel.length === 0;

            if (hasNoData || getWeekStart(todayStr) !== getWeekStart(savedDate)) {
                try {
                    const freshData = await fetchFromSheet(source);
                    setTabel(freshData)
                } catch (e) {
                    console.warn("Fetch failed, keeping old data", e);
                    setErrorMessage("Actualizarea tabelului a esuat.");
                }

                clearScannedForToday();
                return;
            }

            if (savedDate !== todayStr) {
                clearScannedForToday();
                return;
            }
        }, [clearScannedForToday, setTabel, source]);

    useEffect(() => {
        const init = async () => {
            const [data, scanned] = await Promise.all([loadTabel(), loadScannedToday()]);
            setTabelState(data || []);
            setScannedTodayState(scanned || []);
            await checkDateAndSync();
            setLoaded(true);
        };

        void init();
    }, [checkDateAndSync]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                void checkDateAndSync();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [checkDateAndSync]);

    const value = useMemo(() => ({
        tabel,
        setTabel,
        loaded,
        scannedToday,
        setScannedToday,
        clearScannedForToday,
        checkDateAndSync,
    }), [tabel, setTabel, loaded, scannedToday, setScannedToday, clearScannedForToday, checkDateAndSync]);

    return (
        <>
            <TabelContext.Provider value={value}>
                {children}
            </TabelContext.Provider>
            <IonAlert
                isOpen={!!errorMessage}
                onDidDismiss={() => setErrorMessage(null)}
                header="Eroare"
                message={errorMessage || ""}
                buttons={["OK"]}
            />
        </>
    );
};