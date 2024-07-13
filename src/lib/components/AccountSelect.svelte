<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { type NavType, handleAccNav } from "$lib/navState";
import { allAccounts, selectedStates } from "$lib/stores";
// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";
export let baseRoute: "account" | "deal" = "account";

import { accountID, handleSelect } from "$lib/stores/selected";

console.log("acc", $allAccounts);
</script>

<select
  required
  id="account-select"
  name="account"
  on:blur={(e) => {
    if (!e.target || !('value' in e.target) || typeof e.target.value !== 'string') return;
    handleSelect(baseRoute, e.target.value, navType)
  }}
  value={$accountID.value}
  class="bg-surface-800 text"
>
  <option value={navType === "query" ? "" : "new"}>Select an account</option>
  {#each $allAccounts as {id, contact,licenseNumber}}
    {@const value = baseRoute === 'account' || baseRoute === 'deal' ? id : contact.id}
    <option value={value}
      >{contact.lastName}, {contact.firstName} | {licenseNumber}</option
    >
  {/each}
</select>
