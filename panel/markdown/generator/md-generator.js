import { BlockMarker, InlineClassMark, blockElements, inlineMarkerClass } from "./enums.js";
import { Element } from "../element.js";

export class MarkdownGenerator {
	constructor() {}

	/**@param {Element[]} elements  */
	generate(elements) {
		this.markdown = [];
		this.insertChildElements(elements);
		return this.markdown.join("");
	}

	/**@param {Element[]} elements*/
	insertChildElements(elements, nestInfo) {
		for (let index = 0; index < elements.length; index++) {
			const element = elements[index];

			if (blockElements.has(element.tagName)) {
				this.insertBlockElement(element, nestInfo, index + 1);
				continue;
			}
			if (element.tagName === "table") this.insertTable(element);
			else this.insertInlineElement(element);
		}
	}

	insertInlineElement(element) {
		const tagName = element.tagName;
		if (inlineMarkerClass[tagName]) return this.insertInlineMarkElem(element, inlineMarkerClass[tagName]);
		if (element.type === "Text") return this.markdown.push(element.data ?? "");
		if (this.elements[tagName]) return this.elements[tagName]?.(element);
		for (const childElem of element.children) this.insertInlineElement(childElem);
	}

	elements = {
		a: this.insertLink.bind(this),
		img: this.insertImg.bind(this),
		tr: this.insertTableRow.bind(this),
		th: this.insertTableCell.bind(this),
		td: this.insertTableCell.bind(this),
	};

	/**@param {Element} element */
	insertBlockElement(element, nestInfo, index) {
		if (BlockMarker[element.tagName]) {
			this.insertBlockMarker(element, nestInfo, index);
			this.insertChildElements(element.children, nestInfo);
			return this.markdown.push("\n");
		}
		if (element.tagName === "ol" || element.tagName === "ul") {
			this.markdown.push("\n");
			const type = element.tagName === "ol" ? "counter" : element.tagName === "ul" && "list";
			let _nestInfo;
			if (nestInfo) {
				_nestInfo = { ...nestInfo };
				_nestInfo.nestLevel ? ++_nestInfo.nestLevel : (_nestInfo.nestLevel = 1);
				_nestInfo.type = type;
			} else _nestInfo = { type };
			return this.insertChildElements(element.children, _nestInfo);
		}
		if (element.tagName === "dd") this.markdown.push(":\t");
		if (element.tagName === "p") this.markdown.push("\n");
		this.insertChildElements(element.children);
	}

	/**@param {Element} element */
	insertBlockMarker(element, nestInfo, index) {
		let marker = BlockMarker[element.tagName];
		if (nestInfo) {
			nestInfo.type === "counter" && (marker = index + ".");
			nestInfo.nestLevel && this.markdown.push("\t".repeat(nestInfo.nestLevel));
		}
		this.markdown.push(marker + " ");
	}

	/**@param {Element} element */
	insertInlineMarkElem(element, type) {
		const mark = InlineClassMark[type];
		this.markdown.push(mark);
		for (const richElem of element.children) this.insertInlineElement(richElem);
		// this.markdown.at(-1); TODO trim
		this.markdown.push(mark + " ");
	}

	/**@param {Element} element */
	insertLink(element) {
		const linkTitle = element.children[0].data ?? element.children[0].children[0].data ?? "";
		const aLink = ` [${linkTitle}](${element.attributes.href}) `;
		this.markdown.push(aLink);
	}

	/**@param {Element} element */
	insertImg(element) {
		const imgTxt = `\n![${element.attributes.alt ?? ""}](${element.attributes.src}) `;
		this.markdown.push(imgTxt);
	}

	/**@param {Element} element */
	insertTable(element) {
		const tBody = element.children[0];
		const tHead = tBody.children.pop();
		this.insertTableRow(tHead);
		for (const rowElem of tHead.children) {
			this.markdown.push("|" + "-".repeat(rowElem.children[0].data?.length ?? 3));
		}
		this.markdown.push("|\n");

		for (const rowElem of tBody.children) this.insertTableRow(rowElem);
	}

	insertTableRow(tableRow) {
		for (const rowElem of tableRow.children) this.insertInlineElement(rowElem);
		this.markdown.push("|\n");
	}

	insertTableCell(tableRow) {
		this.markdown.push("|");
		for (const cellElem of tableRow.children) this.insertInlineElement(cellElem);
	}
}
