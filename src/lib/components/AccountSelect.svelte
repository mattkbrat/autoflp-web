<script>
import { goto } from "$app/navigation";
import { allAccounts } from "$lib/stores";
</script>

<select
  id="account-select"
  on:blur={(e) => e.target && goto("/accounts/" + e.target.value)}
  class="bg-surface-800 text"
>
  <option value="new">Select an account</option>
  {#each $allAccounts as account}
    <option value={account.id}>{account.lastName}, {account.firstName} | {account.license}</option>
  {/each}
</select>
