import { CharCode, IgnoreTags } from "./enums.js";
import { EventEmitter } from "../EventEmitter.js";

export default class Tokenizer extends EventEmitter {
	sectionStart = -1;
	index = -1;
	size = 0;

	constructor() {
		super();
	}

	fastForwardTo(code) {
		while (this.buffer.charCodeAt(++this.index) !== code) if (this.index === this.size) break;
		return true;
	}

	longRunButStopAt(code, stopCode, stopCode2) {
		while (this.buffer.charCodeAt(++this.index) !== code)
			if (this.buffer.charCodeAt(this.index) === stopCode || this.buffer.charCodeAt(this.index) === stopCode2)
				return true;
	}

	/** @param {string} evtName*/
	emitData(evtName) {
		const data = this.buffer.slice(this.sectionStart, this.index);
		this.emit(evtName, data);
	}

	closingTag() {
		this.sectionStart > 0 && this.emitData("text");
		this.sectionStart = this.index;
		this.fastForwardTo(CharCode.Gt);
		this.emitData("closeelem");
		this.sectionStart = this.index + 1; //skip ">"
	}

	afterOpeningTagEnd() {
		if (this.buffer.charCodeAt(this.index + 1) === CharCode.Slash) this.emitData("selfcloseelem");
		this.sectionStart = this.index + 1; //skip ">"
	}

	extractAttribute() {
		this.sectionStart = this.index;
		while (this.buffer.charCodeAt(++this.index) !== CharCode.Gt) {
			const code = this.buffer.charCodeAt(this.index);
			if (code === CharCode.DoubleQuote) {
				//attribute key
				++this.sectionStart; //skip "
				this.emitData("attrname");
				this.sectionStart = this.index + 1; //skip "
				this.fastForwardTo(CharCode.DoubleQuote);

				//attribute value
				this.emitData("attrvalue");
				this.sectionStart = this.index + 1;
			}
		}

		this.sectionStart === this.index || this.emitData("attrname");
		this.afterOpeningTagEnd();
	}

	openNewElem() {
		this.sectionStart > 0 && this.emitData("text");
		this.sectionStart = ++this.index; //skip "<"
		const isMidHalt = this.longRunButStopAt(CharCode.Gt, CharCode.Space, CharCode.LineBreak);
		//only accept a tag attributes
		const tagName = this.buffer.slice(this.sectionStart, this.index);
		// IgnoreTags.has(tagName) || this.emit("openelem", tagName);
		this.emit("openelem", tagName);
		if (!isMidHalt) return this.afterOpeningTagEnd();

		if (tagName === "a" || tagName === "img") this.extractAttribute();
		else this.fastForwardTo(CharCode.Gt);
		this.sectionStart = this.index + 1; //skip ">"
		//TODO extract text-color
	}

	/** @param {string} buffer */
	consume(buffer) {
		this.buffer = buffer;
		this.size = buffer.length;

		while (++this.index < this.size) {
			const code = this.buffer.charCodeAt(this.index);

			if (code === CharCode.Lt) {
				this.buffer.charCodeAt(this.index + 1) === CharCode.Slash ? this.closingTag() : this.openNewElem();
			}
		}
		//rest after finish
		this.buffer = null;
		this.index = -1;
		return true;
	}
}
