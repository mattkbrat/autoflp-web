<script lang="ts">
import { allAccounts, allInventory, deals } from "$lib/stores";
import { onMount } from "svelte";
import type { LayoutData } from "./$types";
export let data: LayoutData;
onMount(() => {
	deals.set(data.deals);
	allInventory.set(data.inventory);
	allAccounts.set(data.accounts);
});
</script>

<div class="flex flex-col gap-4 flex-1">
  <slot />
</div>

<section class="hidden print:block mt-auto">
  <div class="grid grid-cols-3 border-t-2 border-black w-full mt-auto">
    <span class="text-left font-extrabold">
      {data.businessData.name}
    </span>
    <span class="text-center">
      {data.businessData.phone}
    </span>
    <span class="text-right">
      {data.businessData.address}
    </span>
  </div>
</section>
