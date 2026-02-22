import React, { useState } from "react";
import { ScanSettingsContext, ScanMode } from "./SettingsContext";

export const ScanSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [scanMode, setScanMode] = useState<ScanMode>("instant");
    const [isScanTabActive, setIsScanTabActive] = useState(false);

    return (
        <ScanSettingsContext.Provider
            value={{ scanMode, setScanMode, isScanTabActive, setIsScanTabActive }}
        >
            {children}
        </ScanSettingsContext.Provider>
    );
};