<script lang="ts">
import { formatInventory, fullNameFromPerson } from "$lib/format";
import { accountID, deals, handleSelect } from "$lib/stores";
import ComboBox from "./ComboBox.svelte";

let filterActive = true;

$: options = $deals.map((d) => {
	const dealLink = `/payments/${d.account.id}/${d.id}`;
	const fullName = fullNameFromPerson({
		person: d.account.contact,
		titleCase: false,
	});
	const { vin, ...inv } = d.inventory;
	const inventory = formatInventory(inv);
	return {
		text: [fullName.toUpperCase(), inventory, vin.slice(-6).toUpperCase()].join(
			"|",
		),
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
	if (!route || !route.startsWith("/payments")) {
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
    value={$accountID}
  />

  <label class="label flex flex-row-reverse gap-x-1 self-center w-fit">
    Only Active
    <input type="checkbox" class="checkbox" bind:checked={filterActive} />
  </label>
</div>
