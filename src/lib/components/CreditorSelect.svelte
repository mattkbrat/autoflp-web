<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { type NavType, handleAccNav } from "$lib/navState";
import { allCreditors } from "$lib/stores";

// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";
</script>

<select
  id="creditor-select"
  name="creditor"
  value={$page.url.searchParams.get("creditor")}
  on:blur={(e) => {
    if (!e.target) return;
    handleAccNav({
      url: $page.url,
      account: e.target.value,
      navType,
      accType: 'creditor'
    });
  }}
  required
  class="bg-surface-800 text"
>
  <option value={navType === "query" ? "" : "new"}>Select a creditor</option>
  {#each $allCreditors as account}
    <option value={account.id}
      >{account.businessName}</option
    >
  {/each}
</select>
