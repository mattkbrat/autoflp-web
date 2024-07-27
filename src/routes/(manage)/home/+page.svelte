<script lang="ts">
import { page } from "$app/stores";
import { formatDate, fullNameFromPerson } from "$lib/format";

import { deals } from "$lib/stores";
</script>

<h2>
  {$page.url.pathname}
</h2>
<p>Open Deals</p>
<div class="flex flex-col">
  {#each $deals as deal}
    <a href={`/payments/${deal.account.id}/${deal.id}`}
      >{fullNameFromPerson({ person: deal.account.contact })}
      {formatDate(deal.date)}</a
    >
  {/each}
</div>
