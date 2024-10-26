<script lang="ts">
import { allCreditors } from "$lib/stores/accounts";
import { allInventory } from "$lib/stores/inventory.js";

const { data, children } = $props();

allCreditors.set(data.creditors);
allInventory.set(data.inventory);
</script>

<svelte:head>
  <title>Deals - AutoFLP</title>
</svelte:head>

{@render children()}
