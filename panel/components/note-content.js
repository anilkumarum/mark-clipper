import { MarkdownGenerator } from "../markdown/generator/md-generator.js";
import HTMLParser from "../markdown/parser/parser.js";

/**@type {HTMLParser} */
let htmlParser;
/**@type {MarkdownGenerator} */
let markdownGenerator;

export class NoteContent extends HTMLElement {
	constructor() {
		super();
	}
	attachments = new Set();
	images = new Map();

	copyContent() {
		navigator.clipboard
			.writeText(this.innerText)
			.then(() => toast("Copied"))
			.catch((err) => console.error(err));
	}

	/**@param {InputEvent} event*/
	inputMarkHandler = (event) => {
		if (event.data && markChars.has(event.data)) {
			const char = event.data;
			const selection = getSelection();
			const txtNode = selection.focusNode;
			if (!(txtNode instanceof Text)) return;
			if (selection.anchorOffset !== selection.focusOffset) {
				selection.anchorNode["insertData"](selection.anchorOffset, char);
				txtNode.insertData(selection.focusOffset, Brackets[char] ? Brackets[char] : char);
				event.preventDefault();
			} else {
				txtNode.insertData(selection.focusOffset, Brackets[char] ? Brackets[char] : char);
				selection.setPosition(txtNode, selection.focusOffset);
			}
		}
	};

	insertContent(content) {
		const selection = getSelection();
		const txtNode = selection.focusNode;
		if (selection && txtNode instanceof Text) {
			txtNode.insertData(selection.focusOffset, content);
		} else this.append(content);
	}

	processPastedHtml(pasteData) {
		htmlParser ??= new HTMLParser();
		const parsedHtml = htmlParser.parse(pasteData);

		markdownGenerator ??= new MarkdownGenerator();
		const markdownData = markdownGenerator.generate(parsedHtml.children);
		this.insertContent(markdownData);
	}

	/**@param {InputEvent} event  */
	dropPasteHandler = (event) => {
		const pasteInfo = event.dataTransfer;
		const types = new Set(pasteInfo.types);
		if (types.has("text/uri-list") || types.has("Files")) {
			const imgUrl = pasteInfo.getData("text/uri-list");
			this.attachments.add(imgUrl);
			const imgPath = imgUrl.slice(imgUrl.lastIndexOf("/"));
			this.insertContent(`![${new Date().toISOString()}](.${imgPath})`);
			event.preventDefault();
		} else if (types.has("text/html")) {
			this.processPastedHtml(pasteInfo.getData("text/html"));
			event.preventDefault();
		} else {
		}
	};

	handleInputByType = {
		insertFromPaste: this.dropPasteHandler,
		insertFromDrop: this.dropPasteHandler,
	};

	connectedCallback() {
		this.setAttribute("contenteditable", "true");
		$on(this, "beforeinput", (event) => this.handleInputByType[event.inputType]?.(event));
	}
}

customElements.define("note-content", NoteContent);
