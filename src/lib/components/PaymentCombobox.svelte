<script lang="ts">
import { fullNameFromPerson } from "$lib/format";
import { accountID, deals, handleSelect } from "$lib/stores";
import ComboBox from "./ComboBox.svelte";

let filterActive = true;

$: options = $deals.map((d) => {
	const dealLink = `/payments/${d.account.id}/${d.id}`;
	const fullName = fullNameFromPerson({ person: d.account.contact });
	const text = `${fullName} | ${d.inventory.make} ${
		d.inventory.model
	} | ${d.inventory.vin?.slice(-6)}`;
	return {
		text,
		value: dealLink,
		state: d.state,
	};
});

$: filtered = options.filter((o) => o.state === 1);
const handlePaymentNavigation = (route: string) => {
	if (typeof route !== "string") {
		console.error("Invalid route", route);
		return;
	}
	console.log("nav", route);
	if (!route || !route.startsWith("/payments")) {
		console.log("Invalid selection", route);
		return;
	}

	const [account, deal] = route.split("/").slice(-2);
	handleSelect("account", account);
	handleSelect("deal", deal);
};
</script>

<div class="flex flex-row gap-4 print:hidden">
  <ComboBox
    label="Accounts"
    name="account"
    placeholder="Select an account"
    onSelect={handlePaymentNavigation}
    options={filterActive ? filtered : options}
    value={$accountID.value}
  />

  <label class="label flex flex-row-reverse gap-x-1 self-center">
    Only Active
    <input type="checkbox" class="checkbox" bind:checked={filterActive} />
  </label>
</div>
