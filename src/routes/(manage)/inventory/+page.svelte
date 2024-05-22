<script lang="ts">
import { page } from "$app/stores";
import { allInventory } from "$lib/stores";
</script>

<h2>
    {$page.url.pathname}
</h2>


<select class="bg-surface-800 uppercase">
    {#each $allInventory as inventory}
    <option value={inventory.id}>
      {inventory.vin.slice(12, 17)} | {inventory.make} {inventory.model} 
    </option>
    {/each}
</select>