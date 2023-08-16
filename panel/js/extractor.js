export async function extractContent(tabId, addNote) {
	const info = await chrome.scripting.executeScript({
		target: { tabId },
		func: getMarkdownContent,
	});
	const noteData = info[0].result;
	noteData && addNote(noteData);
}

//inject function
async function getMarkdownContent() {
	const rootElem =
		document.querySelector("article") ??
		document.querySelector("main") ??
		document.querySelector(".container") ??
		document.querySelector("#post") ??
		document.querySelector("#blog") ??
		document.body;

	const turndownService = new TurndownService();
	const mdContent = turndownService.turndown(rootElem.innerHTML);
	return { mdContent, pageTitle: document.title };
}
