import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ScanSettingsContext} from "./SettingsContext";
import {DEFAULT_SETTINGS, loadSettings, saveSettings, Settings} from "../storage/storage";

export const ScanSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isScanTabActive, setIsScanTabActive] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const init = async () => {
            const s = await loadSettings();
            setSettings(s);
            setLoaded(true);
        };

        void init();
    }, []);

    useEffect(() => {
        if (!loaded) return;
        void saveSettings(settings);
    }, [settings, loaded]);

    const updateSetting = useCallback(
        <K extends keyof Settings>(key: K, value: Settings[K]) => {
            setSettings(prev => ({
                ...prev,
                [key]: value
            }));
    }, []);

    const value = useMemo(() => ({
        loaded,
        lowPowerMode: settings.lowPower,
        sound: settings.sound,
        vibration: settings.vibration,
        updateSetting,
        isScanTabActive,
        setIsScanTabActive
    }), [loaded, settings, updateSetting, isScanTabActive]);

    return (
        <ScanSettingsContext.Provider
            value={value}
        >
            {children}
        </ScanSettingsContext.Provider>
    );
};