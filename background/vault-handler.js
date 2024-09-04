import { addNoteContextMenu, updateVaultNotesCxtMenu } from "./context-menu.js";
import { getSync, setSync } from "../panel/js/constant.js";
import { getVault } from "../panel/db/vault-db.js";

export class VaultHandler {
	permissionUrl = "/permission/index.html";
	options = { mode: "readwrite" };
	vaultHandle;

	constructor(vaultName) {
		this.vaultName = vaultName;
	}

	checkAccess = async (vaultHandle) => (await vaultHandle.queryPermission(this.options)) === "granted";

	async getVaultHandle() {
		if (!this.vaultHandle) {
			const vaultName = (this.vaultName ??= (await getSync("currentVault")).currentVault);
			if (!vaultName) return chrome.tabs.create({ url: this.permissionUrl });
			this.vaultHandle = await getVault(vaultName).catch((err) => console.error(err));
		}

		const hasAccess = await this.checkAccess(this.vaultHandle);
		if (hasAccess) return this.vaultHandle;
	}

	async setVaultHandle() {
		if (await this.getVaultHandle()) {
			/* const observer = new FileSystemObserver(this.watchVaultNote);
			await observer.observe(fileHandle); */
			return this.vaultHandle;
		}

		let tabId;
		try {
			tabId = await chrome.runtime.sendMessage("knock knock");
			tabId ??=
				(await chrome.storage.session.get("permissionTabId")).permissionTabId ??
				(await chrome.tabs.query({ url: chrome.runtime.getURL(this.permissionUrl) }))[0]?.id;
			await chrome.tabs.sendMessage(tabId, "knock knock");
		} catch (error) {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			tabId = (await chrome.tabs.create({ url: this.permissionUrl, index: tab.index + 1 })).id;
			await new Promise((r) => setTimeout(r, 200));
		} finally {
			await chrome.tabs.sendMessage(tabId, { command: "requestVaultPermission", vaultName: this.vaultName });
			await chrome.tabs.update(tabId, { active: true });
			this.vaultHandle = await getVault(this.vaultName).catch((err) => console.error(err));
		}
	}

	async getVaultNote(vaultHandle) {
		const vaultLastNote = (await getSync("vaultLastNote")).vaultLastNote ?? {};
		if (vaultLastNote[vaultHandle.name]) return vaultLastNote[vaultHandle.name];
		for await (const fileName of vaultHandle.keys()) return fileName;
	}

	async setVaultLastNote(noteName) {
		this.vaultHandle ??= await this.setVaultHandle();
		if (!this.vaultHandle) return;
		const vaultLastNote = (await getSync("vaultLastNote")).vaultLastNote ?? {};
		vaultLastNote[this.vaultHandle.name] = noteName;
		setSync({ vaultLastNote });
	}

	async addNewCreatedMdNotes(vaultName) {
		this.vaultName = vaultName;
		const vaultHandle = await this.getVaultHandle();
		if (!vaultHandle) return;
		const { crtVaultMdNotes } = await getStore("crtVaultMdNotes");
		/**@type {Object<string, {filename:string,path:string}>} */
		const mdNoteList = {};
		const promises = [];

		/**@param {FileSystemDirectoryHandle} vaultHandle, * @param {string} dirPath*/
		async function addNotesFromDir(vaultHandle, dirPath) {
			for await (const entity of vaultHandle?.values()) {
				// @ts-ignore
				if (entity.kind === "directory") promises.push(addNotesFromDir(entity, dirPath + entity.name + "/"));
				else if (entity.name.endsWith(".md")) {
					const filename = entity.name.slice(0, -3);
					const path = dirPath + entity.name;
					mdNoteList[path] = { filename, path };
					if (!crtVaultMdNotes[path]) {
						crtVaultMdNotes[path] = { filename, path };
						addNoteContextMenu(path, filename);
					}
				}
			}
		}

		promises.push(addNotesFromDir(vaultHandle, ""));
		await Promise.all(promises);
		await new Promise((r) => setTimeout(r, 1000));
		//remove note if .md file deleted
		for (const nodePath in crtVaultMdNotes) {
			if (!mdNoteList[nodePath]) {
				delete crtVaultMdNotes[nodePath];
				chrome.contextMenus.remove(nodePath);
			}
		}
		setStore({ crtVaultMdNotes });
	}

	watchVaultNote(records, observer) {
		for (const record of records) {
		}
	}
}
