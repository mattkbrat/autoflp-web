<script lang="ts">
import { enhance } from "$app/forms";import { getZip } from "$lib";import { title, allSalesmen } from "$lib/stores";import { onMount } from "svelte";import { selectAll } from "$lib/element";import { page } from "$app/stores";import { goto } from "$app/navigation";import { formatDate } from "date-fns";import type { MappedDeals } from "./types";onMount(() => {	title.set("Admin");});let filter = $state("");let dealIds = $state([] as string[]);let orderedAccounts = $state([] as MappedDeals);let salesmenUpdateButton: HTMLButtonElement | null = $state(null);const pageNum = $derived($page.url.searchParams.get("page"));const hasAll = $derived($page.url.searchParams.get("all") === "true");let salesmanUpdates: { [deal: string]: string[] } = $state({});const showSalesmenUpdateButton = $derived(Object.keys(salesmanUpdates).length);type OrderBy = "pmt" | "inventory" | "account" | "salesman" | "date" | null;let orderBy: {	col: OrderBy;	dir: "asc" | "desc";} = $state({	col: null,	dir: "asc",});const { data } = $props();$effect(() => {	dealIds = data.deals.reduce((acc, d) => {		if (d.state !== 1) {			return acc;		}		acc.push(d.id);		return acc;	}, [] as string[]);});const filteredAccounts = $derived(	!filter		? data.deals		: data.deals.filter((r) => {				return (					r.contact.startsWith(filter) ||					r.inventory.startsWith(filter) ||					r.salesmen.some((s) => s.toLowerCase().includes(filter))				);			}),);const sort = (col: OrderBy) => {	const dir =		orderBy.col === col ? (orderBy.dir === "asc" ? "desc" : "asc") : "asc";	const flipOrderBy = dir === "desc";	console.log(col, flipOrderBy, orderBy);	orderedAccounts = filteredAccounts.sort((a, b) => {		if (!col) {			return (				a.contact.localeCompare(b.contact) ||				a.inventory.localeCompare(b.inventory)			);		}		if (col === "pmt") {			return flipOrderBy ? b.pmt - a.pmt : a.pmt - b.pmt;		}		if (col === "inventory") {			return flipOrderBy				? a.inventory.localeCompare(b.inventory)				: b.inventory.localeCompare(a.inventory);		}		if (col === "date") {			return flipOrderBy				? new Date(a.date) - new Date(b.date)				: new Date(b.date) - new Date(a.date);		}		if (col === "salesman") {			const aS = a.salesmen[0];			const bS = b.salesmen[0];			return flipOrderBy ? aS?.localeCompare(bS) : bS.localeCompare(aS);		}		return flipOrderBy			? a.contact.localeCompare(b.contact)			: b.contact.localeCompare(a.contact);	});	if (orderBy.col === col) {		orderBy.dir = dir;	} else {		orderBy.col = col;		orderBy.dir = dir;	}};const navPage = (t: "dec" | "inc") => {	const newUrl = new URL($page.url);	const workingSearch = newUrl.searchParams;	const searchPage = workingSearch.get("page");	const currPage = Number.isNaN(Number(searchPage)) ? 0 : Number(searchPage);	const nextPage = t === "dec" ? currPage - 1 : currPage + 1;	workingSearch.set("page", (nextPage < 0 ? 0 : nextPage).toString());	goto(`?${workingSearch.toString()}`);};const navToAll = () => {	const newUrl = new URL($page.url);	const workingSearch = newUrl.searchParams;	if (workingSearch.get("all") === "true") {		workingSearch.delete("all");	} else {		workingSearch.append("all", "true");	}	if (workingSearch.get("all")) {		workingSearch.set("page", "0");	} else {		workingSearch.delete("page");	}	goto(`?${workingSearch.toString()}`);};const handleSalesmanUpdate = (	deal: string,	salesman: string,	salesmen: string[],	checked: boolean,) => {	let existing =		deal in salesmanUpdates ? salesmanUpdates[deal].slice() : salesmen;	if (!checked) {		existing = existing.filter((e) => e !== salesman);	} else {		existing.push(salesman);	}	salesmanUpdates[deal] = existing.filter((i) => typeof i !== "undefined");};onMount(() => {	sort(null);});</script>

<div class="flex flex-col flex-wrap space-y-4"></div>

<label class="flex flex-col flex-wrap">
  <span class=""> Filter </span>
  <input bind:value={filter} class="flex-1" />
</label>

<form
  action="?/updateSalesmen"
  method="post"
  hidden
  use:enhance={() => {
    return async ({ update }) => {
      update({ reset: false });
      salesmanUpdates = {};
    };
  }}
>
  <input name="deals" value={Object.keys(salesmanUpdates).join(",")} />
  {#each Object.entries(salesmanUpdates) as [k, v]}
    <select name={k} multiple value={v} hidden>
      {#each $allSalesmen as salesman}
        <option value={salesman.contact.id}>{salesman.contact.id}</option>
      {/each}
    </select>
  {/each}
  <button
    bind:this={salesmenUpdateButton}
    type="submit"
    class="btn btn-lg preset-outlined-tertiary-200-800 w-1/4"
  >
    Update salesmen
  </button>
</form>

<form
  action="?/printBilling"
  method="post"
  class="flex flex-col py-4 gap-2"
  use:enhance={() => {
    return async ({ result }) => {
      if ("data" in result && result.data) {
        if ("built" in result.data) {
          const { built } = result.data;
          if (typeof built === "string") {
            await getZip([built], { type: "billing" });
          }
        }
      }
    };
  }}
>
  <div class="flex gap-x-2">
    <button
      type="button"
      onclick={() => selectAll("billing-table", { exclude: ["salesman"] })}
      class="btn btn-lg preset-outlined-tertiary-200-800 w-1/4"
      >Select All</button
    >
    <button
      class="btn btn-lg preset-filled-primary-200-800 flex-1"
      type="submit">Print Billing</button
    >
    <button
      type="button"
      class="btn btn-lg preset-tonal-tertiary min-w-20"
      onclick={() => {
        navToAll();
      }}
    >
      Get All
    </button>
    {#if showSalesmenUpdateButton}
      <button
        type="button"
        class="btn btn-lg preset-outlined-tertiary-200-800 w-1/4"
        onclick={() => {
          salesmenUpdateButton?.click();
        }}
      >
        Update salesmen
      </button>
    {/if}
  </div>
  <table class="table" id="billing-table">
    <thead>
      <tr>
        <th>
          <button
            type="button"
            onclick={() => {
              sort(null);
            }}
          >
            Include
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              sort("date");
            }}
          >
            Date
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              sort("account");
            }}
          >
            Contact
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              sort("inventory");
            }}
          >
            Vehicle
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              sort("salesman");
            }}
          >
            Salesman
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              sort("pmt");
            }}
          >
            Pmt
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each hasAll ? data.deals : orderedAccounts as opt}
        <tr>
          <td class="uppercase">
            <input
              type="checkbox"
              class="checkbox"
              value={opt.id}
              name="id"
              id={opt.id}
              checked={dealIds.includes(opt.id)}
              onchange={(e) => {
                if (e.target && "checked" in e.target && !e.target.checked) {
                  dealIds = dealIds.filter((id) => id !== opt.id);
                  return;
                }
                const newIds = dealIds.slice();
                newIds.push(opt.id);
                dealIds = newIds;
              }}
            />
          </td>
          <td class="uppercase">
            {formatDate(opt.date, "MM-dd-yy")}
          </td>
          <td class="uppercase">
            <label for={opt.id}>
              {opt.contact}
            </label>
          </td>
          <td class="uppercase">
            {opt.inventory}
          </td>
          <td>
            <ul>
              {#each $allSalesmen as salesman}
                <ul>
                  <label>
                    <input
                      name={"salesman"}
                      value={salesman.id}
                      type="checkbox"
                      checked={opt.salesmen.includes(salesman.contact.id)}
                      onchange={(e) => {
                        const { checked } = e.target || { checked: false };
                        handleSalesmanUpdate(
                          opt.id,
                          salesman.contact.id,
                          opt.salesmen,
                          checked,
                        );
                      }}
                    />
                    {salesman.name}
                  </label>
                </ul>
              {/each}
            </ul>
          </td>
          <td>
            {opt.pmt}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if hasAll}
    <div class="flex">
      {#if pageNum && pageNum !== "0"}
        <button
          type="button"
          class="btn preset-tonal-secondary flex-1"
          onclick={() => {
            navPage("dec");
          }}
        >
          Prev Page
        </button>
      {/if}
      <button
        type="button"
        class="btn preset-tonal-tertiary flex-1"
        onclick={() => {
          navPage("inc");
        }}
      >
        Next Page
      </button>
    </div>
  {/if}
</form>
