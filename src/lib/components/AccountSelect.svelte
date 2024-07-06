<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { type NavType, handleAccNav } from "$lib/navState";
import { allAccounts, selectedStates } from "$lib/stores";
// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";

import { accountID, handleSelect } from "$lib/stores/selected";
</script>

<select
  required
  id="account-select"
  name="account"
  on:blur={(e) => {
    if (!e.target || !('value' in e.target) || typeof e.target.value !== 'string') return;
    handleSelect('account', e.target.value, navType)
  }}
  value={$accountID.value}
  class="bg-surface-800 text"
>
  <option value={navType === "query" ? "" : "new"}>Select an account</option>
  {#each $allAccounts as {contact: account, licenseNumber: license}}
    <option value={account.id}
      >{account.lastName}, {account.firstName} | {license}</option
    >
  {/each}
</select>
