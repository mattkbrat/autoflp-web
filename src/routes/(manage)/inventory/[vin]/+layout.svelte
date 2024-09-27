<script lang="ts">
import InventoryCombobox from "$lib/components/InventoryCombobox.svelte";
import { allInventory, allSalesmen } from "$lib/stores";
import { onMount } from "svelte";
import type { LayoutData } from "./$types";

export let data: LayoutData;

$: if (data.inventory.length !== $allInventory.length) {
	allInventory.set(data.inventory);
	allSalesmen.set(data.salesmen);
}
onMount(() => {
	allInventory.set(data.inventory);
});
</script>

<InventoryCombobox />

<slot />
