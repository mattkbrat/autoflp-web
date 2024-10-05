<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import { getZip } from "$lib";
import SalesmenSelect from "$lib/components/SalesmenSelect.svelte";
import { el } from "$lib/element";
import { formatDate, formatSalesmen } from "$lib/format";
import { handleInvNav } from "$lib/navState";
import type { Inventory, InventoryField } from "$lib/server/database/inventory";
import type { ParsedNHTA } from "$lib/server/inventory";
import { allInventory, selectedStates } from "$lib/stores";
import type { FormFields } from "$lib/types/forms";
import { onMount } from "svelte";

const thisYear = new Date().getFullYear();

let shouldFocus = false;
let hasLoaded = false;

export let data: { inventory: Inventory };

let selected: Partial<Inventory> = {};
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

const fieldMap: FormFields<InventoryField> = [
	[
		{ key: "purchasePrice", type: "number", label: "Purchase Price" },
		{ key: "datePurchased", type: "date", label: "Date Purchased" },
	],
	["vin", "year", "fuel"],
	[
		"make",
		"model",
		"body",
		"mileage",

		{ key: "cwt", type: "number" },
		"color",
	],
	[
		{ key: "cash", type: "number" },
		{ key: "credit", type: "number" },
		{ key: "down", type: "number" },
	],
];

$: if (selected?.year && hasLoaded) {
	const label = el<HTMLLabelElement>`inventory-form-mileage`;
	if (label) {
		const input = label.firstElementChild as HTMLInputElement;
		if (input) {
			// https://www.nhtsa.gov/press-releases/consumer-alert-changes-odometer-disclosure-requirements
			const isExempt =
				thisYear - Number(selected.year) >= 20 || Number(selected.year) < 2010;
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

const toggleState = (oldState: number) => {
	selected.state = oldState === 0 ? 1 : 0;

	setTimeout(() => {
		el<HTMLButtonElement>`inv-submit-button`?.click();
	}, 150);
};

onMount(() => {
	if (!data.inventory?.vin) {
		if ($selectedStates.inventoryID) {
			handleInvNav({
				url: $page.url,
				vin: $selectedStates.inventoryID,
			});
		} else {
			selected = {};
			searchedInfo = null;
		}
	}
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
      console.log(result);
      if (!("data" in result) || !result.data) return;
      await update();
      if (result.data && "data" in result.data && result.data.data) {
        const { vin, id } = result.data.data;
        if (id) {
          selected.id = id;
        }
        if (vin) {
          updateAllInventory(vin, result.data.data);
        }
      } else if (result.data && "forms" in result.data) {
        //await update();
        const { forms } = result.data || {
          id: "",
          forms: [],
        };
        if (!Array.isArray(forms)) {
          console.log("Failed to get forms", result.data);
          return;
        }
        await getZip(forms, { type: "inventory", inventory: selected });
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
  <input
    bind:value={selected.state}
    name="state"
    id="inventory-form-id"
    type="hidden"
    class="input"
  />
  <SalesmenSelect
    selected={selected["inventory_salesman"]?.map(
      (is) => is.salesman.contact.id,
    )}
  />
  {#if selected.inventory_salesman}
    <span>
      Salesmen: {formatSalesmen(selected.inventory_salesman, "contact")}
    </span>
  {/if}

  <!-- {@debug selected} -->
  {#each fieldMap as fieldRow}
    <div class={`flex flex-row flex-wrap gap-4`}>
      {#each fieldRow as key}
        <label class="flex-1 min-w-max uppercase" id={`inventory-form-${key}`}>
          {#if typeof key !== "string"}
            {key.label || key.key}
            <input
              value={selected[key.key]}
              on:change={(e) => {
                // @ts-ignore
                selected[key.key] = e.target.value;
              }}
              name={key.key}
              type={key.type}
              step={key.key === "year" ? 1 : 10}
              class="uppercase input"
            />
          {:else}
            {key}
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
  <div class="btn-group gap-2">
    <button
      type="submit"
      class="btn variant-soft-success flex-1"
      id="inv-submit-button"
    >
      Save
    </button>
    {#if Number.isFinite(selected.state)}
      <button
        type="button"
        on:click={() => {
          typeof selected.state !== "undefined" && toggleState(+selected.state);
        }}
        class="btn variant-outline-tertiary"
      >
        Make {selected.state === 0 ? "Active" : "Inactive"}
      </button>
    {/if}
    <button formaction="?/printForms" type="submit">Print forms</button>
  </div>
</form>

<form
  action="/inventory?/search"
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
    type="button"
    on:click={() => {
      data.inventory = { inventory_salesman: [{}] };
      selected = {};
    }}
  >
    Clear
  </button>
  <button
    formaction="?/delete"
    class=" hidden"
    type="submit"
    id="inv-delete-submit">Delete</button
  >
</form>

{#if selected}
  <div class="flex flex-row gap-4">
    <span>
      Added {formatDate(selected?.dateAdded || "")}
    </span>
    <span>
      Modified {formatDate(selected?.dateModified || "")}
    </span>
  </div>
{/if}

{#if import.meta.env.DEV}
  <form
    action="/inventory?/random"
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
