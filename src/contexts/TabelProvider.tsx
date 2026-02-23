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

    const reload = useCallback(async () => {
        const data = await loadTabel();
        if (data) {
            setTabelState(data);
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    useEffect(() => {
        const init = async () => {
            const today = new Date().toISOString().slice(0, 10);
            const savedDate = await loadScanDate();
            const savedList = await loadScannedToday();

            if (savedDate !== today) {
                await saveScannedToday([]);
                await saveScanDate(today);
                setScannedTodayState([]);
            } else {
                setScannedTodayState(savedList || []);
            }
        };
        void init();
    }, []);

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
                reload,
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