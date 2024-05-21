<script lang="ts">
import { page } from "$app/stores";

export let data;

$: deals = data.deals || {};
</script>

<h2>
  {$page.url.pathname}
</h2>

<select>
  {#each deals as deal}
    <option>{deal.id}</option>
  {/each}
</select>

