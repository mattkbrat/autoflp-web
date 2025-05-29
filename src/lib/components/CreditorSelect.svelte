<script lang="ts">
import { type NavType, handleAccNav } from "$lib/navState";import { allCreditors } from "$lib/stores";import { creditorID, handleSelect } from "$lib/stores/selected";</script>

<select
  id="creditor-select"
  name="creditor"
  value={$creditorID}
  on:blur={(e) => {
    if (
      !e.target ||
      !("value" in e.target) ||
      typeof e.target.value !== "string"
    )
      return;
    handleSelect("creditor", e.target.value);
  }}
  required
  class="bg-surface-800 text"
>
  <option value={""}>Select a creditor</option>
  {#each $allCreditors as account}
    <option value={account.id}>{account.businessName}</option>
  {/each}
</select>
