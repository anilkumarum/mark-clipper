import { getSync } from "../../common/constant.js";
import { getVaultList } from "../../common/db/db.js";
import { setNoteList } from "../../common/file.js";
import { setVaultHandle } from "../../common/permission-request.js";

//vault-list
const noteSelector = eId("note_list");
const vaultList = eId("vault_list");
const vaults = await getVaultList();
for (const vault of vaults) {
	const option = document.createElement("option");
	option.text = option.value = vault;
	vaultList.add(option);
}
const { currentVault } = await getSync("currentVault");
vaultList.value = currentVault;
vaultList.onchange = async () => {
	await getSync({ currentVault: vaultList.value });
	await setVaultHandle();
	let i = noteSelector.options.length;
	while (--i) noteSelector.remove(i);
	setNoteList(noteSelector);
};

setTimeout(setNoteList, 1000, noteSelector);
