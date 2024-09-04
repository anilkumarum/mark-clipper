import { getReverseDomain } from "../panel/js/util.js";

export async function getPageTitle(pageUrl) {
	const url = new URL(pageUrl);
	const escapeRx = new RegExp(/[\s:|?<>/~#^*\[\]]/g);
	// biome-ignore format:
	const pageTitle = (await injectFuncScript(() => document.title)) ?? pageUrl.replaceAll(escapeRx, "").slice(0, 50);
	const variables = {
		date: new Date().toLocaleDateString("default", { dateStyle: "medium" }).replaceAll(" ", "-"),
		pageTitle: pageTitle.replaceAll(" ", "-").replaceAll(escapeRx, "").slice(0, 100),
		reverseDate: new Date().toISOString().slice(0, 10),
		domain: url.host,
		reverseDomain: getReverseDomain(url.host),
	};
	let { fileNameFormat } = await chrome.storage.sync.get("fileNameFormat");
	fileNameFormat ||= "date-pageTitle";
	for (const varName in variables) fileNameFormat = fileNameFormat.replace(varName, variables[varName]);
	return fileNameFormat + ".md";
}

export async function checkPermission(tabIdx) {
	const hasPermission = await chrome.permissions.contains({ origins: ["<all_urls>"] });
	if (hasPermission) return true;

	let tabId;
	try {
		await chrome.runtime.sendMessage("knock knock");
		tabId = (await chrome.storage.session.get("permissionTabId")).permissionTabId;
		const tab = await chrome.tabs.get(tabId);
		tab.active || (await chrome.tabs.update(tabId, { active: true }));
	} catch (error) {
		tabId = (await chrome.tabs.create({ url: "/permission/index.html", index: tabIdx + 1 })).id;
		await new Promise((r) => setTimeout(r, 1000));
	} finally {
		const granted = await chrome.tabs.sendMessage(tabId, "requestHostPermission");
		if (granted) {
			chrome.storage.local.set({ hightlightOn: true });
			chrome.tabs.onUpdated.addListener(onUpdateTab);
		}
		return granted;
	}
}

//Listen Tab update for highlight
/**@param {number} tabId, @param {chrome.tabs.Tab} tab*/
export async function onUpdateTab(tabId, info, tab) {
	if (info.status === "complete") {
		if (!tab.url) return;
		const pageId = tab.url.split("#", 1)[0].slice(8, 100);
		const highlighted = (await getStore(pageId))[pageId] !== undefined;
		if (!highlighted) return;
		chrome.scripting
			.executeScript({
				target: { tabId: tabId },
				files: ["scripts/highlighter/highlighterCmd.js"],
			})
			.catch((err) => console.error(err));
	}
}

/**@param {string[]} scripts*/
export async function injectScript(...scripts) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: scripts });
	} catch (error) {
		const errMsg =
			"Cannot access contents of the page. Extension manifest must request permission to access the respective host.";
		if (error.message === errMsg) {
			const { id } = await chrome.tabs.create({ url: "/permission/index.html", index: tab.index + 1 });
			await new Promise((r) => setTimeout(r, 1000));
			const granted = await chrome.tabs.sendMessage(id, "requestHostPermission");
			if (granted) await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: scripts });
		}
		console.info(error);
	}
}

/**@param {(...args: any[]) => any} func*/
export async function injectFuncScript(func, ...args) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: func,
			args: args,
		});
		return results[0].result;
	} catch (error) {
		console.error(error);
	}
}

export async function reportBug(error) {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const { id } = await chrome.tabs.create({ url: "/permission/index.html", index: tab.index + 1 });
	await new Promise((r) => setTimeout(r, 1000));
	chrome.runtime.sendMessage({ msg: "reportBug", error });
}
