import React, { useState } from "react";
import { ScanSettingsContext, ScanMode } from "./SettingsContext";

export const ScanSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [scanMode, setScanMode] = useState<ScanMode>("instant");
    const [isScanTabActive, setIsScanTabActive] = useState(false);
    const [sunetScanare, setSunetScanare] = useState(false);
    const [vibratieScanare, setVibratieScanare] = useState(false);

    return (
        <ScanSettingsContext.Provider
            value={{ scanMode, setScanMode, sunetScanare, setSunetScanare, vibratieScanare, setVibratieScanare,isScanTabActive, setIsScanTabActive }}
        >
            {children}
        </ScanSettingsContext.Provider>
    );
};