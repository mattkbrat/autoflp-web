<script lang="ts">
import { enhance } from "$app/forms";
import { fullNameFromPerson } from "$lib/format/fullNameFromPerson";
import { toast } from "$lib/stores";

const { data, form } = $props();

let submitButton: HTMLButtonElement;

type Changes = {
	licenses: UpdateObject;
	merge: {
		primary: string;
		ids: MergeAccount[];
	};
	salesmen: string[];
};

const defaultChanges = {
	licenses: {},
	salesmen: data.salesmen,
	merge: {
		primary: "",
		ids: [],
	},
};

let lastSubmitted = $state(0);

type MergeAccount = { contact: string; id: string };

type UpdateObject = { [id: string]: string };

let changes: Changes = $state(defaultChanges);

const updateMergeList = ({ contact, id }: MergeAccount, selected: boolean) => {
	const newAccounts = selected
		? changes.merge.ids.slice()
		: changes.merge.ids.filter((a) => a.id !== id);
	if (selected) {
		newAccounts.push({ contact, id });
	}

	changes.merge.ids = newAccounts;
};
$effect(() => {
	if (!form || form.timestamp === lastSubmitted) return;
	if (!form.success) {
		toast({
			title: "Failed to merge accounts",
			status: "error",
			description: form?.message,
		});
		return;
	}

	lastSubmitted = form.timestamp;
	changes = {
		...changes,
		licenses: {},
		salesmen: data.salesmen,
		merge: {
			primary: "",
			ids: [],
		},
	};
});
</script>

<h2 class="underline text-lg">Missing Accounts</h2>

<form
  method="post"
  action="?/save"
  use:enhance={() => {
    return async ({ update }) => {
      await update({ reset: false });
    };
  }}
>
  {#each Object.entries(changes.licenses) as [k, v]}
    <span>
      <input type="hidden" name={`${k}-license`} value={v} />
    </span>
  {/each}
  <div class="flex gap-x-2 items-end">
    <label class="flex-1">
      Select primary
      <select
        bind:value={changes.merge.primary}
        name={"link-primary"}
        class="select bg-surface-600"
      >
        {#each changes.merge.ids as { contact, id }}
          <option value={id}>
            {contact}
          </option>
        {/each}
      </select>
    </label>
    <button
      class="btn-md preset-tonal-secondary h-full"
      type="button"
      disabled={changes.merge.ids.length > 0
        ? changes.merge.ids.length < 2 || !changes.merge.primary
        : false}
      onclick={() => {
        if (data.salesmen.length !== changes.salesmen.length) {
          if (
            !confirm(
              "Updating salesmen; any removed will unlink the vehicle from the salesman.",
            )
          ) {
            return;
          }
        }

        if (changes.merge.ids.length) {
          if (!confirm("Merging accounts")) {
            return;
          }
        }
        submitButton.click();
      }}
    >
      Update
    </button>
    <button bind:this={submitButton} class="hidden"> Submit </button>
  </div>
  <table class="table relative">
    <thead class="sticky top-0 bg-surface-900 !text-white font-bold underline">
      <tr>
        <td> Merge </td>
        <td> Last Name </td>

        <td> First Name </td>
        <td> License # </td>
        <td> Is Salesman </td>
      </tr>
    </thead>
    <tbody>
      {#each data.missing as missing}
        {@const merging = changes.merge.ids.findIndex(
          (m) => m.id === missing.id,
        )}
        <tr class="odd:bg-surface-500/25">
          <td>
            <label>
              <input
                name="link-id"
                type="checkbox"
                checked={merging !== -1}
                value={missing.id}
                onchange={(e) => {
                  const selected = e.target.checked;
                  updateMergeList(
                    {
                      id: missing.id,
                      contact: `${fullNameFromPerson({ person: missing })} - ${missing.account?.licenseNumber}`,
                    },
                    selected,
                  );
                }}
              />
            </label>
          </td>
          <td>
            {missing.lastName}
          </td>
          <td>
            {missing.firstName}
          </td>
          <td>
            <input
              class="mr-2"
              defaultvalue={missing.account?.licenseNumber || ""}
              onchange={(e) => {
                changes.licenses[missing.id] = e.target?.value || "";
              }}
            />
            {#if missing.account?.id}
              <a href={`/accounts/${missing.account.id}`}> Account Page </a>
            {/if}
          </td>
          <td>
            <input
              name="salesman"
              type="checkbox"
              checked={changes.salesmen.includes(missing.id)}
              value={missing.id}
              onchange={(e) => {
                const selected = e.target.checked;
                if (!selected) {
                  changes.salesmen = changes.salesmen.filter(
                    (s) => s !== missing.id,
                  );
                  return;
                }
                const newSalesmen = changes.salesmen.slice();
                newSalesmen.push(missing.id);

                changes.salesmen = newSalesmen;
              }}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</form>
