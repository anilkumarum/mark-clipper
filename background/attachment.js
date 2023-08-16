import { getVault } from "../common/db/db.js";
import { encode, getBlob } from "../common/util.js";

const getSync = chrome.storage.sync.get.bind(chrome.storage.sync);
const permissionUrl = "/permission/index.html";

let vaultHandle;
const options = { mode: "readwrite" };
export const checkAccess = async (vaultHandle) => (await vaultHandle.queryPermission(options)) === "granted";
export async function getVaultHandle(vaultName) {
	if (!vaultHandle || vaultHandle.name !== vaultName) {
		const { currentVault } = await getSync("currentVault");
		if (!currentVault) return chrome.tabs.create({ url: permissionUrl });
		vaultHandle = await getVault(currentVault).catch((err) => console.error(err));
	}

	const hasAccess = await checkAccess(vaultHandle);
	if (hasAccess) return vaultHandle;

	try {
		const url = chrome.runtime.getURL(permissionUrl);
		const [tab] = await chrome.tabs.query({ url });
		tab ? await chrome.tabs.update(tab.id, { active: true }) : await chrome.tabs.create({ url });
		await chrome.tabs.create({ url });
	} catch (error) {
		console.error(error);
	}
}

/**@param {Blob} shotBlob, @param {string} noteName*/
export async function writeScreenshotFile(shotBlob, noteName) {
	const vaultHandle = await getVaultHandle();
	if (!vaultHandle) return chrome.tabs.create({ url: permissionUrl });

	const imgName = new Date().toISOString().replaceAll(":", "-") + ".png";
	writeFile(shotBlob, imgName, "screenshots")
		.then(async () => {
			const imgAlt = "image";
			const imgShotLink = `\n![screenshot${imgAlt}](./screenshots/${imgName})`;
			await appendImgLink(noteName, imgShotLink);
		})
		.catch((err) => console.error(err));
}

/**@param {string} srcUrl, @param {string} noteName*/
export async function writeAttachmentFile(srcUrl, noteName, pageUrl) {
	const vaultHandle = await getVaultHandle();
	if (!vaultHandle) return;
	noteName ?? (await getVaultNote(vaultHandle));
	const attachmentBlob = await getBlob(srcUrl);
	const fileName = srcUrl.slice(srcUrl.lastIndexOf("/") + 1);
	writeFile(attachmentBlob, fileName, "attachments")
		.then(async () => {
			const imgShotLink = `\n![${fileName}](./attachments/${fileName})`;
			noteName && (await appendImgLink(noteName, imgShotLink));
		})
		.catch((err) => console.error(err));
}

async function writeFile(fileBlob, fileName, directory) {
	try {
		await fileName.write(fileBlob);
	} catch (error) {
		alert(error);
	}
}

async function appendImgLink(noteName, imgShotLink) {
	const imgLinkBuffer = encode(imgShotLink);
	try {
		await noteName.write(imgLinkBuffer);
		await noteName.close();
	} catch (error) {
		toast(error);
	}
}

export const attachments = {
	image: writeAttachmentFile,
};

async function getVaultNote(vaultHandle) {
	const { vaultLastNote } = await getSync("vaultLastNote");
	if (vaultLastNote[vaultHandle.name]) return vaultLastNote[vaultHandle.name];
	for await (const fileName of vaultHandle.keys()) return fileName;
}

export async function createNoteCxtMenu() {
	chrome.contextMenus.removeAll();
	chrome.contextMenus.create({
		id: "vaultPermission",
		title: "Vault Permission",
		contexts: ["action"],
	});

	chrome.contextMenus.create({
		id: "clipContent.md",
		title: "Clip to Obsidian",
		contexts: ["image"],
	});

	if (!vaultHandle) return;
	const crtVaultNotes = [];
	for await (const fileName of vaultHandle.keys()) {
		if (fileName.endsWith(".md")) {
			chrome.contextMenus.create({
				id: fileName,
				title: fileName.slice(0, -3),
				parentId: "clipContent.md",
				contexts: ["image"],
			});
			crtVaultNotes.push(fileName);
		}
	}
	chrome.storage.local.set({ crtVaultNotes });
}
