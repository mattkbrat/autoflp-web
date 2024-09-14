<script lang="ts">
import { page } from "$app/stores";
import { TabAnchor, TabGroup } from "@skeletonlabs/skeleton";

import { accountDeals } from "$lib/stores";
</script>

<menu
  class="flex flex-row flex-wrap text-center bg-surface-700 print:hidden self-center"
>
  {#each $accountDeals || [] as deal}
    {@const isSelected = $page.url.pathname.endsWith(deal.id)}
    <a
      href={`/payments/${deal.accountId}/${deal.id}`}
      class="p-4 min-w-40"
      class:hover:bg-surface-600={!isSelected}
      class:bg-primary-600={isSelected}
    >
      <li>
        <span>
          {deal.inventory.make}
        </span>
        <span>
          {deal.inventory.model}
        </span>
        <br />
        <span>{deal.date.split("T")[0].split(" ")[0]}</span>
      </li>
    </a>
  {/each}
</menu>
