import { getSync, setSync } from "./constant.js";
import { getVault, getVaultList } from "./db/db.js";
import { checkAccess } from "./file.js";
import cnfDeleteCss from "./permission-request.css" assert { type: "css" };

export class PermissionRequest extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [cnfDeleteCss];
	}

	set vault(vault) {
		this.dialogElem.showModal();
		this.dialogElem.children[1].lastElementChild.textContent = vault;
	}

	render(vaults) {
		return `<dialog>
				<h2>Permission Required</h2>
				<div>vault:<span></span></div>
				<div class="msg-text">
					Permission is revoked due to reload tab.<br>
				 	Pls give permission again
				</div>
				<div class="action-block">
					<select name="vault-changer">
						<option value="change" selected disabled>Change Vault</option>
						${vaults.map((vault) => `<option value="${vault}">${vault}</option>`).join("")}
					</select>
					<button style="--btn-clr:lime">Give Access</button>
				</div>
			</dialog>`;
	}

	async connectedCallback() {
		const vaults = await getVaultList();
		this.shadowRoot.innerHTML = this.render(vaults);
		this.dialogElem = this.shadowRoot.firstElementChild;
		const actionBlock = this.dialogElem.lastElementChild;
		$on(actionBlock.firstElementChild, "change", this.changeVault.bind(this));
		$on(actionBlock.lastElementChild, "click", this.openPermissionTab.bind(this));
	}

	async changeVault({ target }) {
		const vault = target.value;
		await setSync({ currentVault: vault });
		this.dialogElem.close();
		setVaultHandle();
	}

	async openPermissionTab(action) {
		const url = chrome.runtime.getURL("/permission/index.html");
		const [tab] = await chrome.tabs.query({ url });
		tab ? await chrome.tabs.update(tab.id, { active: true }) : await chrome.tabs.create({ url });
		this.dialogElem.close();
	}
}

customElements.define("permission-request", PermissionRequest);

export let vaultHandle;
let permissionRequest;
export async function setVaultHandle() {
	const { currentVault } = await getSync("currentVault");
	if (!currentVault) return firstTimePermission(); //
	vaultHandle = await getVault(currentVault).catch((err) => console.log(err));
	const hasAccess = await checkAccess(vaultHandle);
	hasAccess ? fireEvent(document.body, "vaultchange") : showPermissionDialog();
	return vaultHandle;
}

function showPermissionDialog() {
	if (!permissionRequest) {
		permissionRequest ??= new PermissionRequest();
		document.body.appendChild(permissionRequest);
	}
	setTimeout(() => (permissionRequest.vault = vaultHandle?.name), 100);
}

function firstTimePermission() {
	showPermissionDialog();
	//TODO create first time banner
}
