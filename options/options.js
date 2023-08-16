import "./style/style.css";
import "./style/block.css";
import "./style/config.css";

const eId = document.getElementById.bind(document);
const $on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);
const getSync = chrome.storage.sync.get.bind(chrome.storage.sync);
export const setSync = chrome.storage.sync.set.bind(chrome.storage.sync);

const { contextMenu, frontMatter } = await getSync(["contextMenu", "frontMatter"]);

$on(eId("context_menu"), "change", ({ target }) => {
	const targetType = target.value;
	if (target.checked) contextMenu.push(targetType);
	else {
		const idx = contextMenu.findIndex((item) => item === targetType);
		contextMenu.splice(idx, 1);
	}
	setSync({ contextMenu });
});
