import "../../common/reset.js";
import { insertVault } from "./vault-list.js";
import { STORE, connect } from "../../common/db/db.js";
import { setSync } from "../../common/constant.js";

import styleCss from "../style/style.css" assert { type: "css" };
document.adoptedStyleSheets = [styleCss];

const addVaultBtn = eId("add_vault");
$on(addVaultBtn, "click", addNewVault);

async function addNewVault() {
	// @ts-ignore
	const dirHandle = await getVaultFolder();
	await saveFileHandle(dirHandle);
	insertVault(dirHandle.name, true);
	setSync({ currentVault: dirHandle.name });
}

//put file handle in db
/**@param {FileSystemDirectoryHandle} vaultHandle*/
export async function saveFileHandle(vaultHandle) {
	return new Promise((resolve, reject) =>
		connect().then((db) => {
			const store = db.transaction(STORE, "readwrite").objectStore(STORE);

			const saveCall = store.put({ vaultId: vaultHandle.name, vaultHandle });
			saveCall.onsuccess = (e) => resolve(e);
			saveCall.onerror = (e) => reject(e);
			db.close();
		})
	);
}
