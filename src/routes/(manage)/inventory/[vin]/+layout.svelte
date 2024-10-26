<script lang="ts">
import InventoryCombobox from "$lib/components/InventoryCombobox.svelte";
import { allInventory, allSalesmen } from "$lib/stores";
import { onMount } from "svelte";

const { data, children } = $props();

$effect(() => {
	if (data.inventory.length === $allInventory.length) return;
	allInventory.set(data.inventory);
	allSalesmen.set(data.salesmen);
});
onMount(() => {
	allInventory.set(data.inventory);
});
</script>

<InventoryCombobox selectType="inventory" />

{@render children()}
