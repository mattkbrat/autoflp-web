<script>
import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { deals } from "$lib/stores";
import { handleSelect } from "$lib/stores/selected";
</script>

<select id="account-select" 

    required
    on:blur={(e) =>  {
    if (!e.target || !('value' in e.target) || typeof e.target.value !== 'string' || !browser ) return;
    handleSelect('payment', e.target.value, 'query')
    }}

  class="bg-surface-800 text">
    <option value="">Select Account</option>
  {#each Object.entries($deals) as [key, deal]}
    <option value={deal.account} >{key}</option>
  {/each}
</select>
