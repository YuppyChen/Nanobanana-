import { Asset } from '../types';

const DB_NAME = 'AssetLibraryDB';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

// Helper to convert data URL to blob
const dataURLToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};


// Helper to convert blob to data URL
const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

interface StoredAsset {
    id: string;
    prompt: string;
    imageBlob: Blob;
    createdAt: Date;
}


let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt');
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
    });
    return dbPromise;
};

export const addAsset = async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
    const db = await getDb();
    const newId = `${Date.now()}-${Math.random()}`;
    const imageBlob = dataURLToBlob(asset.imageDataUrl);

    const storedAsset: StoredAsset = {
        id: newId,
        prompt: asset.prompt,
        imageBlob: imageBlob,
        createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(storedAsset);

        request.onsuccess = () => {
            resolve({ ...asset, id: newId });
        };
        request.onerror = () => {
            console.error('Error adding asset:', request.error);
            reject(request.error);
        };
    });
};

export const getAllAssets = async (): Promise<Asset[]> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('createdAt');
        // Get all keys and iterate backwards for descending order
        const getAllKeysReq = index.getAllKeys();

        getAllKeysReq.onsuccess = () => {
            const keys = getAllKeysReq.result.reverse();
            const assets: Asset[] = [];
            if (keys.length === 0) {
              resolve(assets);
              return;
            }
            
            let cursorReq = index.openCursor(null, 'prev');
            cursorReq.onsuccess = async (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor) {
                    const storedAsset: StoredAsset = cursor.value;
                    const asset = {
                        id: storedAsset.id,
                        prompt: storedAsset.prompt,
                        imageDataUrl: await blobToDataURL(storedAsset.imageBlob),
                    };
                    assets.push(asset);
                    if (assets.length === keys.length) {
                        resolve(assets);
                    }
                    cursor.continue();
                } else {
                   resolve(assets);
                }
            };
            cursorReq.onerror = () => {
                 console.error('Error in cursor:', cursorReq.error);
                 reject(cursorReq.error);
            }
        }
        
        getAllKeysReq.onerror = () => {
             console.error('Error getting all asset keys:', getAllKeysReq.error);
             reject(getAllKeysReq.error);
        }
    });
};

export const deleteAsset = async (id: string): Promise<void> => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            console.error('Error deleting asset:', request.error);
            reject(request.error);
        };
    });
};