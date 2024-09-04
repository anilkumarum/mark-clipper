import "./config.js";
import { getSync, setSync } from "../../panel/js/constant.js";
//context menu
const keys = [
	"contextMenu",
	"frontMatter",
	"saveNoteImages",
	"imageFolderPath",
	"clipArticleFolderPath",
	"fileNameFormat",
];
const storeData = await getSync(keys);
const { hightlightOn } = await chrome.storage.local.get("hightlightOn");
const contextMenuElem = eId("context_menu");
for (const input of contextMenuElem.querySelectorAll("input")) {
	storeData.contextMenu.indexOf(input.value) === -1 || (input.checked = true);
}
$on(contextMenuElem, "change", async ({ target }) => {
	const targetType = target.value;
	if (target.checked) storeData.contextMenu.push(targetType);
	else {
		const idx = storeData.contextMenu.indexOf(targetType);
		storeData.contextMenu.splice(idx, 1);
	}
	await setSync({ contextMenu: storeData.contextMenu });
	const ctxMenuNoteList = (await getStore("ctxMenuNoteList")).ctxMenuNoteList ?? [];
	chrome.contextMenus.update("clipContent.md", { contexts: storeData.contextMenu });
	for (const menuId of ctxMenuNoteList) chrome.contextMenus.update(menuId, { contexts: storeData.contextMenu });
});

//fronmatter
const frontMatterElem = eId("frontMatter");
for (const input of frontMatterElem.querySelectorAll("input[type=checkbox]")) {
	storeData.frontMatter[input.id] && (input.checked = true);
}
storeData.frontMatter.domain === "reverse" && (frontMatterElem.lastElementChild.lastElementChild.hidden = false);

$on(frontMatterElem, "change", ({ target }) => {
	if (target.id) {
		const value = target.id === "createdAt" ? target.nextElementSibling.nextElementSibling.value : target.value;
		storeData.frontMatter[target.id] = target.checked ? value : null;
	} else if (target.name === "createdAt") storeData.frontMatter[target.name] = target.value;

	target.name === "domain" && (target.parentElement.nextElementSibling.hidden = !target.checked);
	setSync({ frontMatter: storeData.frontMatter });
});

//highlighter
const highlighterSwitch = eId("highlighter");
highlighterSwitch.checked = hightlightOn;
$on(highlighterSwitch, "change", ({ target }) => {
	chrome.storage.local.set({ hightlightOn: target.checked });
	chrome.runtime.sendMessage({ msg: "toggle_highlight", hightlightOn: target.checked });
});

//downloadImage
const saveImgSwitch = eId("saveNoteImages");
saveImgSwitch.checked = storeData.saveNoteImages;
$on(saveImgSwitch, "change", () => setSync({ saveNoteImages: saveImgSwitch.checked }));

//Clip article folder path
const articleFolderInput = eId("clip-article-folder");
articleFolderInput.value = storeData.clipArticleFolderPath;
$on(articleFolderInput, "change", () => setSync({ clipArticleFolderPath: articleFolderInput.value }));

//Clip article filename format
const filenameFormatSelect = eId("filename-format");
filenameFormatSelect.value = storeData.fileNameFormat;
$on(filenameFormatSelect, "change", () => setSync({ fileNameFormat: filenameFormatSelect.value }));

//Download image folder path
const imageFolderInput = eId("image-folder");
imageFolderInput.value = storeData.imageFolderPath;
$on(imageFolderInput, "change", () => setSync({ imageFolderPath: imageFolderInput.value }));
