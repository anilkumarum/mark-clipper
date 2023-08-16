import { vaultHandle } from "./permission-request.js";
import { encode, getBlob } from "./util.js";

const options = { mode: "readwrite" };
export const checkAccess = async (vaultHandle) => (await vaultHandle.queryPermission(options)) === "granted";

export async function setNoteList(selectElem) {
	if (!vaultHandle) return;
	// @ts-ignore
	for await (const fileName of vaultHandle.keys()) {
		if (fileName.endsWith(".md")) {
			const option = document.createElement("option");
			option.text = option.value = fileName;
			selectElem.add(option);
		}
	}
}

export async function appendToFile(filePath, data) {
	if (!data) return;
	const enteries = filePath.split("/");
	const fileName = enteries.pop();
	const utf8Buffer = encode(data);

	try {
		await filePath.write(utf8Buffer);
		await filePath.close();
	} catch (error) {
		toast(error);
	}
}

/**@param {string} attachmentUrl*/
export async function writeAttachmentFile(attachmentUrl, filePath) {
	try {
		const attachmentBlob = await getBlob(attachmentUrl);
		await filePath.write(attachmentBlob);
		await filePath.close();
	} catch (error) {
		console.error(error);
	}
}
