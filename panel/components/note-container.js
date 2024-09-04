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

	async extractTabContent(articleClipType) {
		articleClipType ??= (await getSync("articleClipType")).articleClipType ?? "full_page";

		const [tab] = await getTabs({ currentWindow: true, active: true });
		if (!tab.url.startsWith("http")) return;
		try {
			const { currentVault } = await getSync("currentVault");
			const vaultHandle = await getVault(currentVault);

			const pageData = await extractContent(tab.id, articleClipType === "full_page");
			if (!pageData) return;
			const mdNote = new MdNote(pageData, null, vaultHandle);
			if (articleClipType === "full_page") return openMdNote(mdNote, pageData.mdContent, false);
			//AI Summary
			const noteCardElem = await openMdNote(mdNote, "", false);
			if (!this.aiSummarizer) {
				const { AiSummarizer } = await import("../../summary/ai-summarizer.js");
				this.aiSummarizer = new AiSummarizer();
			}
			const message = `${contentTypes[articleClipType]}:\n${pageData.mdContent}`;
			this.aiSummarizer.summarize("ChatGPT", message, noteCardElem.lastElementChild);
		} catch (error) {
			console.error(error);
		}
	}

	async connectedCallback() {
		chrome.storage.sync.get("theme").then(({ theme }) => theme && setTheme(theme));
		addEventListener("keydown", this.keyShortcutListener.bind(this));
	}

	keyShortcutListener(evt) {
		if (evt.code === "Escape") return this.replaceChildren(), setStore({ openNoteStack: [] });
		if (evt.ctrlKey && evt.shiftKey && evt.code === "KeyE") return this.previousElementSibling["exportAllNotes"]();
		if (evt.ctrlKey && evt.code === "KeyE") return focusedNote.firstElementChild["exportNote"]();
		if (!evt.altKey && !evt.metaKey) return;

		if (evt.code === "KeyO") restoreNotes(this.previousElementSibling["openNoteStack"]);
		else if (evt.code === "KeyD") this.previousElementSibling["openNoteDrawer"]();
		else if (evt.code === "KeyA") this.extractTabContent();
		else if (evt.code === "KeyC") focusedNote.lastElementChild["copyContent"]();
		else if (evt.code === "KeyT") close();
	}
}

customElements.define("note-container", NoteContainer);

//Restore notes and open clip article note
async function restoreNotes(openNoteStack) {
	if (!openNoteStack) return;
	const vaultHandles = {};
	for (const note of openNoteStack) {
		vaultHandles[note.vaultName] ??= await getVault(note.vaultName);
		const mdNote = new MdNote(null, note.path, vaultHandles[note.vaultName]);
		openMdNote(mdNote);
	}
}

async function restoreOpenNotes() {
	const openNoteStack = (await getStore("openNoteStack")).openNoteStack;
	if (openNoteStack?.length === 0) return;
	document.body.appendChild(new RestoreNoteDialog(restoreNotes.bind(null, openNoteStack)));
}

chrome.runtime.sendMessage("Waiting for command").then(async (response) => {
	if (response?.msg === "clip_article") noteContainer.extractTabContent(response.articleClipType);
	else if (response?.msg === "selectText") restoreOpenNotes();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request === "auto-clip-article") {
		noteContainer.extractTabContent(request);
		sendResponse("extracting...");
	}
});
