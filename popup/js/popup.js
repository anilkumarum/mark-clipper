import "../../common/reset.js";
import "./vault-list.js";
import "./bookmark.js";
import { setVaultHandle } from "../../common/permission-request.js";
setTimeout(setVaultHandle, 500);

import baseCss from "../style/base.css" assert { type: "css" };
import actionsCss from "../style/actions.css" assert { type: "css" };
document.adoptedStyleSheets = [baseCss, actionsCss];

const screenshotBtn = eId("screenshot");
$on(screenshotBtn, "click", injectCropper);

async function injectCropper() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: ["scripts/cropper/cropper.js"],
		});
	} catch (error) {
		console.log(error);
	}
}

async function openPanel() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	await chrome.sidePanel.open({ tabId: tab.id });
}

const clipArticleBtn = eId("clip_article");
$on(clipArticleBtn, "click", async function () {
	const isAllTab = clipArticleBtn.previousElementSibling.value === "all";
	await openPanel();
	await new Promise((r) => setTimeout(r, 100));
	chrome.runtime.sendMessage({ msg: "clip_article", isAllTab });
});

const selectText = eId("select_text");
$on(selectText, "click", openPanel);
