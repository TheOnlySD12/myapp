import { Storage } from '@ionic/storage';

export type Elev = {
    name: string;
    flags: boolean[];
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
        { name: "John Doe", flags: [false, true] },
        { name: "test", flags: [true] },
        { name: "Test User", flags: [true, true] }
    ];
    await saveTabel(testData);
}