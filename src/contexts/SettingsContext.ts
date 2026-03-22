import { createContext, useContext } from "react";
import {Settings} from "../storage/storage";

export interface ScanSettings {
    lowPowerMode: boolean;
    sound: boolean;
    vibration: boolean;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;

    isScanTabActive: boolean;
    setIsScanTabActive: (active: boolean) => void;

    loaded: boolean;
}

export const ScanSettingsContext = createContext<ScanSettings | undefined>(undefined);

export const useScanSettings = () => {
    const ctx = useContext(ScanSettingsContext);
    if (!ctx) throw new Error("useScanSettings must be used inside provider");
    return ctx;
};