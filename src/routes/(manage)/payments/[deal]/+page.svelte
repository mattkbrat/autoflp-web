<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import { el } from "$lib/element";
import { formatCurrency, formatDate } from "$lib/format";
import type { GroupedAccountDeals } from "$lib/server/database/deal";
import { accountDeals } from "$lib/stores";
export let data;

let selected: GroupedAccountDeals[number] | null = null;

$: deal = $page.params.deal;
const today = new Date().toISOString().split("T")[0];
$: defaultPmt = selected?.pmt || 0;
$: if (deal && $accountDeals) {
	selected = $accountDeals.find((d) => d.id === deal) || null;
}
</script>

<h2>
  {$page.url.pathname}
</h2>

<div class="grid grid-cols-[1fr_1fr_auto]">
  <section id="heading" class="contents text-lg font-bold text-primary-300">
    <div>Date</div>
    <div class="text-right">$ (USD)</div>
    <div class="text-right"></div>
  </section>
  <section id="body" class="contents">
    <form
      method="post"
      class="contents"
      action="?/record"
      use:enhance={() => {
        return async ({ result, update }) => {
          if ("data" in result && result.data && "inserted" in result.data) {
            await update();
            setTimeout(() => {
              const element = el < HTMLInputElement > `pmt-date-input`;
              if (element) {
                element.value = today;
              }
            }, 200);
          }
        };
      }}
    >
      <input
        value={today}
        name="date"
        type="date"
        required
        class="input"
        id="pmt-date-input"
      />
      <input
        type="number"
        name="pmt"
        required
        class="input"
        value={Math.floor(+defaultPmt)}
      />
      <input type="hidden" name="deal" value={deal} required class="input" />
      <button type="submit">Save</button>
    </form>
    {#each data.payments as pmt}
      <form
        method="post"
        action="?/delete"
        class="even:bg-unset odd:bg-surface-700 contents"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.status === 200) {
              update();
            }
          };
        }}
      >
        <div>{formatDate(pmt.date)}</div>
        <div class="text-right">{formatCurrency(pmt.amount)}</div>
        <input type="hidden" name="id" value={pmt.id} />
        <button type="submit">Remove</button>
      </form>
    {/each}
  </section>
</div>
