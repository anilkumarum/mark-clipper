import { FilePath, createNoteTree } from "../../js/note-tree.js";
import { getDirHandle } from "../../js/file-handle.js";
import { openMdNote } from "../note/note-container.js";
import { escapeRx, getSync } from "../../js/constant.js";
import { getVault } from "../../db/vault-db.js";
import { MdNote } from "../../js/mdNote.js";

export class FileNoteTree extends HTMLElement {
	constructor() {
		super();
	}

	async createMdFile(fileName) {
		fileName = fileName.replaceAll(escapeRx, "-");
		try {
			const filePath = (this.selectedFolderPath ?? "") + "/" + fileName;
			const fileItem = this.layerItem(new FilePath(fileName, filePath, false));
			const folderElem = $(`div[data-path='${this.selectedFolderPath}']`, this);
			if (folderElem && !folderElem.nextElementSibling) folderElem.after(document.createElement("ul"));
			folderElem?.nextElementSibling.insertAdjacentHTML("beforeend", fileItem);

			const fileHandle = await (this.selectedFolder ?? this.vaultHandle).getFileHandle(fileName, { create: true });
			const path = this.selectedFolderPath ? `${this.selectedFolderPath}/${fileHandle.name}` : fileHandle.name;
			chrome.runtime.sendMessage({ msg: "add_new_note_cxt_menu", notePath: filePath });
		} catch (error) {
			console.error(error);
		}
	}

	async onMdFileSelect(path) {
		const mdNote = new MdNote(null, path, this.vaultHandle);
		openMdNote(mdNote);
	}

	async onDirSelect(path) {
		const dirHandle = await getDirHandle(this.vaultHandle, path);
		this.selectedFolder = dirHandle;
		this.selectedFolderPath = path;
	}

	selectFile({ target }) {
		$("div.selected", this)?.classList.remove("selected");
		const div = target.closest("div");
		const nxtElem = div.nextElementSibling;
		div.classList.add("selected");
		const path = div.dataset.path;
		div.dataset.type === "directory" ? this.onDirSelect(path) : this.onMdFileSelect(path);

		if (nxtElem?.nodeName === "UL") {
			nxtElem.hidden = !nxtElem.hidden;
			div.firstElementChild.ico = nxtElem.hidden ? "folder" : "folder-open";
		}
	}

	layerItem = (entry) => `<li class="tree-item">
		<div class="file-item" data-path="${entry.path}" data-type="${entry.isDirectory ? "directory" : "file"}">
			<clip-icon ico="${entry.isDirectory ? "folder" : "md-note"}"></clip-icon>
			<span>${entry.name.slice(0, 20)}</span>
		</div>
		${entry.isDirectory ? this.createLayer(entry.files) : ""}
	</li> `;

	createLayer(entries) {
		return `<ul hidden>
			${entries.map(this.layerItem).join("")}
		</ul>`;
	}

	connectedCallback() {
		getSync("currentVault").then(({ currentVault }) => currentVault && this.switchVault(currentVault));
		$on(this, "click", this.selectFile.bind(this));
		chrome.runtime.onMessage.addListener((req) => req.msg === "switch_vault" && this.switchVault(req.vault));
	}

	async switchVault(vaultName) {
		this.rootDirName = vaultName;
		this.vaultHandle = await getVault(vaultName);
		if (!this.vaultHandle) return;
		const dirFiles = await createNoteTree(this.vaultHandle);
		this.innerHTML = this.createLayer(dirFiles);
		this.firstElementChild["hidden"] = false;
	}
}

customElements.define("filenote-tree", FileNoteTree);
