<script lang="ts">
import { enhance } from "$app/forms";
import { goto, invalidate } from "$app/navigation";
import type { DetailedAccount } from "$lib/server/database/account";
import { allAccounts } from "$lib/stores";
import type { FormFields } from "$lib/types/forms";
import type { ActionData, PageData } from "./$types";

export let data: PageData;
type Selected = Partial<
	Omit<DetailedAccount, "contact"> & DetailedAccount["contact"]
>;
let selected: Selected = {};

export let form: ActionData;

$: if (form?.data) {
	allAccounts.update((curr) => {
		const index = curr.findIndex((a) => a.id === form.data.account.id);
		if (index === -1) {
			console.error("Failed to find account in list by id", curr);
		}
		curr[index].id = form.data.account.id;
		curr[index].licenseNumber = form.data.account.licenseNumber;
		curr[index].contact = form.data.contact;

		return curr;
	});
}

const fieldMap: FormFields<keyof Selected> = [
	[
		{ key: "firstName", label: "First Name" },
		{ key: "lastName", label: "Last Name" },
	],
	[
		{ key: "namePrefix", label: "Prefix" },
		{ key: "middleInitial", label: "MI" },
		{ key: "nameSuffix", label: "Suffix" },
	],
	[
		{ key: "address_1", label: "Addr. Line 1" },
		{ key: "address_2", label: "Line 2" },
		{ key: "address_3", label: "Line 3" },
	],
	[
		"city",
		{ key: "stateProvince", label: "State" },
		{ key: "zipPostal", label: "ZIP" },
		{ key: "zip_4", label: "+4" },
	],
	[
		{ key: "phonePrimary", label: "Primary Phone", type: "tel" },
		{ key: "phoneSecondary", label: "Secondary", type: "tel" },
		{ key: "phoneTertiary", label: "Tertiary", type: "tel" },
	],
	[
		{ key: "emailPrimary", label: "Primary Email", type: "email" },
		{ key: "emailSecondary", label: "Secondary", type: "email" },
	],
	[
		{ key: "licenseNumber", label: "License" },
		{ key: "licenseExpiration", label: "Exp.", type: "date" },
		{ key: "dateOfBirth", label: "DOB", type: "date" },
	],
];

$: if (data.account && selected.id !== data.account?.id) {
	const { contact, ...rest } = data.account;
	selected = { ...contact, ...rest };
} else {
	console.log(data.account);
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
    return ({ update }) => update({ reset: false });
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
      <div class={`flex flex-row flex-wrap gap-4 flex-1`}>
        {#each fieldRow as key}
          <label class="flex-1 min-w-max uppercase">
            {#if typeof key !== "string"}
              {key.label || key.key}
              <input
                value={selected[key.key] || ""}
                on:change={(e) => {
                  // @ts-ignore
                  selected[key.key] = e.target.value;
                }}
                name={key.key}
                type={key.type}
                step={key.type === "number" ? 10 : undefined}
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
