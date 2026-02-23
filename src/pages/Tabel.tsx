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
import {filterCircle, funnel, pencil} from "ionicons/icons";
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
    const [mode, setMode] = useState<"filter" | "highlight" | "changes" | "unscanned">("highlight");
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

    const filtered = useMemo(() => {
        if (!query) return source;

        if (fuzzy && fuse) {
            return fuse.search(query).map(r => r.item);
        }

        return source.filter(el =>
            el.name.toLowerCase().includes(query)
        );
    }, [query, fuzzy, fuse, source]);

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
            if (!scannedSet.has(row.name)) { //&& row.flags[todayIndex]
                console.log("ass")
                map.set(i, [todayIndex]);
            }
        }

        return map;
    }, [scannedToday, source, todayIndex]);

    const dataToRender = useMemo(() => {
        if (mode === "filter") return filtered;
        if (mode === "changes") {
            return source.filter((_, index) => changesMap.has(index));
        }
        if (mode === "unscanned") {
            return source.filter((_, index) => unscannedMap.has(index));
        }
        return source;
    }, [mode, filtered, source, changesMap, unscannedMap]);

    useEffect(() => {
        if (mode !== "highlight" || !query || filtered.length === 0) {
            setHighlightedIndex(null);
            return;
        }

        const index = source.indexOf(filtered[0]);
        if (index === -1) return;

        setHighlightedIndex(index);

        const timeout = setTimeout(() => {
            setHighlightedIndex(null);
        }, 700);

        return () => clearTimeout(timeout);
    }, [mode, query, filtered, source]);


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
                <IonToolbar style={{ borderBottom: '0.5px solid #262626' }}>
                    <IonTitle>ElfScanner</IonTitle>
                </IonToolbar>
                <IonToolbar>
                    <IonTitle style={{fontSize: "32px"}}>Tabel</IonTitle>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            setMode(prev => {
                                if (prev === "highlight") return "filter";
                                if (prev === "filter") return "changes";
                                if (prev === "changes") return "unscanned";
                                return "highlight";
                            });
                        }}>
                            <IonIcon icon={funnel}/>
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="start">
                        <IonBadge color={mode === "highlight" ? "medium" : mode === "filter" ? "primary" : mode === "changes" ? "warning" : "tertiary"}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </IonBadge>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton onClick={() => {
                            setEdit(e => {
                                if (!e) {
                                    setDraft(
                                        tabel.map(e => ({
                                            ...e,
                                            flags: [...e.flags] as Elev["flags"]
                                        }))
                                    );
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
                {edit && <IonToolbar style={{ borderTop: '0.5px solid #262626' }}>
                    <IonButtons slot="start">
                        <IonButton onClick={() => {
                            if (!draft) return;

                            setTabel(draft);
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
                    {dataToRender.map((elev, rowIndex) => (
                        <TabelRow
                            key={elev.name}
                            elev={elev}
                            rowIndex={rowIndex}
                            edit={edit}
                            highlighted={rowIndex === highlightedIndex}
                            changedFlags={changesMap.get(rowIndex)}
                            onToggle={handleToggle}
                        />
                    ))}
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default Tabel;