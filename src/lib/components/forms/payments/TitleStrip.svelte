<script lang="ts">
const { inventory, fullName, salesmen } = $props();</script>

<h2 class="flex flex-col uppercase items-center bg-black/20 py-2 relative">
  <span class="text-lg tracking-tight">
    {fullName}
  </span>
  <span class={"text-2xl"}>
    {inventory}
  </span>
  <span class="print:hidden text-gray-300 absolute top-2 right-2">
    {#if salesmen}
      Sold by {salesmen}
    {:else}
      No salesman
    {/if}
  </span>
</h2>
