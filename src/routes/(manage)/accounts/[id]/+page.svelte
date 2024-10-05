<script lang="ts">
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import type { DetailedAccount } from "$lib/server/database/account";
import type { PageData } from "./$types";

export let data: PageData;
type Selected = Partial<
	Omit<DetailedAccount, "contact"> & DetailedAccount["contact"]
>;
let selected: Selected = {};

const fieldMap: (keyof Selected)[][] = [
	["firstName", "lastName"],
	["namePrefix", "middleInitial", "nameSuffix"],
	["address_1", "address_2", "address_3"],
	["city", "stateProvince", "zipPostal", "zip_4"],
	["phonePrimary", "phoneSecondary", "phoneTertiary"],
	["emailPrimary", "emailSecondary"],
	["licenseNumber", "licenseExpiration", "dateOfBirth"],
];

$: if (data.account && selected.id !== data.account?.id) {
	const { contact, ...rest } = data.account;
	selected = { ...contact, ...rest };
}
</script>

<div>Accounts</div>
{#if selected}
  <h2>{selected.lastName} {selected.firstName}</h2>
{:else}
  <h2>New</h2>
{/if}

<form
  action="?/update"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      if ("data" in result && result.data && "data" in result.data) {
      }
    };
  }}
>
  <input
    value={selected.id || ""}
    name="account-id"
    class="input"
    type="hidden"
  />
  <input
    value={selected.contact_id || ""}
    name="person-id"
    class="input"
    type="hidden"
  />
  <!-- {@debug selected} -->
  {#each fieldMap as fieldRow}
    <div class={`flex flex-row flex-wrap gap-4`}>
      {#each fieldRow as key}
        {@const value = selected[key]}
        {@const name = key.split("").reduce((acc, char, n) => {
          const isUpper = char.toUpperCase() === char;
          if (isUpper && n > 0) {
            return `${acc} ${char}`;
          }
          return acc + char;
        }, "")}

        <label class="flex-1 min-w-max uppercase" id={`inventory-form-${key}`}>
          {name}
          {#if Number.isFinite(value)}
            <input
              bind:value={selected[key]}
              name={key}
              type="number"
              step={1}
              class="uppercase input"
            />
          {:else if value instanceof Date}
            <input
              value={value.toISOString().split("T")[0]}
              name={key}
              type="date"
              class="uppercase input"
            />
          {:else if key === "notes"}
            <textarea
              bind:value={selected[key]}
              name={key}
              class="uppercase input"
              rows={4}
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
  <div class="btn-group gap-2">
    <button type="submit" class="btn variant-soft-success flex-1">
      Save
    </button>
    <button
      type="button"
      class="btn variant-outline-warning min-w-48"
      on:click={() => {
        goto("/accounts/new");
      }}
    >
      Clear
    </button>
  </div>
</form>
