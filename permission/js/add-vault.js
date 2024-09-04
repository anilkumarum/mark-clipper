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
		}),
	);
}

/**@type {HTMLDialogElement} */
const dialog = eId("file-permission");
const dialog2 = eId("host-permission");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.command === "requestVaultPermission") {
		getVault(request.vaultName).then((vaultHandle) => {
			if (!vaultHandle) return sendResponse(false);
			dialog.querySelector("var").textContent = vaultHandle.name;
			dialog.showModal();
			$on(dialog.querySelector("button"), "click", grantPermission);
			async function grantPermission() {
				try {
					const isGranted = (await vaultHandle["requestPermission"]({ mode: "readwrite" })) === "granted";
					sendResponse(isGranted);
					toast("Permission " + isGranted ? "granted" : "denied");
					dialog.close();
					if (!isGranted) return;
					const folderRow = eId(vaultHandle.name);
					if (folderRow) {
						const button = folderRow.querySelector("button");
						button.style.setProperty("--btn-clr", "red");
						button.textContent = "Revoke";
						folderRow.cells[0].firstElementChild.checked = true;
						folderRow.cells[1].firstElementChild.setAttribute("class", "check");
						folderRow.cells[1].lastElementChild.textContent = "Granted";
					}
					const { currentVault } = await getSync("currentVault");
					const command = currentVault === vaultHandle.name ? "sync_mdNotes" : "switch_vault";
					chrome.runtime.sendMessage({ msg: command, vault: request.vaultName });
					request.tabId && chrome.tabs.update(request.tabId, { active: true }), chrome.action.openPopup?.();
				} catch (error) {
					console.error(error);
					error.code === 20 || document.body.appendChild(new ReportBug(error));
				}
			}
		});
		return true;
	} else if (request === "requestHostPermission") {
		dialog2.showModal();
		$on(dialog2.querySelector("button"), "click", grantPermission);
		async function grantPermission() {
			chrome.permissions.request({ origins: ["<all_urls>"] }).then(sendResponse);
			dialog2.close();
		}
		return true;
	} else if (request === "knock knock") sendResponse(globalThis.permissionTabId);
	else if (request.msg === "switch_vault") observeCurrentVault(request.vault);
	else if (request.msg === "reportBug") document.body.appendChild(new ReportBug(request.error));
});

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
chrome.storage.session.set({ permissionTabId: tab.id });
globalThis.permissionTabId = tab.id;
