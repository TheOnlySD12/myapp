import { Storage } from '@ionic/storage';

export type Elev = {
    name: string;
    class: string;
    flags: [boolean, boolean, boolean, boolean, boolean, boolean]; //6
};

let store: Storage | null = null;

async function getStore(): Promise<Storage> {
    if (!store) {
        store = new Storage();
        await store.create();
    }
    return store;
}

export async function saveTabel(x: Elev[]): Promise<void> {
    const s = await getStore();
    await s.set('tabel', x);
}

export async function loadTabel(): Promise<Elev[] | null> {
    const s = await getStore();
    return await s.get('tabel');
}

export async function saveBaseline(x: Elev[]): Promise<void> {
    const s = await getStore();
    await s.set('tabel_baseline', x);
}

export async function loadBaseline(): Promise<Elev[] | null> {
    const s = await getStore();
    return await s.get('tabel_baseline');
}

// test data
export async function createTestData(): Promise<void> {
    const testData: Elev[] = [
        { name: "John Doe", class: "10A", flags: [false, true, true, true, true, false] },
        { name: "test", class: "9B", flags: [true, false, false, true, true, true] },
        { name: "Test User", class: "11A", flags: [true, true, true, true, false, false] },

        // Similar prefixes
        { name: "Maria Popescu", class: "9C", flags: [true, true, false, false, true, true] },
        { name: "Marian Alexandru", class: "10B", flags: [false, false, true, true, true, false] },
        { name: "Mariana Ionescu", class: "11C", flags: [true, false, true, false, true, false] },
        { name: "Marin Pavel", class: "12A", flags: [false, true, false, true, false, true] },

        // Multi‑word names
        { name: "Alexandru Mihai", class: "9A", flags: [true, true, true, false, false, true] },
        { name: "Mihai Alexandru", class: "10D", flags: [false, true, true, true, false, false] },
        { name: "Alexandra Maria", class: "11B", flags: [true, false, true, true, true, false] },

        // Accented names
        { name: "Ștefan Mureșan", class: "12B", flags: [true, true, false, true, false, true] },
        { name: "Ionuț Pop", class: "9D", flags: [false, false, true, true, true, true] },
        { name: "Cătălin Radu", class: "10C", flags: [true, false, false, true, true, false] },

        // Names that should NOT match common prefixes
        { name: "George Enescu", class: "11D", flags: [true, true, true, false, false, true] },
        { name: "Andrei Vasilescu", class: "12C", flags: [false, true, true, false, true, true] },
        { name: "Vlad Țepeș", class: "10E", flags: [true, false, true, true, false, true] },

        // Short names
        { name: "Ana", class: "9E", flags: [false, true, false, true, true, false] },
        { name: "Eli", class: "10F", flags: [true, true, true, false, false, false] },

        // Edge cases
        { name: "ZZZ Testcase", class: "12D", flags: [false, false, false, false, false, false] },
        { name: "Lorem Ipsum", class: "11E", flags: [true, true, false, false, true, true] },

        { name: "XXXGeorge Enescu", class: "11D", flags: [true, true, true, false, false, true] },
        { name: "XXXAndrei Vasilescu", class: "12C", flags: [false, true, true, false, true, true] },
        { name: "XXXVlad Țepeș", class: "10E", flags: [true, false, true, true, false, true] },
        { name: "XXGeorge Enescu", class: "11D", flags: [true, true, true, false, false, true] },
        { name: "XXAndrei Vasilescu", class: "12C", flags: [false, true, true, false, true, true] },
        { name: "XXVlad Țepeș", class: "10E", flags: [true, false, true, true, false, true] },
        { name: "XGeorge Enescu", class: "11D", flags: [true, true, true, false, false, true] },
        { name: "XAndrei Vasilescu", class: "12C", flags: [false, true, true, false, true, true] },
        { name: "XVlad Țepeș", class: "10E", flags: [true, false, true, true, false, true] }
    ];

    await saveBaseline(testData);
    await saveTabel(testData);
}

export async function loadScannedToday(): Promise<string[] | null> {
    const s = await getStore();
    return await s.get('scannedToday');
}

export async function saveScannedToday(list: string[]): Promise<void> {
    const s = await getStore();
    await s.set('scannedToday', list);
}

export async function loadScanDate(): Promise<string | null> {
    const s = await getStore();
    return await s.get('scanDate');
}

export async function saveScanDate(date: string): Promise<void> {
    const s = await getStore();
    await s.set('scanDate', date);
}
