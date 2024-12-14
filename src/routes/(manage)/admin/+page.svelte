<script lang="ts">
import { enhance } from "$app/forms";
import { getZip } from "$lib";
import { title } from "$lib/stores";
import { onMount } from "svelte";

import { deals } from "$lib/stores";
import { formatInventory, fullNameFromPerson } from "$lib/format";
import { selectAll } from "$lib/element";

onMount(() => {
	title.set("Admin");
});

type MappedDeals = {
	id: string;
	contact: string;
	inventory: string;
	pmt: number;
}[];

let filter = $state("");

let dealIds = $state([] as string[]);
let orderedAccounts = $state([] as MappedDeals);

type OrderBy = "pmt" | "inventory" | "account" | null;
let orderBy: OrderBy = $state(null);

const dealRows = $derived(
	$deals.reduce((acc, opt) => {
		if (!opt.state) return acc;
		acc.push({
			id: opt.id,
			contact: fullNameFromPerson({
				person: opt.account.contact,
			}).toLowerCase(),
			inventory: formatInventory(opt.inventory).toLowerCase(),
			pmt: opt.pmt ? Number(opt.pmt) : 0,
		});
		return acc;
	}, [] as MappedDeals),
);

$effect(() => {
	dealIds = dealRows.map((d) => d.id);
});

const filteredAccounts = $derived(
	!filter
		? dealRows
		: dealRows.filter((r) => {
				return r.contact.startsWith(filter) || r.inventory.startsWith(filter);
			}),
);

$effect(() => {
	orderedAccounts = filteredAccounts.sort((a, b) => {
		if (!orderBy) {
			return (
				a.contact.localeCompare(b.contact) ||
				a.inventory.localeCompare(b.inventory)
			);
		}
		return orderBy === "pmt"
			? b.pmt - a.pmt
			: orderBy === "inventory"
				? a.inventory.localeCompare(b.inventory)
				: a.contact.localeCompare(b.contact);
	});
});

const changeOrder = (order: OrderBy) => {
	if (orderBy === order) return;
	orderBy = order;
};
</script>

<div class="flex flex-col flex-wrap space-y-4"></div>

<label class="flex flex-col flex-wrap">
  <span class=""> Filter </span>
  <input bind:value={filter} class="flex-1" />
</label>

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
      onclick={() => selectAll("billing-table")}
      class="btn-lg preset-outlined-tertiary-200-800 w-1/4">Select All</button
    >
    <button class="btn-lg preset-filled-primary-200-800 flex-1" type="submit"
      >Print Billing</button
    >
  </div>
  <table class="table" id="billing-table">
    <thead>
      <tr>
        <th>
          <button
            type="button"
            onclick={() => {
              changeOrder(null);
            }}
          >
            Include
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              changeOrder("account");
            }}
          >
            Contact
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              changeOrder("inventory");
            }}
          >
            Vehicle
          </button>
        </th>
        <th>
          <button
            type="button"
            onclick={() => {
              changeOrder("pmt");
            }}
          >
            Pmt
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each orderedAccounts as opt}
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
            <label for={opt.id}>
              {opt.contact}
            </label>
          </td>
          <td class="uppercase">
            {opt.inventory}
          </td>
          <td>
            {opt.pmt}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</form>
