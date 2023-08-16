import { vaultHandle } from "../../common/permission-request.js";

class FilePath {
	/**@param {string} name, @param {string} path, @param {boolean} isDirectory */
	constructor(name, path, isDirectory) {
		this.name = name;
		this.isDirectory = isDirectory;
		this.path = path;
		isDirectory && (this.files = []);
	}
}

export async function createNoteTree() {
	const dirTree = { root: [] };
	let promises = [];
	async function walkDir(dirHandle, openDir, dirPath) {
		for await (const entry of dirHandle.values()) {
			if (entry.kind === "directory") {
				const entryPath = (dirPath && dirPath + "/") + entry.name;
				const folderPath = new FilePath(entry.name, entryPath, true);
				openDir.push(folderPath);
				promises.push(walkDir(entry, folderPath.files, entryPath));
			} else if (entry.name.endsWith(".md")) {
				const folderPath = (dirPath && dirPath + "/") + entry.name;
				openDir.push(new FilePath(entry.name, folderPath, false));
			}
		}
	}

	promises.push(walkDir(vaultHandle, dirTree.root, ""));
	await Promise.all(promises).catch((err) => console.error(err));
	await new Promise((r) => setTimeout(r, 100)); //fix later
	return dirTree;
}
