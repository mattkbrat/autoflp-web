<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import { el } from "$lib/element";
import type { AmortizationSchedule } from "$lib/finance/amortization";
import { formatCurrency, formatDate } from "$lib/format";
import type { GroupedAccountDeals, Payments } from "$lib/server/database/deal";
import { accountDeals } from "$lib/stores";
export let data: { payments: Payments; schedule: AmortizationSchedule };

let selected: GroupedAccountDeals[number] | null = null;

$: deal = $page.params.deal;
const now = new Date();
const nowTime = new Date().getTime();
let today = now.toISOString().split("T")[0];
$: defaultPmt = selected?.pmt || 0;
$: if (deal && $accountDeals && !selected) {
	selected = $accountDeals.find((d) => d.id === deal) || null;
}

$: schedule = data.schedule;
$: scheduleRows = data.schedule.schedule.toReversed();
</script>

<h2>
  {$page.url.pathname}
</h2>

<div class="flex flex-col lg:flex-row">
  <div
    class="grid grid-cols-[1fr_1fr_auto] max-w-fit self-center gap-2 print:hidden"
  >
    <section id="heading" class="contents text-lg font-bold text-primary-300">
      <div>Date</div>
      <div class="text-right">$ (USD)</div>
      <div class="text-right"></div>
    </section>
    <section id="body" class="contents">
      <form
        method="post"
        class="contents print:hidden"
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
          bind:value={today}
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

  <section class="flex-1 print:block">
    <h2>Amortization Schedule</h2>
    <table class="w-full">
      <thead class="text-left">
        <tr>
          <th>Date</th>
          <th>Expected</th>
          <th>Paid</th>
          <th>Interest</th>
          <th>Principal</th>
          <th>Balance</th>
          <th>Delinquent</th>
          <th>Int (%)</th>
          <th>Princ (%)</th>
        </tr>
      </thead>
      <tbody>
        {#each scheduleRows as row}
          {@const dateTime = row.date.getTime()}
          {@const dateState = dateTime > nowTime ? "after" : "before"}
          {@const isCurrentMonth =
            row.date.getMonth() === now.getMonth() &&
            row.date.getFullYear() === now.getFullYear()}
          <tr
            class:text-gray-600={dateState === "before" && !isCurrentMonth}
            class:!bg-gray-400={isCurrentMonth}
            class:dark:text-gray-200={dateState === "before" && !isCurrentMonth}
            class:dark:!bg-gray-800={isCurrentMonth}
            class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-900 dark:even:bg-black"
          >
            <td>
              {formatDate(row.date)}
            </td>
            <td>
              {formatCurrency(row.expected)}
            </td>
            <td>
              {formatCurrency(row.paid)}
            </td>
            <td>
              {formatCurrency(row.interest)}
            </td>
            <td>
              {formatCurrency(row.principal)}
            </td>
            <td>
              {formatCurrency(row.lastBalance)}
            </td>
            <td>
              {formatCurrency(row.delinquentBalance)}
            </td>
            <td>
              {(row.percentInterest * 100).toFixed(0)}{" "}<span class="text-xs"
                >%</span
              >
            </td>
            <td>
              {(row.percentPrincipal * 100).toFixed(0)}{" "}<span
                class="text-xs">%</span
              >
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</div>
