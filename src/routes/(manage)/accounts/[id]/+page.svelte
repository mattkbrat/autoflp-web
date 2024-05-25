<script lang="ts">
import { enhance } from "$app/forms";
import type { AccountField } from "$lib/server/database/account";
import type { InventoryField } from "$lib/server/database/inventory";
import { onMount } from "svelte";

export let data;

let selected: Partial<typeof data.account> = {};

const fieldMap: AccountField[][] = [
	["namePrefix", "firstName", "middleInitial", "lastName", "nameSuffix"],
	["address1", "address2", "address3"],
	["city", "stateProvince", "zipPostal", "zip4"],
	["phonePrimary", "phoneSecondary", "phoneTertiary"],
	["emailPrimary", "emailSecondary"],
	["licenseExpiration", "licenseNumber", "dateOfBirth"],
	["notes"],
];

$: if (selected.licenseNumber !== data.account.licenseNumber) {
	selected = data.account;
}
onMount(() => {
	selected = data.account;
});
</script>

<div>Accounts</div>
{#if selected.lastName}
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
    value={selected.account || ""}
    name="account-id"
    class="input"
    type="hidden"
  />
  <input
    value={selected.contact || ""}
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
            return `${acc} ${char}`
          }
          return acc+char
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
            {:else if key === 'notes'}
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
  <button type="submit" class="btn variant-soft-success"> Save </button>
</form>