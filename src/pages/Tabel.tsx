import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    IonBadge, IonButton, IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader, IonIcon,
    IonPage,
    IonRow,
    IonSearchbar,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {Elev} from "../storage/storage";
import {colorWand, filterCircle, pencil} from "ionicons/icons";
import Fuse from "fuse.js";
import {useTabel} from "../contexts/TabelContext";

const col: React.CSSProperties = {
    padding: "2px",
};

const days = [
    { full: "Desert", short: "De" },
    { full: "Luni", short: "L" },
    { full: "Marți", short: "Ma" },
    { full: "Miercuri", short: "Mi" },
    { full: "Joi", short: "J" },
    { full: "Vineri", short: "V" }
];

type RowProps = {
    elev: Elev;
    rowIndex: number;
    edit: boolean;
    highlighted: boolean;
    changedFlags?: number[];
    onToggle: (rowIndex: number, colIndex: number) => void;
};

const TabelRow = React.memo(
    ({ elev, edit, highlighted, changedFlags, onToggle, rowIndex}: RowProps) => {

        const rowRef = useRef<HTMLIonRowElement | null>(null);

        useEffect(() => {
            if (highlighted && rowRef.current) {
                rowRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, [highlighted]);

        return (
            <IonRow
                ref={rowRef}
                style={{
                    backgroundColor: highlighted ? "yellow" : "",
                    transition: "background-color 0.3s ease"
                }}
            >
                <IonCol size="3.2" style={{ ... col,overflow: "hidden", whiteSpace: "nowrap" }}>
                    {elev.name}
                </IonCol>

                <IonCol size="1.6" style={col}>
                    {elev.class}
                </IonCol>

                {elev.flags.map((flag, colIndex) => (
                    <IonCol size="1.2" key={colIndex} style={col}>
                        <IonBadge
                            onClick={() => {
                                if (!edit) return;
                                onToggle(rowIndex, colIndex);
                            }}
                            color={
                                changedFlags?.includes(colIndex)
                                    ? "warning"
                                    : flag
                                        ? "success"
                                        : "medium"
                            }
                        >
                            {flag ? "Da" : "Nu"}
                        </IonBadge>
                    </IonCol>
                ))}
            </IonRow>
        );
    }
);


const Tabel: React.FC = () => {
    const { tabel, setTabel, scannedToday } = useTabel();

    const [draft, setDraft] = useState<Elev[] | null>(null);
    const [mode, setMode] = useState<"highlight" | "filter">("highlight");
    const [view, setView] = useState<"all" | "changes" | "unscanned">("all");
    const [fuzzy, setFuzzy] = useState(false);
    const [edit, setEdit] = useState(false);
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [changesMap, setChangesMap] = useState<Map<number, Set<number>>>(new Map());

    const source = edit && draft ? draft : tabel;

    const todayIndex = useMemo(() => new Date().getDay(), []);

    const fuse = useMemo(() => {
        if (!source.length) return null;
        return new Fuse(source, {
            keys: ["name"],
            threshold: 0.4,
            ignoreLocation: true,
        });
    }, [source]);

    // 🔥 Map name → original index in source
    const originalIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        source.forEach((el, i) => map.set(el.name, i));
        return map;
    }, [source]);

    // Unscanned rows
    const unscannedMap = useMemo(() => {
        if (!scannedToday) return new Map<number, number[]>();

        const scannedSet = new Set(scannedToday);
        const map = new Map<number, number[]>();

        source.forEach((row, i) => {
            if (row.flags[todayIndex] && !scannedSet.has(row.name)) {
                map.set(i, [todayIndex]);
            }
        });

        return map;
    }, [scannedToday, source, todayIndex]);

    // Apply view mode
    const { viewMode, viewSet } = useMemo(() => {
        const filtered = (() => {
            if (view === "changes") return source.filter((_, i) => changesMap.has(i));
            if (view === "unscanned") return source.filter((_, i) => unscannedMap.has(i));
            return source;
        })();

        return { viewMode: filtered, viewSet: new Set(filtered) };
    }, [source, view, changesMap, unscannedMap]);

    // Apply search
    const visibleData = useMemo(() => {
        if (!query) return viewMode;

        if (mode === "filter") {
            if (fuzzy && fuse) {
                return fuse.search(query).map(r => r.item).filter(el => viewSet.has(el));
            }
            return viewMode.filter(el => el.name.toLowerCase().includes(query));
        }

        return viewMode;
    }, [query, viewMode, mode, fuzzy, fuse, viewSet]);

    // Find first match for highlight mode
    const firstMatchIndex = useMemo(() => {
        if (!query || mode !== "highlight") return null;

        const lower = query.toLowerCase();

        // Normal search (fuse OFF)
        if (!fuzzy) {
            const matches = visibleData
                .map(el => ({
                    el,
                    pos: el.name.toLowerCase().indexOf(lower)
                }))
                .filter(x => x.pos !== -1)
                .sort((a, b) => a.pos - b.pos || a.el.name.length - b.el.name.length);
            // earlier match wins; if equal, shorter name wins

            if (matches.length === 0) return null;

            return originalIndexMap.get(matches[0].el.name) ?? null;
        }

        // Fuzzy search (fuse ON)
        if (fuse) {
            const results = fuse.search(lower);

            const match = results.find(r =>
                visibleData.some(el => el.name === r.item.name)
            );

            return match ? originalIndexMap.get(match.item.name) ?? null : null;
        }

        return null;
    }, [query, mode, fuzzy, fuse, visibleData, originalIndexMap]);

    // Highlight effect
    useEffect(() => {
        setHighlightedIndex(firstMatchIndex);
        if (firstMatchIndex !== null) {
            const timeout = setTimeout(() => setHighlightedIndex(null), 700);
            return () => clearTimeout(timeout);
        }
    }, [firstMatchIndex]);

    // Toggle a flag
    const handleToggle = useCallback((originalIndex: number, colIndex: number) => {
        setDraft(prev => {
            if (!prev) return prev;

            const copy = [...prev];

            // Clone row and flags while preserving tuple type
            const row = {
                ...copy[originalIndex],
                flags: [...copy[originalIndex].flags] as Elev["flags"]
            };

            row.flags[colIndex] = !row.flags[colIndex];
            copy[originalIndex] = row;

            return copy;
        });

        setChangesMap(prev => {
            const map = new Map(prev);
            const set = new Set(map.get(originalIndex) ?? []);

            if (set.has(colIndex)) set.delete(colIndex);
            else set.add(colIndex);

            if (set.size === 0) map.delete(originalIndex);
            else map.set(originalIndex, set);

            return map;
        });
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="spacer">
                    <IonTitle>ElfScanner</IonTitle>
                </IonToolbar>

                <IonToolbar>
                    <IonTitle className="main-title">Tabel</IonTitle>

                    <IonButtons slot="start">
                        <IonButton
                            color={mode === "highlight" ? "primary" : "medium"}
                            onClick={() => setMode(m => (m === "highlight" ? "filter" : "highlight"))}
                        >
                            <IonIcon icon={colorWand} />
                        </IonButton>
                    </IonButtons>

                    <IonButtons slot="start">
                        <IonBadge
                            color={view === "all" ? "medium" : view === "changes" ? "warning" : "tertiary"}
                            onClick={() =>
                                setView(v => (v === "all" ? "changes" : v === "changes" ? "unscanned" : "all"))
                            }
                        >
                            {view === "all" ? "Toti" : view === "changes" ? "Schimbari" : "Nescanati"}
                        </IonBadge>
                    </IonButtons>

                    <IonButtons slot="end">
                        <IonButton
                            onClick={() =>
                                setEdit(e => {
                                    if (!e) setDraft(prev => prev ?? [...tabel]);
                                    else setDraft(null);
                                    return !e;
                                })
                            }
                        >
                            <IonIcon icon={pencil} color={edit ? "primary" : "medium"} />
                        </IonButton>
                    </IonButtons>

                    <IonButtons slot="end">
                        <IonButton onClick={() => setFuzzy(f => !f)}>
                            <IonIcon icon={filterCircle} color={fuzzy ? "primary" : "medium"} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>

                <IonToolbar>
                    <IonSearchbar
                        animated
                        placeholder="Elev"
                        onIonInput={e => setQuery((e.detail.value ?? "").toLowerCase())}
                    />
                </IonToolbar>

                {edit && (
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton
                                onClick={() => {
                                    if (draft) {
                                        const newTabel = draft.map((row, i) =>
                                            changesMap.has(i) ? row : tabel[i]
                                        );
                                        setTabel(newTabel);
                                        setDraft(null);
                                        setChangesMap(new Map());
                                        setEdit(false);
                                    }
                                }}
                            >
                                Save
                            </IonButton>
                        </IonButtons>

                        <IonButtons slot="end">
                            <IonButton
                                onClick={() => {
                                    setDraft(null);
                                    setChangesMap(new Map());
                                    setEdit(false);
                                }}
                            >
                                Discard
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                )}
            </IonHeader>

            <IonContent>
                <IonGrid>
                    <IonRow style={{ fontWeight: "bold" }}>
                        <IonCol size="3.2">Nume</IonCol>
                        <IonCol size="1.6">Clasa</IonCol>
                        {days.map((z, i) => (
                            <IonCol size="1.2" key={i}>
                                <div className="ion-hide-sm-down">{z.full}</div>
                                <div className="ion-hide-md-up">{z.short}</div>
                            </IonCol>
                        ))}
                    </IonRow>

                    {visibleData.map(elev => {
                        const originalIndex = originalIndexMap.get(elev.name)!;

                        return (
                            <TabelRow
                                key={elev.name}
                                elev={elev}
                                rowIndex={originalIndex}
                                edit={edit}
                                highlighted={highlightedIndex === originalIndex}
                                changedFlags={
                                    changesMap.get(originalIndex) &&
                                    [...changesMap.get(originalIndex)!]
                                }
                                onToggle={handleToggle}
                            />
                        );
                    })}
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Tabel;