import alertCss from "../../style/alert-box.css" assert { type: "css" };

class AlertBox extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [alertCss];
	}

	show = (noticeTxt, type = "success") => {
		this.box.className = type;
		this.box.children[1].textContent = noticeTxt;
		this.showPopover();
		setTimeout(() => this.hidePopover(), 4100);
	};

	render() {
		return `<div>
				<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d='M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' /></svg>
				<span class="notice-txt"></span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
			</div>`;
	}

	connectedCallback() {
		this.id = "alert-box";
		this.setAttribute("popover", "");
		this.shadowRoot.innerHTML = this.render();
		this.box = this.shadowRoot.firstElementChild;
		this.box.lastElementChild.addEventListener("click", () => this.hidePopover());
	}
}

customElements.define("alert-box", AlertBox);
const alertBox = new AlertBox();
document.body.appendChild(alertBox);
globalThis.notify = alertBox.show;
