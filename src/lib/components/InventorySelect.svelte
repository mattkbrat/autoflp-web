<script lang="ts">
import { allInventory } from "$lib/stores";
</script>

<select class="bg-surface-800 uppercase">
  {#each $allInventory as inventory}
    <option value={inventory.id}>
      {inventory.vin.slice(12, 17)} | {inventory.make}
      {inventory.model}
    </option>
  {/each}
</select>
