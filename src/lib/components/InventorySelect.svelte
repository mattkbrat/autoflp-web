<script lang="ts">
import { goto, invalidateAll } from "$app/navigation";
import { page } from "$app/stores";
import { type NavType, handleInvNav } from "$lib/navState";
import { allInventory } from "$lib/stores";
import { handleSelect, inventoryID } from "$lib/stores/selected";
$: active = $page.url.searchParams.get("state");

// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";
</script>

<div class="flex flex-row flex-wrap gap-4">
  <select
    class="flex-1 uppercase bg-surface-800"
    id="inventory-select"
    name="vin"
    value={$inventoryID.value}
    required
    on:blur={(e) => {
    if (!e.target || !('value' in e.target) || typeof e.target.value !== 'string') return;
    handleSelect('inventory', e.target.value, navType)
    }}
  >
    <option value="new">Select Inventory</option>
    {#each $allInventory as inventory}
      <option value={inventory.vin}>
        {[
          inventory.vin.slice(-6),
          inventory.year,
          `${inventory.make} ${inventory.model}`,
        ].join(" | ".toUpperCase())}
      </option>
    {/each}
  </select>

  <div
    class="flex flex-row btn-group min-w-1/4"
    class:hidden={navType === "query"}
  >
    <button
      type="button"
      class="flex-1 btn variant-filled-tertiary"
      disabled={active === "1"}
      class:!variant-ghost={active !== "1"}
      on:click={() => handleInvNav({ url: $page.url, state: "1" })}
    >
      <span class="text-white"> Current </span>
    </button>
    <button
      type="button"
      class="flex-1 btn variant-filled-tertiary"
      class:!variant-ghost={active !== "0"}
      disabled={active === "0"}
      on:click={() => handleInvNav({ url: $page.url, state: "0" })}
    >
      <span class="text-white"> Non-Current </span>
    </button>
    <button
      type="button"
      class="flex-1 btn variant-filled-tertiary"
      disabled={!active}
      class:!variant-ghost={!!active}
      on:click={() => handleInvNav({ url: $page.url, state: null })}
    >
      <span class="text-white"> All </span>
    </button>
  </div>
  <span class="self-center w-8 font-mono text-center opacity-75">
    {$allInventory.length}
  </span>
</div>
