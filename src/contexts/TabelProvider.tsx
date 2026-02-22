import React, { useEffect, useState, useCallback } from "react";
import { Elev, loadTabel, saveTabel } from "../storage/storage";
import { TabelContext } from "./TabelContext";
import {IonLoading} from "@ionic/react";

export const TabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tabel, setTabelState] = useState<Elev[]>([]);
    const [loaded, setLoaded] = useState(false);

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

    const setTabel = useCallback((data: Elev[]) => {
        setTabelState(data);
        void saveTabel(data);
    }, []);

    return (
        <>
            <TabelContext.Provider value={{ tabel, setTabel, reload, loaded }}>
                {children}
            </TabelContext.Provider>
            <IonLoading isOpen={!loaded} message="Loading data..." />
        </>
    );
};