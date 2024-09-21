<script lang="ts">
import InventoryCombobox from "$lib/components/InventoryCombobox.svelte";
import { allInventory } from "$lib/stores";
import { onMount } from "svelte";
import type { LayoutData } from "./$types";

export let data: LayoutData;

$: if (data.inventory.length !== $allInventory.length) {
	allInventory.set(data.inventory);
}
onMount(() => {
	allInventory.set(data.inventory);
});
</script>

<InventoryCombobox />

<slot />
