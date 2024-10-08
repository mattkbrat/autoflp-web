<script lang="ts">
import { page } from "$app/stores";
import { accountDeals } from "$lib/stores";
</script>

<menu
  class="flex flex-row flex-wrap text-center bg-surface-700 print:hidden self-center text-lg w-full"
>
  {#each $accountDeals || [] as deal}
    {@const isSelected = $page.url.pathname.endsWith(deal.id)}
    <a
      href={`/payments/${deal.accountId}/${deal.id}`}
      class="py-1 min-w-40 outline outline-surface-800 flex-1"
      style={isSelected ? "z-index: 10" : undefined}
      class:hover:bg-surface-900={!isSelected}
      class:bg-primary-900={isSelected}
      class:!outline-white={isSelected}
    >
      <li>
        <span class="text-xl">
          <span>
            {deal.inventory.make}
          </span>
          <span>
            {deal.inventory.model}
          </span>
        </span>
        <br />
        <span>{deal.date.split("T")[0].split(" ")[0]}</span>
      </li>
    </a>
  {/each}
</menu>
