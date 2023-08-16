import { writeScreenshotFile } from "./attachment.js";

async function getCroppedBlob(shotBlob, cord) {
	const imageBitmap = await createImageBitmap(shotBlob, cord.x, cord.y, cord.width, cord.height);

	const canvas = new OffscreenCanvas(cord.width, cord.height);
	const ctx = canvas.getContext("bitmaprenderer");
	ctx.transferFromImageBitmap(imageBitmap);
	imageBitmap.close();
	return await canvas.convertToBlob({ type: shotBlob.type });
}

export async function captureScreenshot(cordinate, noteName) {
	try {
		const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
		const shotBlob = await (await fetch(img64Url)).blob();
		const croppedBlob = await getCroppedBlob(shotBlob, cordinate);
		writeScreenshotFile(croppedBlob, noteName);
	} catch (error) {
		console.log(error);
	}
}

export async function injectCropper() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	try {
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: ["scripts/cropper/cropper.js"],
		});
	} catch (error) {
		console.log(error);
	}
}
