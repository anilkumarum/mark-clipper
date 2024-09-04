import { getSync, setSync } from "../../js/constant.js";
import { getVaultList } from "../../db/vault-db.js";
import { FileNoteTree } from "./filenote-tree.js";
import { html } from "../../js/om.event.js";
// @ts-ignore
import drawerCss from "../../style/note-drawer.css" with { type: "css" };
import treeCss from "../../style/note-tree.css" with { type: "css" };

export class NoteDrawer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [drawerCss, treeCss];
	}

	async switchVault({ target }) {
		const currentVault = target.value;
		await setSync({ currentVault });
		this.fileTreeElem.switchVault(currentVault);
		chrome.runtime.sendMessage({ msg: "switch_vault", vault: currentVault });
	}

	createMdFile({ target }) {
		target.value && this.fileTreeElem.createMdFile(target.value + ".md");
		target.value = "";
		target.closest("details").open = false;
	}

	focusInputField(evt) {
		if (evt.newState !== "open") return;
		$("input", evt.target).focus();
	}

	render(vaults, currentVault) {
		return html`<header>
			<label title="${i18n("switch_vault")}">
				<img src="/assets/vault.svg" style="vertical-align: middle" />
				<select name="vault-changer" value=${currentVault} @change=${this.switchVault.bind(this)}>
					${vaults.map((vault) => `<option value="${vault}">${vault}</option>`).join("")}
				</select>
			</label>
			<details @toggle=${this.focusInputField}>
				<summary><clip-icon ico="file-plus" title="${i18n("create_new_note")}"></clip-icon></summary>
				<div><input type="text" placeholder="file name" @change=${this.createMdFile.bind(this)} /></div>
			</details>
		</header>`;
	}

	async connectedCallback() {
		this.id = "note-drawer";
		this.setAttribute("popover", "");
		const vaults = await getVaultList();
		const { currentVault } = await getSync("currentVault");
		this.shadowRoot.replaceChildren(this.render(vaults, currentVault));
		this.fileTreeElem = new FileNoteTree();
		this.shadowRoot.appendChild(this.fileTreeElem);
		this.showPopover();
		$("select", this.shadowRoot.firstElementChild).value = currentVault;
	}
}

customElements.define("note-drawer", NoteDrawer);
