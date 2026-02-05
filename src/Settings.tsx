import React, { createContext, useContext, useState } from "react";

type ScanMode = "battery" | "instant";

interface ScanSettings {
    scanMode: ScanMode;
    setScanMode: (mode: ScanMode) => void;
    isScanTabActive: boolean;
    setIsScanTabActive: (active: boolean) => void;
}

const ScanSettingsContext = createContext<ScanSettings | null>(null);

export const ScanSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [scanMode, setScanMode] = useState<ScanMode>("battery");
    const [isScanTabActive, setIsScanTabActive] = useState(false);

    return (
        <ScanSettingsContext.Provider value={{ scanMode, setScanMode, isScanTabActive, setIsScanTabActive }}>
            {children}
        </ScanSettingsContext.Provider>
    );
};

export const useScanSettings = () => {
    const ctx = useContext(ScanSettingsContext);
    if (!ctx) throw new Error("useScanSettings must be used inside provider");
    return ctx;
};