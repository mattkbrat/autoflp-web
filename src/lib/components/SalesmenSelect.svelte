<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { el } from "$lib/element";
import { type NavType, handleAccNav } from "$lib/navState";
import { allSalesmen } from "$lib/stores";

// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";

$: selected = $page.url.searchParams.get("salesmen");
</script>

<select
  id="salesmen-select"
  name="salesmen"
  multiple
  on:blur={(e) => {
    const children = e.target?.children;
    if (!children) return;
    const selected =  Array.from(children).filter((c) => c.selected).map((c) => c.value).join(",");
    handleAccNav({
      url: $page.url,
      account: selected,
      navType,
      accType: 'salesmen'
    });
  }}
  required
  class="bg-surface-800 text"
>
  <option value={navType === "query" ? "" : "new"}>Select an account</option>
  {#each $allSalesmen as account}
    <option value={account.contact} selected={selected?.includes(account.contact)}
      >{account.lastName}, {account.firstName}</option
    >
  {/each}
</select>
