export const STORE = "VaultHandler";

function onupgradeneeded({ target }) {
	target.result.createObjectStore(STORE, { keyPath: "vaultId" });
}

/**@returns {Promise<IDBDatabase>} */
export function connect() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("markClipper", 1);
		request.onupgradeneeded = onupgradeneeded;
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
		request.onblocked = () => console.warn("pending till unblocked");
	});
}

/**@returns {Promise<FileSystemDirectoryHandle>} */
export function getVault(vaultName) {
	return new Promise(async (resolve, reject) =>
		connect().then((db) => {
			const store = db.transaction(STORE, "readonly").objectStore(STORE);
			const request = store.get(vaultName);
			// @ts-ignore
			request.onsuccess = ({ target }) => resolve(target.result.vaultHandle);
			request.onerror = (e) => reject(e);
			db.close();
		})
	);
}

/**@returns {Promise<{vaultId:string, vaultHandle:FileSystemDirectoryHandle}[]>} */
export function getAllVault() {
	return new Promise(async (resolve, reject) =>
		connect().then((db) => {
			const store = db.transaction(STORE, "readonly").objectStore(STORE);
			const request = store.getAll();
			request.onsuccess = ({ target }) => resolve(target["result"]);
			request.onerror = (e) => reject(e);
			db.close();
		})
	);
}

/**@returns {Promise<string[]>} */
export function getVaultList() {
	return new Promise(async (resolve, reject) =>
		connect().then((db) => {
			const store = db.transaction(STORE, "readonly").objectStore(STORE);
			const request = store.getAllKeys();
			request.onsuccess = ({ target }) => resolve(target["result"]);
			request.onerror = (e) => reject(e);
			db.close();
		})
	);
}
