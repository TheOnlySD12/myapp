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
import {Elev, loadBaseline} from "../storage/storage";
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
    onToggle: (elev: Elev, colIndex: number) => void;
};

const TabelRow = React.memo(
    ({ elev, edit, highlighted, changedFlags, onToggle }: RowProps) => {

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
                                onToggle(elev, colIndex);
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
    const { tabel, setTabel, scannedToday} = useTabel();
    const [draft, setDraft] = useState<Elev[] | null>(null);
    const [mode, setMode] = useState<"highlight" | "filter">("highlight");
    const [view, setView] = useState<"all" | "changes" | "unscanned">("all")
    const [fuzzy, setFuzzy] = useState(false);
    const [edit, setEdit] = useState(false);
    const [query, setQuery] = useState("");
    const contentRef = useRef<HTMLIonContentElement | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [baseline, setBaseline] = useState<Elev[] | null>(null);

    const source = edit && draft ? draft : tabel;

    useEffect(() => {
        loadBaseline().then(setBaseline);
    }, []);

    const todayIndex = useMemo(() => {
        return new Date().getDay();
    }, []);

    const fuse = useMemo(() => {
        if (!source.length) return null;
        return new Fuse(source, {
            keys: ["name"],
            threshold: 0.4,
            ignoreLocation: true,
        });
    }, [source]);

    const changesMap = useMemo(() => {
        if (!baseline || baseline.length !== source.length)
            return new Map();

        const map = new Map<number, number[]>();

        for (let i = 0; i < baseline.length; i++) {
            const changedCols = baseline[i].flags.reduce<number[]>(
                (acc, flag, j) => {
                    if (flag !== source[i].flags[j]) acc.push(j);
                    return acc;
                },
                []
            );

            if (changedCols.length) {
                map.set(i, changedCols);
            }
        }

        return map;
    }, [baseline, source]);

    const unscannedMap = useMemo(() => {
        if (!scannedToday) return new Map<number, number[]>();

        const scannedSet = new Set(scannedToday);
        const map = new Map<number, number[]>();

        for (let i = 0; i < source.length; i++) {
            const row = source[i];
            if (row.flags[todayIndex] && !scannedSet.has(row.name)) {
                map.set(i, [todayIndex]);
            }
        }

        return map;
    }, [scannedToday, source, todayIndex]);

    const { viewMode, viewSet } = useMemo(() => {
        const filtered = (() => {
            if (view === "changes") return source.filter((_, i) => changesMap.has(i));
            if (view === "unscanned") return source.filter((_, i) => unscannedMap.has(i));
            return source;
        })();

        const set = new Set(filtered);

        return { viewMode: filtered, viewSet: set };
    }, [source, view, changesMap, unscannedMap]);

    const visibleData = useMemo(() => {
        if (!query) return viewMode;

        if (mode === "filter") {
            if (fuzzy && fuse) {
                return fuse.search(query).map(r => r.item).filter(el => viewSet.has(el));
            }

            return viewMode.filter(el =>
                el.name.toLowerCase().includes(query)
            );
        }

        return viewMode;
    }, [query, viewMode, mode, fuzzy, fuse, viewSet]);

    const firstMatchIndex = useMemo(() => {
        if (!query || mode !== "highlight") return null;

        const lowerQuery = query.toLowerCase();

        if (fuzzy && fuse) {
            const results = fuse.search(lowerQuery);
            if (results.length === 0) return null;
            return visibleData.findIndex(el => el === results[0].item);
        }

        // Normal search
        return visibleData.findIndex(el => el.name.toLowerCase().includes(lowerQuery));
    }, [query, mode, fuzzy, fuse, visibleData]);

    useEffect(() => {
        setHighlightedIndex(firstMatchIndex);

        if (firstMatchIndex !== null) {
            const timeout = setTimeout(() => setHighlightedIndex(null), 700);
            return () => clearTimeout(timeout);
        }
    }, [firstMatchIndex]);

    const handleToggle = useCallback((elev: Elev, colIndex: number) => {
        setDraft(prev => {
            if (!prev) return prev;

            const index = prev.indexOf(elev);
            if (index === -1) return prev;

            const copy = [...prev];

            const updatedRow = {
                ...copy[index],
                flags: [...copy[index].flags] as Elev["flags"]
            };

            updatedRow.flags[colIndex] = !updatedRow.flags[colIndex];
            copy[index] = updatedRow;

            return copy;
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
                        <IonButton color={mode === "highlight" ? "primary" : "medium"} onClick={() => {
                            setMode(mode === "highlight" ? "filter" : "highlight");
                        }}>
                            <IonIcon icon={colorWand}/>
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="start">
                        <IonBadge color={view === "all" ? "medium" : view === "changes" ? "warning" : "tertiary"} onClick={() => {
                            setView(view === "all" ? "changes" : view === "changes" ? "unscanned" : "all");
                        }}>
                            {view === "all" ? "Toti" : view === "changes" ? "Schimbari" : "Nescanati"}
                        </IonBadge>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton onClick={() => {
                            setEdit(e => {
                                if (!e) {
                                    setDraft(prev => prev ?? [...tabel]);
                                } else {
                                    setDraft(null);
                                }
                                return !e;
                            });
                        }}>
                            <IonIcon icon={pencil} color={edit ? "primary" : "medium"}/>
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton onClick={() => {
                            setFuzzy(f => !f);
                        }}>
                            <IonIcon icon={filterCircle} color={fuzzy ? "primary" : "medium"}/>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                <IonToolbar>
                    <IonSearchbar animated={true} placeholder={"Elev"} onIonInput={(e) => {
                        const value = (e.target as HTMLIonSearchbarElement).value ?? "";
                        setQuery(value.toLowerCase());
                    }}></IonSearchbar>
                </IonToolbar>
                {edit && <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            if (!draft) return;

                            const newTabel = draft!.map((row, i) =>
                                row.flags === tabel[i].flags ? tabel[i] : row
                            );
                            setTabel(newTabel);
                            setDraft(null);
                            setEdit(false);
                        }}>Save</IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton
                            onClick={() => {
                                setDraft(null);
                                setEdit(false);
                            }}
                        >Discard
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
                }
            </IonHeader>
            <IonContent ref={contentRef} forceOverscroll={true}>
                <IonGrid>
                    <IonRow style={{ fontWeight: "bold" }}>
                        <IonCol size="3.2" style={col}>Nume</IonCol>
                        <IonCol size="1.6" style={col}>Clasa</IonCol>
                        {days.map((z, i) => (
                            <IonCol size="1.2" key={i} style={col}>
                                <div className="ion-hide-sm-down">{z.full}</div>
                                <div className="ion-hide-md-up">{z.short}</div>
                            </IonCol>
                        ))}
                    </IonRow>
                    {visibleData.map((elev, rowIndex) => (
                        <TabelRow
                            key={elev.name}
                            elev={elev}
                            rowIndex={rowIndex}
                            edit={edit}
                            highlighted={highlightedIndex !== null && elev === visibleData[highlightedIndex]}
                            changedFlags={changesMap.get(source.indexOf(elev))}
                            onToggle={handleToggle}
                        />
                    ))}
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Tabel;