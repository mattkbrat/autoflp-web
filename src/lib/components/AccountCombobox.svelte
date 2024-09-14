<script lang="ts">
import { goto } from "$app/navigation";
import { fullNameFromPerson } from "$lib/format";
import { deals } from "$lib/stores";
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
const handleNavigation = (route: string) => {
	if (!route.startsWith("/payments")) {
		console.log("Invalid selection", route);
		return;
	}

	goto(route);
};
</script>

<div class="flex flex-row gap-4 print:hidden">
  <ComboBox
    label="Accounts"
    name="account"
    placeholder="Select an account"
    onSelect={handleNavigation}
    options={filterActive ? filtered : options}
  />

  <label class="label flex flex-row-reverse gap-x-1 self-center">
    Only Active
    <input type="checkbox" class="checkbox" bind:checked={filterActive} />
  </label>
</div>
