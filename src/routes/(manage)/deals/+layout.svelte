<script lang="ts">
import { allCreditors } from "$lib/stores/accounts";
import { allInventory } from "$lib/stores/inventory.js";
import type { LayoutData } from "./$types";

export let data: LayoutData;

allCreditors.set(data.creditors);
allInventory.set(data.inventory);
</script>

<svelte:head>
  <title>Deals - AutoFLP</title>
</svelte:head>

<slot />
