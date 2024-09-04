import { appendToFile, setNoteList } from "../../common/file.js";

const bookmarkBtn = eId("bookmark");
const noteSelector = $("select", bookmarkBtn);
$on(bookmarkBtn, "click", insertCrtTabLink);

async function insertCrtTabLink() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const markLink = `[${tab.title}](${tab.url})`;
	const insertType = $("select", bookmarkBtn).value;
	insertType === "copy" ? copyTabLink(markLink) : appendCrtTabLink(markLink);
}

function copyTabLink(markLink) {
	navigator.clipboard
		.writeText(markLink)
		.then(() => toast(i18n("Copied")))
		.catch(() => toast("Clipboard write failed"));
}

async function appendCrtTabLink(markLink) {
	const { currentVault } = await getSync("currentVault");
	const vaultHandle = await getVault(currentVault);
	await appendToFile(noteSelector.value, "\n" + markLink, vaultHandle);
	toast(i18n("tab_link_inserted"));
}
