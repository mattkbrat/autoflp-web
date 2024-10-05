<script lang="ts">
import { goto } from "$app/navigation";
import { accountID, accountOptions, handleSelect } from "$lib/stores";
import ComboBox from "./ComboBox.svelte";

export let selectType: "account" | "deal" = "account";

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
    options={selectType === 'account' ? $accountOptions.concat({ text: "New", value: "new", state: 1 }) : $accountOptions}
    value={$accountID}
  />
</div>
