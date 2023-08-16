import { createNoteTree } from "../js/note-tree.js";
// @ts-ignore
import treeCss from "../style/note-tree.css" assert { type: "css" };

export const openNotes = new Map();
/**@type {NoteTree}*/
export let noteTree;

export class NoteTree extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [treeCss];
		noteTree = this;
	}
	role;

	selectNote({ target }) {
		const div = target.closest("div");
		const nxtElem = div.nextElementSibling;
		if (!nxtElem) {
			div.classList.add("selected");
			const path = div.dataset.path;
			const name = div.lastElementChild.textContent;
			openNotes.set(name, path);

			if (this.role === "opener") {
				fireEvent(this, "open", { name, path });
				return;
			}

			if (this.role === "picker") {
				fireEvent(this, "select", { name, path });
				// @ts-ignore
				return this.hidePopover();
			}
		}

		if (nxtElem.nodeName === "UL") {
			nxtElem.hidden = !nxtElem.hidden;
			div.firstElementChild.ico = nxtElem.hidden ? "folder" : "folder-open";
		}
	}

	layerItem = (entry) => `<li class="tree-item">
		<div class="${openNotes.has(entry.name) ? "disabled" : ""}" data-path="${entry.path}">
			<clip-icon ico="${entry.isDirectory ? "folder" : "md-note"}" title="note"></clip-icon>
			<span>${entry.name}</span>
		</div>
		${entry.isDirectory ? this.createLayer(entry.files) : ""}
	</li> `;

	createLayer(entries) {
		return `<ul hidden>
			${entries.map(this.layerItem).join("")}
		</ul>`;
	}

	connectedCallback() {
		$on(this.shadowRoot, "click", this.selectNote.bind(this));
		$on(document.body, "vaultchange", this.setNoteTree);
	}

	setNoteTree = async () => {
		const notes = await createNoteTree();
		this.shadowRoot.innerHTML = this.createLayer(notes.root);
		this.shadowRoot.firstElementChild["hidden"] = false;
	};
}

customElements.define("note-tree", NoteTree);
