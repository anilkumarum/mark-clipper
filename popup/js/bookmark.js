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
	navigator.clipboard.writeText(markLink).then(
		() => toast("tab link copied"),
		() => {
			/* clipboard write failed */
		}
	);
}

async function appendCrtTabLink(markLink) {
	await appendToFile(noteSelector.value, "\n" + markLink);
	toast("tab link inserted");
}
