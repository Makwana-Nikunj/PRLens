export async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('prlens', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('chat_summaries')) {
                db.createObjectStore('chat_summaries', { keyPath: 'prId' });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function getSummaryToken(prId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['chat_summaries'], 'readonly');
        const store = transaction.objectStore('chat_summaries');
        const request = store.get(prId);

        request.onsuccess = () => {
            resolve(request.result ? request.result.token : null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

export async function saveSummaryToken(prId, token) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['chat_summaries'], 'readwrite');
        const store = transaction.objectStore('chat_summaries');
        const request = store.put({ prId, token, updatedAt: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function deleteSummaryToken(prId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['chat_summaries'], 'readwrite');
        const store = transaction.objectStore('chat_summaries');
        const request = store.delete(prId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
