<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { type NavType, handleAccNav } from "$lib/navState";
import { allCreditors } from "$lib/stores";
import { handleSelect } from "$lib/stores/selected";

// biome-ignore lint/style/useConst: changes between routes
export let navType: NavType = "folder";
</script>

<select
  id="creditor-select"
  name="creditor"
  on:blur={(e) => {
    if (!e.target || !('value' in e.target) || typeof e.target.value !== 'string') return;
    setTimeout(() => {
      document.getElementById('filingFees')?.scrollIntoView()
      document.getElementById('filingFees')?.focus()
    }, 50)
    handleSelect('creditor', e.target.value, navType)
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
