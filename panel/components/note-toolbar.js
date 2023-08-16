import { appendToFile, writeAttachmentFile } from "../../common/file.js";
import { NoteContent } from "./note-content.js";
import { openNotes } from "./note-tree.js";

const noteTree = $("note-tree");
function openNoteTree({ pageX, pageY }) {
	noteTree.style.top = pageY + 21 + "px";
	noteTree.style.left = pageX - 25 + "px";
	noteTree.showPopover();
	noteTree.role = "picker";
	noteTree.addEventListener("select", this.changeNote, { once: true });
}

function closeNote({ currentTarget }) {
	const noteCard = currentTarget.closest("note-card");
	openNotes.delete(noteCard.note.name);
	noteCard.remove();
}

const selectTitle = () => document.execCommand("selectAll", false, null);

function editNoteName({ currentTarget }) {
	const titleInput = currentTarget.previousElementSibling;
	titleInput.setAttribute("contenteditable", "true");
	titleInput.focus();
}

export class NoteToolbar extends HTMLElement {
	/**@param {{ name: any; path: string; }} note*/
	constructor(note) {
		super();
		this.note = note;
	}

	exportNote() {
		const data = this.contentElem.innerText;
		appendToFile(this.note.path, data);

		this.contentElem.attachments.forEach(writeAttachmentFile);
		notify("export success");
		this.contentElem.replaceChildren();
	}

	insertFrontMatter() {
		const frontmatter = `---\ntitle:\ntags:\n---\n\n`;
		this.contentElem.prepend(frontmatter);
		//TODO add input for tag auto-completion
	}

	insertCitation() {
		const citation = ``;
		this.contentElem.append(citation);
	}

	insertCtmData({ target }) {
		const dataType = target.className;
		if (dataType === "frontmatter") this.insertFrontMatter();
		else if (dataType === "citation") this.insertCitation();
	}

	changeNote = ({ detail }) => {
		this.note = detail;
		const nameElem = this.children[1].children[1];
		nameElem["title"] = nameElem.textContent = detail.name;
	};

	updateNoteName({ target }) {
		target.setAttribute("contenteditable", "false");
		this.note.name = target.textContent;
		target.title = target.textContent;
	}

	render() {
		return `<details>
        <summary> <clip-icon ico="plus"></clip-icon></summary>
        <div>
            <div class="frontmatter">Add frontmatter</div>
            <div class="citation">Add citation</div>
        </div>
    </details>
    <div>
        <clip-icon ico="chev-down"></clip-icon>
        <span class="note-name" title="${this.note.name}">${this.note.name}</span>
        <clip-icon ico="edit"></clip-icon>
    </div>
    <button>
        <span>Export</span>
        <clip-icon ico="export"></clip-icon>
    </button>
	<clip-icon class="close-btn" ico="close"></clip-icon>`;
	}

	connectedCallback() {
		this.innerHTML = this.render();
		$on(this.firstElementChild.lastElementChild, "click", this.insertCtmData.bind(this));

		const nameBlock = this.children[1];
		$on(nameBlock.firstElementChild, "click", openNoteTree.bind(this));
		$on(nameBlock.children[1], "focus", selectTitle);
		$on(nameBlock.children[1], "blur", this.updateNoteName.bind(this));
		$on(nameBlock.lastElementChild, "click", editNoteName);

		$on(this.children[2], "click", this.exportNote.bind(this));
		$on(this.lastElementChild, "click", closeNote);

		/**@type {NoteContent} */
		// @ts-ignore
		this.contentElem = this.nextElementSibling;
	}
}

customElements.define("note-toolbar", NoteToolbar);
