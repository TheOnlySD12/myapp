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
import {IonLoading} from "@ionic/react";

export const TabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tabel, setTabelState] = useState<Elev[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [scannedToday, setScannedTodayState] = useState<string[]>([]);

    function getWeekNumber(dateStr: string): number {
        const d = new Date(dateStr);
        const firstDay = new Date(d.getFullYear(), 0, 1);
        const pastDays = (d.getTime() - firstDay.getTime()) / 86400000;  // de verificat sistem
        return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    }

    async function fetchFromSheet(): Promise<Elev[]> {
        const res = await fetch("https://sheetdb.io/api/v1/XXXX");
        const data = await res.json();

        return data.map((row: any) => ({
            name: row.name,
            class: row.class,
            flags: [
                row.flag1 === "TRUE",
                row.flag2 === "TRUE",
                row.flag3 === "TRUE", //de gandit pe baza sheetului
                row.flag4 === "TRUE",
                row.flag5 === "TRUE",
                row.flag6 === "TRUE",
            ]
        }));
    }

    const checkDateAndSync = useCallback(async () => {
        const today = new Date().toISOString().slice(0, 10);
        const savedDate = await loadScanDate();

        const currentWeek = getWeekNumber(today);
        const savedWeek = savedDate ? getWeekNumber(savedDate) : null;

        //first run
        if (!savedDate) {
            await saveScanDate(today);
            return;
        }

        if (currentWeek !== savedWeek) {
            try {
                const freshData = await fetchFromSheet(); // or skip if offline
                setTabelState(freshData);
                await saveTabel(freshData);
            } catch (e) {
                console.warn("Failed to fetch new weekly data", e);
            }

            await saveScannedToday([]);
            setScannedTodayState([]);
            await saveScanDate(today);
            return;
        }

        if (savedDate !== today) {
            await saveScannedToday([]);
            setScannedTodayState([]);
            await saveScanDate(today);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const data = await loadTabel();
            if (data) setTabelState(data);

            const savedList = await loadScannedToday();
            setScannedTodayState(savedList || []);

            await checkDateAndSync(); // centralized logic
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
        const today = new Date().toISOString().slice(0, 10);
        setScannedTodayState([]);
        void saveScannedToday([]);
        void saveScanDate(today);
    }, []);

    return (
        <>
            <TabelContext.Provider value={{
                tabel,
                setTabel,
                loaded,
                scannedToday,
                setScannedToday,
                clearScannedForToday
            }}>
                {children}
            </TabelContext.Provider>
            <IonLoading isOpen={!loaded} message="Loading data..." />
        </>
    );
};