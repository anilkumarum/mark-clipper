import icons from "/assets/icons.json" assert { type: "json" };

class ClipNoteIcon extends HTMLElement {
	/* static get observedAttributes() {
		return ["ico"];
	} */

	constructor() {
		super();
	}

	set ico(newIcon) {
		this.firstElementChild.innerHTML = icons[newIcon];
	}

	render(path) {
		return `<svg  viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">${icons[path]}</svg>`;
	}

	connectedCallback() {
		this.innerHTML = this.render(this.getAttribute("ico"));
	}

	/* attributeChangedCallback(name, _, newIcon) {
		name === "ico" &&
			icons[newIcon] &&
			this.firstElementChild &&
			(this.firstElementChild.innerHTML = icons[newIcon]);
	} */
}

customElements?.define("clip-icon", ClipNoteIcon);
