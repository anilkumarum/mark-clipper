globalThis.register ??= (elemTag, Class) => customElements?.define(elemTag, Class);

globalThis.eId = document.getElementById.bind(document);
//dispatch new event
globalThis.fireEvent = (target, eventName, detail) =>
	target.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName));
// addEventListener wrapper:
globalThis.$on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);
globalThis.$onO = (target, type, callback) => target.addEventListener(type, callback, { once: true });
// Get element by CSS selector:
globalThis.$ = (selector, scope) => (scope || document).querySelector(selector);

/**@type {chrome.storage.LocalStorageArea['get']} */
globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
/**@type {chrome.storage.LocalStorageArea['set']} */
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

const snackbar = eId("snackbar");
globalThis.toast = (msg) => {
	snackbar.hidden = false;
	snackbar.innerText = msg;
	setTimeout(() => (snackbar.hidden = true), 5100);
};
