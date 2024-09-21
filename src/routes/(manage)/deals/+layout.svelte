<script lang="ts">
import { allCreditors, allSalesmen } from "$lib/stores/accounts";
import { allInventory } from "$lib/stores/inventory.js";

export let data;

console.log({ data });
allCreditors.set(data.creditors);
allSalesmen.set(data.salesmen);
allInventory.set(data.inventory);
</script>

<svelte:head>
  <title>Deals - AutoFLP</title>
</svelte:head>

<slot />
