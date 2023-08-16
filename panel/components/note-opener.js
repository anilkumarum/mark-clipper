import { writeAttachmentFile } from "../../background/attachment.js";
import { getSync, setSync } from "../../common/constant.js";
import { getVaultList } from "../../common/db/db.js";
import { appendToFile } from "../../common/file.js";
import { setVaultHandle } from "../../common/permission-request.js";
import { NoteCard } from "./note-card.js";
import { noteContainer } from "./note-container.js";
import { NoteToolbar } from "./note-toolbar.js";
import { noteTree } from "./note-tree.js";

function showNoteTree() {
	noteTree.style.top = "2.22em";
	noteTree.style.left = "5em";
	// @ts-ignore
	noteTree.togglePopover();
	noteTree.role = "opener";
	// @ts-ignore
	noteTree.addEventListener("open", openNote, { once: true });
}

async function openNote({ detail }) {
	noteContainer.prepend(new NoteCard(detail));
	const { vaultLastNote, currentVault } = await getSync(["vaultLastNote", "currentVault"]);
	vaultLastNote[currentVault] = detail.path;
	setSync({ vaultLastNote });
}

function exportAllNotes() {
	if (!noteContainer.hasChildNodes()) return toast("no opened note available");
	const promises = [];
	for (const noteCard of noteContainer.children) {
		const toolbarElem = noteCard.firstElementChild;
		if (toolbarElem instanceof NoteToolbar) {
			const data = toolbarElem.contentElem.innerText;
			promises.push(appendToFile(toolbarElem.note.path, data));
			toolbarElem.contentElem.attachments.forEach(writeAttachmentFile);
			noteCard.lastElementChild.replaceChildren();
		}
	}
	Promise.all(promises).then(() => notify(promises.length + " notes exported"));
}

export class NoteOpener extends HTMLElement {
	constructor() {
		super();
	}

	async changeVault({ target }) {
		await setSync({ currentVault: target.value });
		setVaultHandle();
	}

	render(vaults) {
		return `<label title="switch vault">
			<select name="vault-changer">
				${vaults.map((vault) => `<option value="${vault}">${vault}</option>`).join("")}
			</select>
		</label>
		<div>
        	<clip-icon ico="chev-down"></clip-icon>
        	<span>Open Notes</span>
    	</div>
    	<button>Export All</button>`;
	}

	async connectedCallback() {
		const vaults = await getVaultList();
		this.innerHTML = this.render(vaults);
		$on(this.firstElementChild, "change", this.changeVault);
		$on(this.children[1], "click", showNoteTree);
		$on(this.lastElementChild, "click", exportAllNotes);
	}
}

customElements.define("note-opener", NoteOpener);
