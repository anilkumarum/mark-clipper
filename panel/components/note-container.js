import { NoteCard } from "./note-card.js";
import { extractContent } from "../js/extractor.js";

export function addNote(noteData) {
	const pageTitle = noteData.pageTitle;
	const note = { name: pageTitle, path: pageTitle + ".md" };
	const noteCard = new NoteCard(note);
	noteContainer.prepend(noteCard);
	noteCard.lastElementChild.replaceChildren(noteData.mdContent);
}

/**@type {NoteContainer} */
export let noteContainer;
export class NoteContainer extends HTMLElement {
	constructor() {
		super();
		noteContainer = this;
	}

	async connectedCallback() {}
}

customElements.define("note-container", NoteContainer);

export async function extractTabContent(request) {
	if (request.isAllTab) {
		const tabs = await chrome.tabs.query({ currentWindow: true });
		for (const tab of tabs) tab.url.startsWith("http") && extractContent(tab.id, addNote);
	} else {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		extractContent(tab.id, addNote);
	}
}
