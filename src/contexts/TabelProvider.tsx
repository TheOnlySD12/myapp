import React, { useEffect, useState, useCallback } from "react";
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
import {IonAlert, IonLoading} from "@ionic/react";

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

async function fetchFromSheet(): Promise<Elev[]> {
    const res = await fetch("https://sheetdb.io/api/v1/XXXX");

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

    const checkDateAndSync = useCallback(
        async (options?: { forceFetch?: boolean }) => {
            const { forceFetch = false } = options || {};
            const todayStr = getTodayStrRO();

            if (forceFetch) {
                try {
                    const freshData = await fetchFromSheet();
                    await saveTabel(freshData);
                    setTabelState(freshData);
                } catch (e) {
                    console.warn("Force fetch failed", e);
                    setErrorMessage("Actualizarea tabelului a esuat.");
                }
                return;
            }

            const [savedDate, savedTabel] = await Promise.all([
                loadScanDate(),
                loadTabel()
            ]);

            const currentWeek = getWeekStart(todayStr);
            const savedWeek = savedDate ? getWeekStart(savedDate) : null;

            const hasNoData = !savedDate || !savedTabel || savedTabel.length === 0;
            const isNewWeek = savedWeek !== null && currentWeek !== savedWeek;
            const isNewDay = savedDate !== todayStr;

            if (hasNoData || isNewWeek) {
                try {
                    const freshData = await fetchFromSheet();
                    await saveTabel(freshData);
                    setTabelState(freshData);
                } catch (e) {
                    console.warn("Fetch failed, keeping old data", e);
                    setErrorMessage("Actualizarea tabelului a esuat.");
                }

                await saveScannedToday([]);
                setScannedTodayState([]);

                await saveScanDate(todayStr);
                return;
            }

            if (isNewDay) {
                await saveScannedToday([]);
                setScannedTodayState([]);

                await saveScanDate(todayStr);
                return;
            }
        }, []);

    useEffect(() => {
        const init = async () => {
            const data = await loadTabel();
            if (data) setTabelState(data);

            const savedList = await loadScannedToday();
            setScannedTodayState(savedList || []);

            await checkDateAndSync();
            setLoaded(true);
        };

        void init();
    }, [checkDateAndSync]);

    const setTabel = useCallback((data: Elev[]) => {
        setTabelState(data);
        void saveTabel(data);
    }, []);

    const setScannedToday = useCallback((list: string[]) => {
        setScannedTodayState(list);
        void saveScannedToday(list);
    }, []);

    const clearScannedForToday = useCallback(() => {
        setScannedTodayState([]);
        void saveScannedToday([]);
        void saveScanDate(getTodayStrRO());
    }, []);

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

    return (
        <>
            <TabelContext.Provider value={{
                tabel,
                setTabel,
                loaded,
                scannedToday,
                setScannedToday,
                clearScannedForToday,
                checkDateAndSync,
            }}>
                {children}
            </TabelContext.Provider>
            <IonLoading isOpen={!loaded} message="Loading data..." />
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