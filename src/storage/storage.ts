import { Storage } from '@ionic/storage';

export type Elev = {
    name: string;
    class: string;
    flags: boolean[]; //6
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

// test data
export async function createTestData(): Promise<void> {
    const testData: Elev[] = [
        { name: "John Doe", class: "10A", flags: [false, true, true, true, true, false] },
        { name: "test", class: "9B", flags: [true, false, false, true, true, false] },
        { name: "Test User", class: "11A", flags: [true, true, true, true, false, false] },
    ];
    await saveTabel(testData);
}