import { Storage } from '@ionic/storage';

let store: Storage | null = null;

export async function initStorage() {
    store = new Storage();
    await store.create();
}

export type Elev = {
    name: string;
    flags: boolean[];
};

export async function saveTabel(x: Elev[]) {
    if (!store) return;
    await store.set('tabel', x);
}

export async function createTestData() {
    const testData: Elev[] = [
        { name: "John Doe", flags: [false, true] },
        { name: "test", flags: [true] },
        { name: "Test User", flags: [true, true] }
    ];
    await saveTabel(testData);
}

export async function loadTabel(): Promise<Elev[] | null> {
    if (!store) return null;
    return await store.get('tabel');
}
