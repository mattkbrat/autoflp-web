<script lang="ts">
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import { el } from "$lib/element.js";
import type { InventoryField } from "$lib/server/database/inventory.js";
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

$: if (selected.vin?.length === 17 && selected.vin !== searched) {
	searched = selected.vin;
	setTimeout(() => {
		el<HTMLButtonElement>`search-submit`?.click();
	}, 1000);
}

onMount(() => {
	hasLoaded = true;
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
        const indexOf =
          result.data.data &&
          $allInventory.findIndex((i) => i.vin === result.data.data.vin);

        const value = result.data.data;

        console.log(value, indexOf);
        if (Number.isNaN(indexOf) || indexOf === -1) {
          console.warn("invalid index");
          return;
        }

        allInventory.update((inv) => {
          inv[Number(indexOf)] = value;
          return inv;
        });
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
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      handleSearched(result);
    };
  }}
>
  <input type="hidden" name="vin" value={selected.vin} />
  <button class="btn variant-ringed-secondary" type="submit" id="search-submit"
    >Search</button
  >
</form>

<a
  href="https://www.nhtsa.gov/vehicle-safety/odometer-fraud#topic-laws-and-regulations"
  class="underline"
  target="_blank"
  referrerpolicy="no-referrer"
>
  Odometer fraud info
</a>

{#if searched && searchedInfo}
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
