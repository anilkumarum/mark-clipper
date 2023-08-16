import Tokenizer from "./tokenizer.js";
import { Element, Text } from "../element.js";
import { trimRight } from "../../js/util.js";

export default class HTMLParser {
	root = { type: "root", children: [] };

	constructor() {
		this.tokenizer = new Tokenizer();
		this.setListener();
	}

	/** @param {string} tagName */
	openNewElement(tagName) {
		const element = new Element(tagName);
		this.addChildElement(element);
		this.nodeStack.push(element);
		this.openElem = element;
	}

	/**@public @param {string} buffer*/
	parse(buffer) {
		/**@type {Element[]} */
		this.nodeStack = [this.root];
		this.tokenizer.consume(buffer);

		const htmlElements = { type: "root", children: this.root.children };
		this.root = { type: "root", children: [] };
		return htmlElements;
	}

	/** @param {Element|Text} element*/
	addChildElement(element) {
		this.nodeStack.at(-1).children.push(element);
	}

	/** @param {string} attrName */
	setAttrName(attrName) {
		if (attrName.at(-1) === "=") this.attrName = attrName.slice(0, -1);
		else {
			this.openElem.attributes ??= {};
			this.openElem.attributes[attrName] = null;
		}
	}

	/** @param {string} attrVal*/
	setAttrValue(attrVal) {
		if (this.attrName === "style") return (this.attrName = null);
		this.openElem.attributes ??= {};
		const attrValue = attrVal;
		this.openElem.attributes[this.attrName || attrVal] = attrValue;
		this.attrName = null;
	}

	/** @param {string} data */
	addTextNode(data) {
		data = trimRight(data);
		data.length === 0 || this.addChildElement(new Text(data));
	}

	setSelfCloseElem() {
		this.openElem.children = undefined;
		this.closeCrtElement();
	}

	closeCrtElement() {
		this.nodeStack.pop();
		this.openElem = null;
	}

	setListener() {
		this.tokenizer.on("openelem", this.openNewElement.bind(this));
		this.tokenizer.on("attrname", this.setAttrName.bind(this));
		this.tokenizer.on("attrvalue", this.setAttrValue.bind(this));
		this.tokenizer.on("text", this.addTextNode.bind(this));
		this.tokenizer.on("selfcloseelem", this.setSelfCloseElem.bind(this));
		this.tokenizer.on("closeelem", this.closeCrtElement.bind(this));
		this.tokenizer.on("error", (err) => console.error(err));
	}
}
