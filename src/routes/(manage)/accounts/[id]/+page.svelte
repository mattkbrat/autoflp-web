<script lang="ts">
import { enhance } from "$app/forms";import { goto } from "$app/navigation";import { fieldMap } from "$lib/accounts";import { fullNameFromPerson } from "$lib/format/fullNameFromPerson.js";import { allAccounts, handleSelect, title, toast } from "$lib/stores";import type { SelectedAccount } from "$lib/types";let formHandled = $state(0);let { data, form } = $props();let selected: SelectedAccount = $state({});$effect(() => {	if (		!form ||		("handled" in form && form.handled && form.handled <= formHandled)	)		return;	if ("status" in form && form.status === "error") {		toast({			title: form.title || "Failed to record account",			status: "error",			description: form?.message || "",		});		return;	}	if (!form.data?.account) {		toast({			title: "Failed to record account",			status: "error",			description: form?.message || "",		});		return;	}	toast({		title: "Recorded account",		status: "success",		json: JSON.stringify(form.data, null, 2),	});	allAccounts.update((curr) => {		const index = curr.findIndex((a) => a.id === form.data.account.id);		const {			data: {				account: { id: accountId, licenseNumber },				contact,			},		} = form;		if (index === -1) {			curr.unshift({				id: accountId,				licenseNumber,				contact,			});			goto(`/accounts/${accountId}`);		} else {			curr[index].id = accountId;			curr[index].licenseNumber = licenseNumber;			curr[index].contact = contact;		}		return curr;	});	formHandled = form.handled;});$effect(() => {	if (!data.account || selected.id === data.account?.id) return;	const { contact, ...rest } = data.account;	selected = { ...contact, ...rest };});$effect(() => {	title.set(		data.account			? fullNameFromPerson({ person: data.account?.contact })			: "Accounts",	);});</script>

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
          {@const dbKey = typeof key === "string" ? key : key.key}
          {@const required =
            dbKey === "address_1" ||
            dbKey === "phonePrimary" ||
            dbKey === "lastName" ||
            dbKey === "firstName" ||
            dbKey === "licenseNumber" ||
            dbKey === "city" ||
            dbKey === "stateProvince" ||
            dbKey === "zipPostal"}
          <label class="flex-1 min-w-max uppercase">
            {#if typeof key !== "string"}
              <span>
                {key.label || key.key}
                {#if required}
                  <span class="text-red-200"> * </span>
                {/if}
              </span>
              <input
                value={selected[key.key] || ""}
                onchange={(e) => {
                  // @ts-ignore
                  selected[key.key] = e.target.value;
                }}
                name={key.key}
                type={key.type}
                step={key.type === "number" ? 10 : undefined}
                {required}
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
