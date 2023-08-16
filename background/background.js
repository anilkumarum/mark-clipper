import { attachments, createNoteCxtMenu, getVaultHandle } from "./attachment.js";
import { captureScreenshot, injectCropper } from "./screenshot.js";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request.msg === "captureShot") {
		captureScreenshot(request.cordinate, request.noteName).then(sendResponse);
		return true;
	}
	if (request.msg === "vault_access") getVaultHandle(request.vault).then(createNoteCxtMenu);
});

//contextmenu handler
const contextHandler = {
	vaultPermission: () => chrome.tabs.create({ url: "/permission/index.html" }),
	"clipContent.md": (info) => attachments[info.mediaType]?.(info.srcUrl, info.menuItemId, info.pageUrl),
};

chrome.contextMenus.onClicked.addListener((info) =>
	contextHandler[info.parentMenuItemId]
		? contextHandler[info.parentMenuItemId](info)
		: contextHandler[info.menuItemId](info)
);
