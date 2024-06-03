<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { type NavType, handleAccNav } from "$lib/navState";
import { allAccounts } from "$lib/stores";

// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";
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
