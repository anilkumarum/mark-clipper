import { setSync } from "../../common/constant.js";
import { getAllVault, getVault } from "../../common/db/db.js";

const vaultTable = $("table");

export function insertVault(vault, hasAccess) {
	const vaultRow = vaultTable.insertRow();
	const nameCell = vaultRow.insertCell(0);
	nameCell.appendChild(new Text(vault));

	const statusCell = vaultRow.insertCell(1);
	statusCell.innerHTML = `<svg class="${hasAccess ? "check" : "cross"}" viewBox="0 0 24 24">
        <path></path>
    </svg>
    <span>${hasAccess ? "Granted" : "Revoked"}</span>`;

	const actionCell = vaultRow.insertCell(2);
	const actionBtn = document.createElement("button");
	actionBtn.style.setProperty("--btn-clr", hasAccess ? "red" : "lime");
	actionBtn.textContent = hasAccess ? "Revoke" : "Grant Access";
	actionCell.appendChild(actionBtn);
	$on(actionBtn, "click", hasAccess ? revokePermission : requestPermission.bind(null, vault));
}

const vaultList = await getAllVault();
const options = { mode: "readwrite" };
export const checkAccess = async (vaultHandle) => (await vaultHandle.queryPermission(options)) === "granted";
vaultList.forEach(async (vault) => {
	// @ts-ignore
	const hasAccess = await checkAccess(vault.vaultHandle);
	insertVault(vault.vaultId, hasAccess);
});

async function requestPermission(vaultName, { currentTarget }) {
	const options = { mode: "readwrite" };
	const vaultHandle = await getVault(vaultName);
	// @ts-ignore
	const isGranted = (await vaultHandle.requestPermission(options)) === "granted";
	if (isGranted) {
		currentTarget.style.setProperty("--btn-clr", "red");
		currentTarget.textContent = "Revoke";
		const statusCell = currentTarget.parentElement.previousElementSibling;
		statusCell.firstElementChild.setAttribute("class", "check");
		statusCell.lastElementChild.textContent = "Granted";
		await setSync({ currentVault: vaultHandle.name });
		chrome.runtime.sendMessage({ msg: "vault_access", vault: vaultHandle.name });
	} else {
		toast("permission denied");
	}
}

function revokePermission({ currentTarget }) {
	currentTarget.closest("tr").remove();
	//TODO remove from db
}
