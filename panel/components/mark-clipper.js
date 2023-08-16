import "../js/clip-icon.js";
import "../../common/reset.js";
import "./note-opener.js";
import "./helper/alert-box.js";

import baseCss from "../style/base.css" assert { type: "css" };
import openerCss from "../style/note-opener.css" assert { type: "css" };
import noteCss from "../style/note-card.css" assert { type: "css" };
document.adoptedStyleSheets = [baseCss, openerCss, noteCss];

import { extractTabContent } from "./note-container.js";
import { setVaultHandle } from "../../common/permission-request.js";
setTimeout(setVaultHandle, 1000);

chrome.runtime.onMessage.addListener(async (request) => {
	if (request.msg === "clip_article") extractTabContent(request);
	else if (request.msg === "vault_access") setVaultHandle();
});
