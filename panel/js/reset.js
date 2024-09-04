globalThis.eId = document.getElementById.bind(document);
// Get element by CSS selector:
globalThis.$ = (selector, /** @type {Element} */ scope) => (scope || document).querySelector(selector);
// addEventListener wrapper:
globalThis.$on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);
globalThis.$onO = (target, type, callback) => target.addEventListener(type, callback, { once: true });

//dispatch new event
globalThis.fireEvent = (/** @type {HTMLElement} */ target, /** @type {string} */ eventName, detail) =>
	target.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent(eventName));

/**@type {chrome.i18n.getMessage} */
globalThis.i18n = chrome.i18n.getMessage.bind(chrome.i18n);
globalThis.setLang = (/** @type {string} */ key) => (eId(key).textContent = chrome.i18n.getMessage(key));

/**@type {chrome.storage.LocalStorageArea['get']} */
globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
/**@type {chrome.storage.LocalStorageArea['set']} */
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

const snackbar = eId("snackbar");
globalThis.toast = (msg) => {
	snackbar.hidden = false;
	snackbar.textContent = msg;
	setTimeout(() => (snackbar.hidden = true), 5100);
};
