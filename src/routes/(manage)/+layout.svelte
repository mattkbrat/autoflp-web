<script lang="ts">
import { allAccounts, allInventory, deals } from "$lib/stores";
import { onMount } from "svelte";
export let data;
onMount(() => {
	deals.set(data.deals);
	allInventory.set(data.inventory);
	allAccounts.set(data.accounts);
});
</script>

<slot />
