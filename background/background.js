import { attachments, createNoteCxtMenu, getVaultHandle } from "./attachment.js";
import { captureScreenshot, injectCropper } from "./screenshot.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request["mdContent"]) {
		new ContentWriter().appendContentInVaultNote(request["mdContent"], request.noteName).then(sendResponse);
		return true;
	} else if (request.msg === "captureShot") {
		new Screenshoter(request.coordinate, request.screenHeight, sender.tab.id)
			.captureAndSave(request)
			.then(sendResponse);
		return true;
	} else if (request.msg === "switch_vault") {
		getStore("ctxMenuNoteList").then(({ ctxMenuNoteList }) => {
			ctxMenuNoteList?.forEach((id) => chrome.contextMenus.remove(id));
			chrome.storage.local.remove("ctxMenuNoteList");
			setSync({ currentVault: request.vault });
			new VaultHandler(request.vault).setVaultNoteOptions().then(sendResponse);
		});
		return true;
	} else if (request.msg === "sync_mdNotes") {
		new VaultHandler(request.vault).addNewCreatedMdNotes(request.vault);
	} else if (request.msg === "add_new_note_cxt_menu") {
		addNoteContextMenu(request.notePath).then(sendResponse);
		return true;
	} else if (request.msg === "save_file") {
		new ContentWriter().writeAttachmentFile(request.srcUrl, request.notePath, request.fileType).then(sendResponse);
		return true;
	} else if (request.msg == "toggle_highlight") {
		request.hightlightOn
			? chrome.tabs.onUpdated.addListener(onUpdateTab)
			: chrome.tabs.onUpdated.removeListener(onUpdateTab);
	} else if (request === "checkPermission") {
		checkPermission(sender.tab.index).then(sendResponse);
		return true;
	} else if (request.error) {
		request.error && sendCollectedBug(request.error);
	}
});

//contextmenu handler
const contextHandler = {
	vaultPermission: () => chrome.tabs.create({ url: "/permission/index.html" }),
	"clipContent.md": (info) => attachments[info.mediaType]?.(info.srcUrl, info.menuItemId, info.pageUrl),
};

chrome.contextMenus.onClicked.addListener((info) =>
	contextHandler[info.parentMenuItemId]
		? contextHandler[info.parentMenuItemId](info)
		: contextHandler[info.menuItemId](info),
);

//command-handler
const commands = {
	screenshot: () => injectScript("scripts/screenshot/cropper.js"),
	multi_select_text: () => injectScript("scripts/manual-clip.js"),
};
chrome.commands.onCommand.addListener((command) => commands[command]?.());

//On Startup
chrome.runtime.onStartup.addListener(() => new VaultHandler().addNewCreatedMdNotes());

export const setInstallation = ({ reason }) => {
	async function oneTimeInstall() {
		setSync({
			AVA_TAR: crypto.randomUUID(),
			contextMenu: ["selection", "image"],
			vaultLastNote: {},
			domainFolder: false,
			saveNoteImages: false,
			willSaveArticleImages: false,
			"enableCtrl+Copy": false,
			articleClipType: "full_page",
			imageFolderPath: "images",
			clipArticleFolderPath: "",
			fileNameFormat: "date-pageTitle",
			theme: { fontSize: 16, fontFamily: "", background: "none", textColor: "" },
			frontMatter: {
				createdAt: '{ "dateStyle": "medium","timeStyle":"short" }',
				source: true,
				title: true,
				tags: true,
				author: true,
				writtenAt: null,
				domain: null,
			},
		});
		const LAMBA_KD = crypto.randomUUID();
		setStore({ crtVaultNotes: [], hightlightOn: false, extUserId: LAMBA_KD });
		chrome.tabs.create({ url: "/guide/how-to-use.html" });
		//> uninstall survey setup
		const SURVEY_URL = `https://uninstall-feedback.pages.dev/?e=${chrome.runtime.id}&u=${LAMBA_KD}`;
		chrome.runtime.setUninstallURL(SURVEY_URL);
	}
	reason === "install" && oneTimeInstall();
	reason === "update" && onUpdate();

	function onUpdate() {
		setSync({
			articleClipType: "full_page",
			imageFolderPath: "images",
			clipArticleFolderPath: "",
			fileNameFormat: "date-pageTitle",
		});
		chrome.tabs.create({ url: "guide/changelog.html" });
		chrome.storage.local.remove("ctxMenuNoteList").then(() => new VaultHandler().setVaultNoteOptions());
	}
	//register context menu
	createContextMenu();
};
