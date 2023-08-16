/**@type {chrome.tabs.query} */
export const getTabs = chrome.tabs.query.bind(chrome.tabs),
	getLs = localStorage.getItem.bind(localStorage),
	setLs = localStorage.setItem.bind(localStorage),
	/**@type {chrome.storage.StorageArea['get']} */
	getSync = chrome.storage.sync.get.bind(chrome.storage.sync),
	/**@type {chrome.storage.StorageArea['set']} */
	setSync = chrome.storage.sync.set.bind(chrome.storage.sync),
	/**@type {chrome.storage.StorageArea['get']} */
	getSession = chrome.storage.session.get.bind(chrome.storage.session),
	/**@type {chrome.storage.StorageArea['set']} */
	setSession = chrome.storage.session.set.bind(chrome.storage.session);
