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
