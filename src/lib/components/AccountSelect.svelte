<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { handleAccNav } from "$lib/navState";
import { allAccounts } from "$lib/stores";

export const navType: "query" | "folder" = "folder";
</script>

<select
  id="account-select"
  on:blur={(e) => {
    if (!e.target) return;
    handleAccNav({
      url: $page.url,
      account: e.target.value,
      navType,
    });
  }}
  class="bg-surface-800 text"
>
    <option value={navType === 'query' ? "" : 'new'}>Select an account</option>
  {#each $allAccounts as account}
    <option value={account.id}
      >{account.lastName}, {account.firstName} | {account.license}</option
    >
  {/each}
</select>
