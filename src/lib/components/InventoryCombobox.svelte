<script lang="ts">
import { goto } from "$app/navigation";
import { formatInventory } from "$lib/format";
import { allInventory, inventoryID, handleSelect } from "$lib/stores";
import ComboBox from "./ComboBox.svelte";

let filterActive = true;

export let selectType: "inventory" | "deal" = "inventory";

$: options = $allInventory.map((d) => {
	return {
		text: formatInventory(d, true, "|"),
		value: d.vin,
		state: d.state,
	};
});

$: filtered = options.filter((o) => o.state === 1);

const handleNav = (route: string) => {
	handleSelect("inventory", route);
	if (selectType === "inventory") {
		goto(`/inventory/${route}`);
	}
};
</script>

<div class="flex flex-row gap-4 print:hidden">
  <ComboBox
    label="Inventory"
    name="vin"
    placeholder="Select inventory"
    onSelect={handleNav}
    id="vin"
    options={selectType !== "inventory" || filterActive ? filtered : options}
    value={$inventoryID}
  />
  {#if selectType === "inventory"}
    <label class="label flex flex-row-reverse gap-x-1 self-center">
      Only Active
      <input type="checkbox" class="checkbox" bind:checked={filterActive} />
    </label>
  {/if}
</div>
