import React, {useEffect, useState} from "react";
import { ScanSettingsContext} from "./SettingsContext";
import {loadSettings, saveSettings, Settings} from "../storage/storage";

export const ScanSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isScanTabActive, setIsScanTabActive] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        low_power: false,
        sunet: true,
        vibratie: true
    });

    useEffect(() => {
        const init = async () => {
            const s = await loadSettings();
            setSettings(s);
        };

        void init();
    }, []);

    useEffect(() => {
        void saveSettings(settings);
    }, [settings]);

    function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    }

    const setLowPowerMode = (value: boolean) => {
        updateSetting("low_power", value);
    };

    const setSunetScanare = (value: boolean) => {
        updateSetting("sunet", value);
    };

    const setVibratieScanare = (value: boolean) => {
        updateSetting("vibratie", value);
    };


    return (
        <ScanSettingsContext.Provider
            value={{ lowPowerMode: settings.low_power, setLowPowerMode, sunetScanare: settings.sunet, setSunetScanare, vibratieScanare: settings.vibratie, setVibratieScanare, isScanTabActive, setIsScanTabActive }}
        >
            {children}
        </ScanSettingsContext.Provider>
    );
};