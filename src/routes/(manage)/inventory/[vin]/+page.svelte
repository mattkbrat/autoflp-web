<script lang="ts">
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { el } from "$lib/element";
import { handleInvNav } from "$lib/navState";
import type { InventoryField } from "$lib/server/database/inventory";
import type { ParsedNHTA } from "$lib/server/inventory";
import { allInventory } from "$lib/stores";
import { onMount } from "svelte";

const thisYear = new Date().getFullYear();

let shouldFocus = false;
let hasLoaded = false;

export let data;

let selected: Partial<typeof data.inventory> = {};
let hasCleared = false;
let searched = "";
let searchedInfo: { [key: string]: string } | null = null;

$: if (data.inventory.vin && selected.vin !== data.inventory.vin && hasLoaded) {
	selected = data.inventory;
	searchedInfo = null;
	hasCleared = false;
	setTimeout(() => {
		const input = el`inventory-form-vin`;
		if (input) {
			input.focus();
		}

		shouldFocus = false;
	}, 200);
}

$: if (!data.inventory.vin && !hasCleared) {
	selected = {};
	searchedInfo = {};
	searched = "";
	hasCleared = true;
}

const fieldMap: InventoryField[][] = [
	["vin", "year", "fuel"],
	["make", "model", "body", "mileage", "cwt", "color"],
	["cash", "credit", "down"],
];

$: if (selected?.year && hasLoaded) {
	const label = el<HTMLLabelElement>`inventory-form-mileage`;
	if (label) {
		const input = label.firstElementChild as HTMLInputElement;
		if (input) {
			// https://www.nhtsa.gov/press-releases/consumer-alert-changes-odometer-disclosure-requirements
			const isExempt = thisYear - selected.year >= 20;
			const alreadyExempt = input.value.toLowerCase().startsWith("e");
			selected.mileage = isExempt ? "EXEMPT" : alreadyExempt ? "" : input.value;
		}
	}
}

const handleSearched = async (result: unknown) => {
	if (typeof result !== "object" || !result || !("data" in result)) return;
	const parsed = result.data as ParsedNHTA;
	if (!parsed) return;
	const { wanted, info } = parsed;

	selected = {
		...selected,
		year: +(wanted["Model Year"] || 0) || 0,
		make: wanted.Make,
		model: wanted.Model,
		cwt: wanted["Gross Vehicle Weight Rating To"],
		fuel: wanted["Fuel Type - Primary"].toLowerCase().startsWith("gas")
			? "gas"
			: wanted["Fuel Type - Primary"],
		body: wanted["Body Class"],
	};

	searchedInfo = info;

	setTimeout(() => {
		el<HTMLInputElement>`inventory-form-color`?.focus();
	}, 100);
};

const syncSelect = (vin: string) => {
	const selectEl = el<HTMLSelectElement>`inventory-select`;
	if (!selectEl) return;
	const currentIndex = selectEl.selectedIndex;
	if (vin === "new") {
		if (currentIndex !== 0) {
			selectEl.selectedIndex = 0;
		}
		return;
	}
	const items = Array.from(selectEl.children) as HTMLOptionElement[];
	const indexOf = items.findIndex((el) => el.value === vin);
	if (indexOf === -1 || indexOf === currentIndex) {
		//console.log("already selected or invalid", indexOf, vin, selected);
		return;
	}
	selectEl.selectedIndex = indexOf;
};

$: if (selected.vin?.length === 17) {
	const vin = selected.vin.toLowerCase();
	const exists =
		$page.params.vin.toLowerCase() === vin
			? -1
			: $allInventory.findIndex((i) => i.vin.toLowerCase() === vin);
	if (exists !== -1) {
		handleInvNav({
			url: $page.url,
			vin: $allInventory[exists].vin,
			invalidate: true,
		});
	}
	if (import.meta.env.PROD && vin !== searched) {
		searched = vin;
		setTimeout(() => {
			el<HTMLButtonElement>`search-submit`?.click();
		}, 1000);
	}
}

page.subscribe((p) => {
	if (!hasLoaded) return;
	syncSelect(p.params.vin);
});

const updateAllInventory = (
	vin: string,
	value: (typeof $allInventory)[number] | null,
	remove = false,
) => {
	const lowerVin = vin.toLowerCase();
	const indexOf = $allInventory.findIndex(
		(i) => i.vin.toLowerCase() === lowerVin,
	);

	const isNew = Number.isNaN(indexOf) || indexOf === -1;

	if (remove && isNew) {
		console.warn("Cannot remove non-existing inventory");
		return;
	}

	if (isNew && !value) {
		console.warn("Cannot add null inventory");
		return;
	}

	allInventory.update((inv) => {
		if (remove) {
			inv.splice(indexOf, 1);
		} else if (isNew && value) {
			inv.push(value);
		} else if (value) {
			inv[Number(indexOf)] = value;
		} else {
			console.trace("don't know what to do with this");
		}
		return inv;
	});

	handleInvNav({ url: $page.url, vin: remove ? "new" : selected.vin });
};

onMount(() => {
	hasLoaded = true;
	selected = {};
	searchedInfo = null;
	syncSelect($page.params.vin);
});
</script>

<form
  action="?/update"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      if ("data" in result && result.data && "data" in result.data) {
        //await update();
        const vin = result.data.data && result.data.data.vin;
        if (vin) {
          updateAllInventory(vin, result.data.data);
        }
      }
    };
  }}
>
  <input
    value={selected.id || ""}
    name="id"
    id="inventory-form-id"
    type="hidden"
    class="input"
  />
  <!-- {@debug selected} -->
  {#each fieldMap as fieldRow}
    <div class={`flex flex-row flex-wrap gap-4`}>
      {#each fieldRow as key}
        {@const value = selected[key]}

        <label class="flex-1 min-w-max uppercase" id={`inventory-form-${key}`}>
          {key}
          {#if Number.isFinite(value)}
            <input
              bind:value={selected[key]}
              name={key}
              type="number"
              step={key === "year" ? 1 : 10}
              class="uppercase input"
            />
          {:else}
            <input
              bind:value={selected[key]}
              name={key}
              type="text"
              class="uppercase input"
            />
          {/if}
        </label>
      {/each}
    </div>
  {/each}
  <button type="submit" class="btn variant-soft-success"> Save </button>
</form>

<form
  action="?/search"
  method="post"
  class="flex flex-row flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      const deleted = result.data?.delete;
      if (!!deleted) {
        updateAllInventory(deleted, null, true);
      } else {
        handleSearched(result);
      }
    };
  }}
>
  <input type="hidden" name="vin" value={selected.vin} />
  <button
    class="btn variant-ringed-secondary flex-1"
    type="submit"
    id="search-submit">Search</button
  >
  <button
    type="button"
    class="btn variant-ringed-warning min-w-60"
    on:click={() => {
      if (
        !confirm(`Delete ${selected.vin} ${selected.year} ${selected.make} `)
      ) {
        return;
      }
      document.getElementById("inv-delete-submit")?.click();
    }}
  >
    Delete
  </button>
  <button
    formaction="?/delete"
    class=" hidden"
    type="submit"
    id="inv-delete-submit">Delete</button
  >
</form>

{#if import.meta.env.DEV}
  <form
    action="?/random"
    method="post"
    class="flex flex-row flex-wrap space-y-4"
    id="inventory-form"
    use:enhance={() => {
      return async ({ result, update }) => {
        const vin = result.data?.vin;
        if (!vin) return;
        selected.vin = vin;
      };
    }}
  >
    <button type="submit"> Fetch random </button>
  </form>
{/if}
<a
  href="https://www.nhtsa.gov/vehicle-safety/odometer-fraud#topic-laws-and-regulations"
  class="underline"
  target="_blank"
  referrerpolicy="no-referrer"
>
  Odometer fraud info
</a>

{#if searchedInfo}
  <details>
    <summary class="col-span-full">Search Info</summary>
    <div class="grid grid-cols-[auto_1fr]">
      {#each Object.entries(searchedInfo) as [k, v]}
        <div>
          {k}
        </div>
        <div>
          {v}
        </div>
      {/each}
    </div>
  </details>
{/if}
