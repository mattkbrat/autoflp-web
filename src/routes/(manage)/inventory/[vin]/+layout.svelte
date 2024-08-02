<script lang="ts">
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

<a
  class="underline font-bold text-secondary-300 hover:text-secondary-200"
  href={"/inventory/cars-for-sale"}
>
  Manage Cars for Sale
</a>

<InventorySelect />;

<slot />
