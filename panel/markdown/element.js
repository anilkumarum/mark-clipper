export class Element {
	constructor(tagName, attributes) {
		this.type = "Element";
		this.tagName = tagName;
		this.attributes = attributes;
		this.children = [];
	}
}

export class Text {
	constructor(data) {
		this.type = "Text";
		this.data = data;
	}
}
