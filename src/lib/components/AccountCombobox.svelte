<script lang="ts">
import { goto } from "$app/navigation";
import { fullNameFromPerson } from "$lib/format";
import { accountID, allAccounts, handleSelect } from "$lib/stores";
import { derived } from "svelte/store";
import ComboBox from "./ComboBox.svelte";

export let selectType: "account" | "deal" = "account";

$: console.log("combobox", $allAccounts);
const options = derived(allAccounts, ($acc) =>
	$acc.map((d) => {
		const fullName = fullNameFromPerson({ person: d.contact });
		return {
			text: `${fullName} | ${d.licenseNumber}`,
			value: d.id,
			state: 1,
		};
	}),
);

const handleNavigation = (route: string) => {
	handleSelect("account", route);
	if (selectType === "account") {
		goto(`/accounts/${route}`);
	}
};
</script>

<div class="flex flex-row gap-4 print:hidden">
  <ComboBox
    label="Accounts"
    id={"account"}
    name="account"
    placeholder="Select an account"
    onSelect={handleNavigation}
    options={$options}
    value={$accountID}
  />
</div>
