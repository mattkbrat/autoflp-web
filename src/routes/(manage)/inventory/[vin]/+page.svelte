<script lang="ts">
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import { el } from "$lib/element.js";
import type { InventoryField } from "$lib/server/database/inventory.js";
import { allInventory } from "$lib/stores";
import { onMount } from "svelte";

const thisYear = new Date().getFullYear();

let shouldFocus = false;
let hasLoaded = false;

export let data;

let selected: Partial<typeof data.inventory> = {};

$: if (data.inventory.vin && selected.vin !== data.inventory.vin && hasLoaded) {
	selected = data.inventory;
	setTimeout(() => {
		const input = el`inventory-form-vin`;
		if (input) {
			input.focus();
		}

		shouldFocus = false;
	}, 200);
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

<a
  href="https://www.nhtsa.gov/vehicle-safety/odometer-fraud#topic-laws-and-regulations"
  class="underline"
  target="_blank"
  referrerpolicy="no-referrer"
>
  Odometer fraud info
</a>
