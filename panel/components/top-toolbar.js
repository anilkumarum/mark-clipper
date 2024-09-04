import { appendToFile, writeAttachmentFile } from "../js/file-handle.js";
import { noteContainer } from "./note/note-container.js";
import { NoteToolbar } from "./note/note-toolbar.js";
import { NoteDrawer } from "./drawer/note-drawer.js";
import { commander } from "../js/commander.js";
import { html } from "../js/om.event.js";

export class TopToolbar extends HTMLElement {
	constructor() {
		super();
	}

	async exportAllNotes() {
		if (!noteContainer.hasChildNodes()) return toast("Zero notes opened.\nNeed to open notes");
		const promises = [];
		for (const noteCard of noteContainer.children) {
			const dirHandle = await noteCard["note"].vaultHandle.getDirectoryHandle("attachments", { create: true });
			const toolbarElem = noteCard.firstElementChild;
			if (toolbarElem instanceof NoteToolbar) {
				let mdData = toolbarElem.contentElem.innerText;
				for (const mathElem of toolbarElem.contentElem.querySelectorAll("math-jax")) {
					mdData = mdData.replace(mathElem["innerText"], mathElem.innerHTML);
				}
				mdData.startsWith("\n") || (mdData = "\n" + mdData);

				promises.push(appendToFile(toolbarElem.note.path, mdData, noteCard["note"].vaultHandle));
				toolbarElem.contentElem.attachments.forEach(writeAttachmentFile.bind(null, dirHandle));
				noteCard.lastElementChild.replaceChildren();
			}
		}

		Promise.all(promises).then(async () => {
			notify(promises.length + " notes exported");
			commander.clear();
			noteContainer.replaceChildren();
			this.openNoteStack = (await getStore("openNoteStack")).openNoteStack;
			setStore({ openNoteStack: [] });
		});
	}

	openNoteDrawer() {
		if (this.noteDrawer) return this.noteDrawer.showPopover();
		this.noteDrawer = new NoteDrawer();
		this.appendChild(this.noteDrawer);
	}

	render() {
		return html`<clip-icon
				ico="drawer"
				title="${i18n("open_file_drawer")} (Alt + D)"
				@click=${this.openNoteDrawer.bind(this)}></clip-icon>
			<div style="font-weight:bold">markClipper</div>
			<button title="${i18n("export_all_notes")} (Ctrl+ Shift + E)" @click=${this.exportAllNotes}>
				${i18n("export_all")}
			</button>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("top-toolbar", TopToolbar);
