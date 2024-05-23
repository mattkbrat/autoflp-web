<script lang="ts">
import AccountDealTabs from "$lib/components/AccountDealTabs.svelte";
import AccountSelect from "$lib/components/AccountSelect.svelte";
import InventorySelect from "$lib/components/InventorySelect.svelte";
import { allInventory } from "$lib/stores";
import { onMount } from "svelte";

export let data;

$: if (data.inventory.length !== $allInventory.length) {
	allInventory.set(data.inventory);
}
onMount(() => {
	allInventory.set(data.inventory);
});
</script>

<InventorySelect />
<slot />
