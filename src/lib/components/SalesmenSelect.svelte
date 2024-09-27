<script lang="ts">
import { allSalesmen } from "$lib/stores";
export let selected: string[] = [];
</script>

<select
  id="salesmen-select"
  name="salesmen"
  multiple
  required
  class="bg-surface-800 text"
  value={selected || []}
>
  {#each $allSalesmen as { contact: account }}
    <option value={account.id}>{account.lastName}, {account.firstName}</option>
  {/each}
</select>
