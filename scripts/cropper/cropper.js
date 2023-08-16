const button = document.querySelector("button");
$on(button, "click", async () => {
	const message = { msg: "captureShot" };
	const response = await chrome.runtime.sendMessage(message);
});
