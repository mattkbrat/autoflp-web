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

<slot />

<section class="invisible print:visible">
  <div
    class="flex flex-col border-t-2 border-black w-full justify-between items-center"
  >
    <span class="flex flex-row py-2">
      <span class="flex-1">
        {data.businessData.name}
      </span>
      <span class="border-l-2 border-black mx-2 h-4 my-auto"> </span>
      <span>
        {data.businessData.phone}
      </span>
    </span>
    <span>
      {data.businessData.address}
    </span>
  </div>
</section>
