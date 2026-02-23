import { createContext, useContext } from "react";
import { Elev } from "../storage/storage";

export type TabelContextType = {
    tabel: Elev[];
    setTabel: (data: Elev[]) => void;
    reload: () => Promise<void>;
    loaded: boolean;

    scannedToday: string[]; // list of names scanned today
    setScannedToday: (list: string[]) => void;
    clearScannedForToday: () => void;
};

export const TabelContext = createContext<TabelContextType | undefined>(
    undefined
);

export function useTabel(): TabelContextType {
    const context = useContext(TabelContext);
    if (!context) {
        throw new Error("useTabel must be used inside TabelProvider");
    }
    return context;
}