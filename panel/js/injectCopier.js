function copyScript() {
	const port = chrome.runtime.connect({ name: location.host });
	port.onMessage.addListener(function (msg) {});
	port.onDisconnect.addListener(() => {
		document.body.removeEventListener("copy", sendSelectedContent);
		document.body.removeEventListener("keydown", onKeyDown);
	});

	function onKeyDown(evt) {
		if (evt.ctrlKey) {
			evt.code === "KeyZ"
				? port.postMessage({ command: "Undo" })
				: evt.code === "KeyY" && port.postMessage({ command: "Redo" });
			if (evt.shiftKey && evt.code === "KeyH") globalThis.markClipperHighlighter?.highlightSelected(null, false);
		} else if (evt.shiftKey && evt.code === "Space") {
			const selection = getSelection();
			selection.modify("extend", "forward", "line");
			evt.preventDefault();
		} else if ((evt.altKey || evt.metaKey) && evt.code === "KeyH") {
			globalThis.markClipperHighlighter?.highlightSelected("ffff00", false);
			sendSelectedContent();
			getSelection().removeAllRanges();
		}
	}

	const blockTags = new Set(["BLOCKQUOTE", "PRE", "OL", "UL", "DT"]);
	var markdownGenerator;
	async function sendSelectedContent() {
		const selection = getSelection();
		if (selection.isCollapsed) return;
		const range = selection.getRangeAt(0);
		if (!markdownGenerator) {
			const generateUrl = chrome.runtime.getURL("scripts/generator/md-generator.js");
			const { MarkdownGenerator } = await import(generateUrl);
			markdownGenerator = new MarkdownGenerator();
		}
		const ancestorElem = range.commonAncestorContainer.parentElement;
		const parentTag = blockTags.has(ancestorElem.parentElement.tagName)
			? ancestorElem.parentElement.tagName
			: ancestorElem["tagName"];
		const parentElem = document.createElement(parentTag.toLowerCase());
		parentElem.appendChild(range.cloneContents());

		try {
			const { mdContent } = markdownGenerator.generate([parentElem], false);
			port.postMessage({ command: "copied", mdContent });
		} catch (error) {
			console.error(error);
		}
	}

	document.body.addEventListener("copy", sendSelectedContent);
	document.body.addEventListener("keydown", onKeyDown);
	import(chrome.runtime.getURL("scripts/highlighter/Highlighter.js"));
	console.log("mark_clipper script injected");
}

export async function injectCopier(tabId, info) {
	if (info.status === "complete") {
		try {
			await chrome.scripting.executeScript({
				target: { tabId: tabId, allFrames: true },
				func: copyScript,
			});
		} catch (error) {
			const errMsg =
				"Cannot access contents of the page. Extension manifest must request permission to access the respective host.";
			console.info(error);
		}
	}
}
