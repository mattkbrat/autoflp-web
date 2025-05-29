<script lang="ts">
import { enhance } from "$app/forms";import { goto } from "$app/navigation";import { page } from "$app/stores";import { getZip } from "$lib";import SalesmenSelect from "$lib/components/SalesmenSelect.svelte";import { el } from "$lib/element";import { formatDate, formatInventory, formatSalesmen } from "$lib/format";import { handleInvNav } from "$lib/navState";import type { Inventory, InventoryField } from "$lib/server/database/inventory";import type { ParsedNHTA } from "$lib/server/inventory";import {	allInventory,	handleSelect,	selectedStates,	title,	toast,} from "$lib/stores";import type { FormFields } from "$lib/types/forms";import { onMount } from "svelte";const thisYear = new Date().getFullYear();let shouldFocus = $state(false);let hasLoaded = $state(false);let printedForms = $state(0);let lastUpdated = $state("");const { data, form } = $props();let selected = $state({} as Partial<Inventory>);let hasCleared = $state(false);let searched = $state("");let searchedInfo: { [key: string]: string } | null = $state(null);const formatted = $derived(selected ? formatInventory(selected) : "");$effect(() => {	if (!selected) return;	title.set(formatted);});$effect(() => {	if (!data.inventory?.vin || selected.id === data.inventory.id || !hasLoaded) {		return;	}	selected = data.inventory;	searchedInfo = null;	hasCleared = false;	setTimeout(() => {		const input = el`inventory-form-vin`;		if (input) {			input.focus();		}		shouldFocus = false;	}, 200);});const fieldMap: FormFields<InventoryField> = [	[		{ key: "purchasePrice", type: "number", label: "Purchase Price" },		{ key: "datePurchased", type: "date", label: "Date Purchased" },	],	["vin", "year", "fuel"],	[		"make",		"model",		"body",		"mileage",		{ key: "cwt", type: "number" },		"color",	],	[		{ key: "cash", type: "number" },		{ key: "credit", type: "number" },		{ key: "down", type: "number" },	],];$effect(() => {	if (!selected?.year || !hasLoaded || selected.mileage === "exempt") return;	const label = el<HTMLLabelElement>`inventory-form-mileage`;	if (label) {		const input = label.firstElementChild as HTMLInputElement;		if (input) {			const isExempt =				thisYear - Number(selected.year) >= 20 || Number(selected.year) < 2010;			const alreadyExempt = input.value.toLowerCase().startsWith("e");			selected.mileage = isExempt ? "EXEMPT" : alreadyExempt ? "" : input.value;		}	}});const handleSearched = async (result: unknown) => {	if (typeof result !== "object" || !result || !("data" in result)) return;	const parsed = result.data as ParsedNHTA;	if (!parsed) return;	const { wanted, info } = parsed;	selected = {		...selected,		year: wanted["Model Year"] || 0 || "0",		make: wanted.Make,		model: wanted.Model,		cwt: wanted["Gross Vehicle Weight Rating To"],		fuel: wanted["Fuel Type - Primary"].toLowerCase().startsWith("gas")			? "gas"			: wanted["Fuel Type - Primary"],		body: wanted["Body Class"],	};	searchedInfo = info;	setTimeout(() => {		el<HTMLInputElement>`inventory-form-color`?.focus();	}, 100);};$effect(() => {	if (!selected.vin || selected.vin.length < 17 || selected.make) {		return;	}	const vin = selected.vin.toLowerCase();	const exists =		$page.params.vin.toLowerCase() === vin			? -1			: $allInventory.findIndex((i) => i.vin.toLowerCase() === vin);	if (exists !== -1) {		handleInvNav({			url: $page.url,			vin: $allInventory[exists].vin,			invalidate: true,		});	}	if (selected.vin === searched) {		return;	}	searched = vin;	setTimeout(() => {		el<HTMLButtonElement>`search-submit`?.click();	}, 1000);});const updateAllInventory = (	vin: string,	value: (typeof $allInventory)[number] | null,	remove = false,) => {	const lowerVin = vin.toLowerCase();	const indexOf = $allInventory.findIndex(		(i) => i.vin.toLowerCase() === lowerVin,	);	const isNew = Number.isNaN(indexOf) || indexOf === -1;	if (remove && isNew) {		console.warn("Cannot remove non-existing inventory");		return;	}	if (isNew && !value) {		console.warn("Cannot add null inventory");		return;	}	allInventory.update((inv) => {		if (remove) {			inv.splice(indexOf, 1);		} else if (isNew && value) {			inv.push(value);		} else if (value) {			inv[Number(indexOf)] = value;		} else {			console.trace("don't know what to do with this");		}		return inv;	});	handleInvNav({ url: $page.url, vin: remove ? "new" : selected.vin });};const toggleState = (oldState: number) => {	selected.state = oldState === 0 ? 1 : 0;	setTimeout(() => {		el<HTMLButtonElement>`inv-submit-button`?.click();	}, 150);};$effect(() => {	if (!form || form.data?.id === lastUpdated) return;	if (!form?.data) {		toast({			title: "Inventory update failed",			description: form.message,		});		return;	}	const { vin, id } = form.data;	toast({		title: "Recorded inventory",		json: JSON.stringify(form.data, null, 2),		status: "success",	});	if (id) {		selected.id = id;	}	if (vin) {		updateAllInventory(vin, data.inventory);	}	lastUpdated = form.data.id;});$effect(() => {	if (!form?.delete) return;	updateAllInventory(form?.delete, null, true);});$effect(() => {	if (!form?.data) return;	selected = form.data;});$effect(() => {	if (!form?.forms?.length || form.formsName === printedForms) return;	getZip(form.forms, { type: "inventory", inventory: selected }).then(() => {		printedForms = form.formsName;	});});onMount(() => {	if (!data.inventory?.vin) {		if ($selectedStates.inventoryID) {			handleInvNav({				url: $page.url,				vin: $selectedStates.inventoryID,			});		} else {			selected = {};			searchedInfo = null;		}	}	hasLoaded = true;});</script>

<form
  action="?/update"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ update }) => {
      await update({ reset: false });
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
    ) || []}
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
              onchange={(e) => {
                // @ts-ignore
                selected[key.key] = e.target.value;
              }}
              name={key.key}
              type={key.type}
              step={1}
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
      class="btn preset-tonal-success flex-1"
      id="inv-submit-button"
    >
      Save
    </button>
    {#if Number.isFinite(selected.state)}
      <button
        type="button"
        onclick={() => {
          typeof selected.state !== "undefined" && toggleState(+selected.state);
        }}
        class="btn preset-outlined-tertiary-200-800"
      >
        Make {selected.state === 0 ? "Active" : "Inactive"}
      </button>
    {/if}
    <button
      formaction="?/printForms"
      type="submit"
      class="preset-outlined-tertiary-200-800 px-4">Print forms</button
    >
  </div>
</form>

<form
  action="/inventory?/search"
  method="post"
  class="flex flex-row flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ update, result }) => {
      handleSearched(result);
      return await update({ reset: false });
    };
  }}
>
  <input type="hidden" name="vin" value={selected.vin} />
  <div class="btn-group flex-1">
    <button
      class="btn preset-outlined-secondary-500 flex-1"
      type="submit"
      id="search-submit">Search</button
    >
    <button
      type="button"
      class="btn variant-ringed-warning min-w-60 preset-outlined-warning-200-800"
      onclick={() => {
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
      class="btn preset-outlined-warning-200-800"
      onclick={() => {
        data.inventory = { inventory_salesman: [{}] };
        selected = {};
        handleSelect("inventory", "");
        goto("/inventory/new");
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
  </div>
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
