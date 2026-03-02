import { createContext, useContext } from "react";

export type ScanMode = "battery" | "instant";

export interface ScanSettings {
    scanMode: ScanMode;
    setScanMode: (mode: ScanMode) => void;

    sunetScanare: boolean;
    setSunetScanare: (sunet: boolean) => void;

    vibratieScanare: boolean;
    setVibratieScanare: (vibratie: boolean) => void;

    isScanTabActive: boolean;
    setIsScanTabActive: (active: boolean) => void;
}

export const ScanSettingsContext = createContext<ScanSettings | undefined>(undefined);

export const useScanSettings = () => {
    const ctx = useContext(ScanSettingsContext);
    if (!ctx) throw new Error("useScanSettings must be used inside provider");
    return ctx;
};