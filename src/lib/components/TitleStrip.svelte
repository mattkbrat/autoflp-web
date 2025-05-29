<script lang="ts">
import { dev } from "$app/environment";import FuzzyClock from "./FuzzyClock.svelte";</script>

<div class="flex-1 mx-4">
  <h1 class="text-4xl print:text-xs font-black">
    AutoFLP
    {#if dev}
      <span class="text-red-300"> DEV </span>
    {/if}
  </h1>
  <span class="text-lg print:text-xs print:hidden">
    Auto Dealer Management for Family Owned Businesses
  </span>
</div>
<div class="print:contents flex flex-row flex-wrap justify-between ml-auto">
  <FuzzyClock />
</div>
