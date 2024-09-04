import { NoteContent } from "./note-content.js";
import { NoteToolbar } from "./note-toolbar.js";

export class NoteCard extends HTMLElement {
	/**@param {{ name: any; path: string; }} note*/
	constructor(note) {
		super();
		this.note = note;
	}

	render() {
		const toolBar = new NoteToolbar(this.note);
		const noteContent = new NoteContent();
		this.append(toolBar, noteContent);
	}

	connectedCallback() {
		this.render();
		this.onNoteSelected();

		if (this.note.imagePaths)
			for (const img of this.note.imagePaths) this.lastElementChild["images"].set(img.fileName, img.imgSrc);
	}

	onNoteSelected() {
		focusedNote?.removeAttribute("selected");
		focusedNote = this;
		this.setAttribute("selected", "");
	}

	disconnectedCallback() {
		this.focusedNote === this && (this.focusedNote = null);
	}
}

customElements.define("note-card", NoteCard);
