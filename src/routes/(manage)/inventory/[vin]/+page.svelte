<script lang="ts">
import { el } from "$lib/element.js";
import { onMount } from "svelte";

const thisYear = new Date().getFullYear();

let shouldFocus = false;
let hasLoaded = false;

export let data;

type InventoryField = Extract<keyof typeof data.inventory, string>;

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

$: if (selected.year && hasLoaded) {
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
  action="/?update"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
>
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
              class="uppercase input"
            />
          {/if}
        </label>
      {/each}
    </div>
  {/each}
</form>

<a
  href="https://www.nhtsa.gov/vehicle-safety/odometer-fraud#topic-laws-and-regulations"
  class="underline"
  target="_blank"
  referrerpolicy="no-referrer"
>
  Odometer fraud info
</a>
