<script lang="ts">
import type { PaymentsSchedule } from "$lib/finance/payment-history";
import { formatCurrency } from "$lib/format";
const { schedule }: { schedule: PaymentsSchedule } = $props();

// biome-ignore lint/style/useConst: changed by binded button
let showMissingPayments = $state(false);
// biome-ignore lint/style/useConst: changed by binded button
let showFuturePayments = $state(false);
const filteredSchedule = $derived(
	schedule.schedule?.filter((r) => {
		if (r.monthType === "after") return showFuturePayments;
		if (r.monthType === "before" && r.paid === 0) return showMissingPayments;
		return true;
	}),
);
</script>

<section class="flex-1 bg-black/20 min-w-max">
  <div class="flex gap-2 btn-group print:hidden justify-between">
    <h2 class="text-lg underline underline-offset-2 tracking-wide self-center">
      Payment History
    </h2>
    <div>
      <label for="showMissingPayments" class="flex items-center gap-x-2">
        <input
          type="checkbox"
          id="showMissingPayments"
          class="input w-4 aspect-square"
          bind:checked={showMissingPayments}
        />
        Missing Payments
      </label>
      <label for="showFuturePayments" class="flex items-center gap-x-2">
        <input
          type="checkbox"
          id="showFuturePayments"
          class="input w-4 aspect-square"
          bind:checked={showFuturePayments}
        />
        Future Payments
      </label>
    </div>
  </div>
  <table class="w-full">
    <thead>
      <tr>
        <th>Date</th>
        <th>B. Bal</th>
        <th>Paid</th>
        <th>Expected</th>
        <th>T. Paid</th>
        <th>E. Bal</th>
        <th>Advanced</th>
      </tr>
    </thead>
    <tbody class="font-mono text-right">
      {#each filteredSchedule || [] as row}
        {@const dateAfter = row.monthType === "after"}
        {@const isCurrentMonth = row.monthType === "current"}
        <tr
          class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-900 dark:even:bg-black border-black"
          class:!bg-gray-400={isCurrentMonth}
          class:dark:text-gray-200={!dateAfter && !isCurrentMonth}
          class:dark:!bg-gray-800={isCurrentMonth}
          class:border-4={isCurrentMonth}
          class:border-b-2={!isCurrentMonth}
        >
          <td>
            {row.dateFmt}
          </td>
          <td>
            {formatCurrency(row.start)}
          </td>
          <td>
            {formatCurrency(row.paid)}
          </td>
          <td>
            {formatCurrency(row.expected)}
          </td>
          <td>
            {formatCurrency(row.totalPaid)}
          </td>
          <td>
            {formatCurrency(row.owed)}
          </td>
          <td>
            {formatCurrency(row.totalDiff)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>
<section
  class="flex flex-row flex-wrap text-surface-50 col-span-full"
></section>
