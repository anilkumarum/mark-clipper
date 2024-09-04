export class MdNote {
	/**
	 * @param {{ pageTitle: string; time: string; author: string; imagePaths: any; tags: string; }} noteData
	 * @param {string} path
	 * @param {FileSystemDirectoryHandle} vaultHandle
	 */
	constructor(noteData, path, vaultHandle) {
		path ??= noteData?.pageTitle;
		const name = noteData?.pageTitle ?? path.slice(path.lastIndexOf("/") + 1);
		this.name = name.endsWith(".md") ? name.slice(0, -3) : name;
		this.path = path.endsWith(".md") ? path : path + ".md";
		this.time = noteData?.time ?? "";
		this.author = noteData?.author ?? "";
		this.imagePaths = noteData?.imagePaths;
		this.tags = noteData?.tags ?? "[]";
		this.vaultHandle = vaultHandle;
	}
}
