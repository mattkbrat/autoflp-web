<script lang="ts">
import { goto, invalidateAll } from "$app/navigation";
import { page } from "$app/stores";
import { allInventory } from "$lib/stores";
const handleNav = (target: string) => {
	if (!target) {
	goto("/inventory/new");
  }
	if ($page.url.href.endsWith(target)) return;
	goto(`/inventory/${target}`);
};

$: active = $page.url.searchParams.get("state");

const handleNavState = (state?: string) => {
	const newUrl = new URL($page.url);
	if (state) {
		newUrl.searchParams.set("state", state);
	} else {
		newUrl.searchParams.delete("state");
	}
	goto(newUrl, { invalidateAll: true });
};
</script>

<div class="flex flex-row flex-wrap gap-4">
  <select
    class="flex-1 uppercase bg-surface-800"
    id="inventory-select"
    on:blur={(e) => handleNav(e.target?.value)}
  >
    <option value="">Select Inventory</option>
    {#each $allInventory as inventory}
      <option value={inventory.vin}>
        {[
          inventory.vin.slice(-6),
          `${inventory.make} ${inventory.model}`,
          inventory.color,
        ].join(" | ").toUpperCase()}
      </option>
    {/each}
  </select>

  <div class="flex flex-row gap-4 min-w-1/4">
    <button
      type="button"
      class="flex-1 btn variant-filled-tertiary"
      disabled={active === "1"}
      class:!variant-ghost={active !== "1"}
      on:click={() => handleNavState("1")}
    >
      <span class="text-white"> Current </span>
    </button>
    <button
      type="button"
      class="flex-1 btn variant-filled-tertiary"
      class:!variant-ghost={active !== "0"}
      disabled={active === "0"}
      on:click={() => handleNavState("0")}
    >
      <span class="text-white"> Non-Current </span>
    </button>
    <button
      type="button"
      class="flex-1 btn variant-filled-tertiary"
      disabled={!active}
      class:!variant-ghost={!!active}
      on:click={() => handleNavState()}
    >
      <span class="text-white"> All </span>
    </button>
  </div>
  <span class="self-center w-8 font-mono text-center opacity-75">
    {$allInventory.length}
  </span>
</div>
