<script lang="ts">
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import { fieldMap } from "$lib/accounts";
import { fullNameFromPerson } from "$lib/format/fullNameFromPerson.js";
import { allAccounts, handleSelect, title } from "$lib/stores";
import type { SelectedAccount } from "$lib/types";

let { data, form } = $props();
let selected: SelectedAccount = $state({});

$effect(() => {
	if (!form?.data?.account) return;
	allAccounts.update((curr) => {
		const index = curr.findIndex((a) => a.id === form.data.account.id);
		const {
			data: {
				account: { id: accountId, licenseNumber },
				contact,
			},
		} = form;
		if (index === -1) {
			curr.unshift({
				id: accountId,
				licenseNumber,
				contact,
			});
			goto(`/accounts/${accountId}`);
		} else {
			curr[index].id = accountId;
			curr[index].licenseNumber = licenseNumber;
			curr[index].contact = contact;
		}

		return curr;
	});
	form.data = null;
});

$effect(() => {
	if (!data.account || selected.id === data.account?.id) return;
	const { contact, ...rest } = data.account;
	selected = { ...contact, ...rest };
});

$effect(() => {
	title.set(
		data.account
			? fullNameFromPerson({ person: data.account?.contact })
			: "Accounts",
	);
});
</script>

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
                onchange={(e) => {
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
    <button type="submit" class="btn-lg preset-filled-success-100-900 flex-1">
      Save
    </button>
    <button
      type="button"
      class="btn-lg preset-outlined-warning-100-900 min-w-48"
      onclick={() => {
        handleSelect("account", "new");
        goto("/accounts/new");
      }}
    >
      Clear
    </button>
  </div>
</form>
