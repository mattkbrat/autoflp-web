<script lang="ts">
import { page } from "$app/stores";
import { TabAnchor, TabGroup } from "@skeletonlabs/skeleton";

import { accountDeals } from "$lib/stores";
</script>

<TabGroup
  justify="justify-center"
  active="variant-filled-primary"
  hover="hover:variant-soft-primary"
  flex="flex-1 lg:flex-none"
  rounded=""
  border=""
  class="w-full bg-surface-100-800-token"
>
  {#each $accountDeals || [] as deal}
    <TabAnchor
      href={`/payments/${deal.accountId}/${deal.id}`}
      selected={$page.url.pathname.endsWith(deal.id)}
    >
      <svelte:fragment slot="lead"
        >{deal.inventory.make} {deal.inventory.model}</svelte:fragment
      >
      <span>{deal.date}</span>
    </TabAnchor>
  {/each}
</TabGroup>
