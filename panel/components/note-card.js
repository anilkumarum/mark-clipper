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
	}
}

customElements.define("note-card", NoteCard);
