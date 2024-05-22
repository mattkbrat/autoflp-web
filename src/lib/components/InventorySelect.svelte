<script lang="ts">
import { goto } from "$app/navigation";
import { allInventory } from "$lib/stores";
</script>

<select class="bg-surface-800 uppercase" on:blur={(e) => e.target && goto(`/inventory/${e.target.value}`) }>
  {#each $allInventory as inventory}
    <option value={inventory.vin}>
      {inventory.vin.slice(12, 17)} | {inventory.make}
      {inventory.model}
    </option>
  {/each}
</select>
