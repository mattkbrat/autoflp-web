<script>
import { goto } from "$app/navigation";
import { deals } from "$lib/stores";
</script>

<select id="account-select" on:blur={(e) => e.target && goto("/payments?id="+e.target.value) } class="bg-surface-800 text">
  {#each Object.entries($deals) as [key, deal]}
    <option value={deal.account} >{key}</option>
  {/each}
</select>