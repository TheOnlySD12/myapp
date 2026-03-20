import { createContext, useContext } from "react";

export interface ScanSettings {
    lowPowerMode: boolean;
    setLowPowerMode: (lowPower: boolean) => void;

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