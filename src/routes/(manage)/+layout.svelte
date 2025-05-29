<script lang="ts">
import Head from "$lib/components/Head.svelte";import Toast from "$lib/components/Toast.svelte";import { allAccounts, allInventory, deals } from "$lib/stores";import { onMount } from "svelte";const { data, children } = $props();onMount(() => {	deals.set(data.deals);	allInventory.set(data.inventory);	allAccounts.set(data.accounts);});</script>

<Toast />
<div class="flex flex-col gap-4 flex-1">
  {@render children()}
</div>
<section class="hidden print:block mt-auto">
  <Head />
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
