<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import { el } from "$lib/element";
import type { AmortizationSchedule } from "$lib/finance/amortization";
import { formatCurrency, formatDate, fullNameFromPerson } from "$lib/format";
import type { Deals, Payments } from "$lib/server/database/deal";
import { accountDeals } from "$lib/stores";
import { differenceInMonths, isAfter, isSameMonth } from "date-fns";
import type { PageData } from "./$types";
export let data: PageData;

let selected: Deals[number] | null = null;

$: deal = $page.params.deal;
const now = new Date();
const nowTime = new Date().getTime();
let today = now.toISOString().split("T")[0];

$: if (!today) {
	today = now.toISOString().split("T")[0];
}
$: if (deal && $accountDeals) {
	selected = $accountDeals.find((d) => d.id === deal) || null;
}

$: selectedLien = +(selected?.lien || 0);
$: schedule = data.schedule;
$: scheduleRows = data.schedule.schedule.toReversed();
$: termExceeded = scheduleRows.length > +(selected?.term || 0);
$: totalExpected = termExceeded
	? selectedLien
	: scheduleRows.reduce((acc, curr) => acc + (curr.expected || 0), 0);
$: totalPaid = scheduleRows.reduce((acc, curr) => acc + (curr.paid || 0), 0);
$: totalOwed = schedule.owed;

$: defaultPmt = Math.min(selected ? +(selected.pmt || 0) : 0, totalOwed);
$: totalDelinquent = Math.floor(
	schedule.totalDelinquent > -totalPaid
		? selectedLien - totalPaid
		: Math.abs(schedule.totalDelinquent),
);

$: muchOwed = totalExpected - totalPaid > 10;

let showMissingPayments = false;
</script>

<h2 class="flex flex-col uppercase items-center">
  <span class="text-xl tracking-wider underline underline-offset-4">
    {selected?.inventory?.make}
    {selected?.inventory?.model}
  </span>
  <span class=" tracking-tight">
    {selected && fullNameFromPerson({ person: selected?.account.contact })}
  </span>
</h2>
<hr />
<div class="flex flex-row uppercase justify-around text-center">
  <span>
    <span class="text-lg">
      {selected && formatCurrency(selectedLien)}
    </span>
    <br />Lien
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule.totalPaid)}
    </span>
    <br /> total paid
  </span>
  <span class:hidden={!totalDelinquent}>
    <span class="text-lg">
      {formatCurrency(totalDelinquent)}
    </span>
    <br /> total {totalDelinquent > 0 ? "delinquent" : "advanced"}
  </span>
  <span>
    <span class="text-lg">
      {selected && Number(selected.term)} Month
    </span>
    <br />
    Term
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(totalOwed)}
    </span>
    <br /> Remaining Owed
  </span>
</div>
<hr />

{#if selected}
  <section class="print:hidden">
    {selected?.state ? "open" : "closed"}
    <form
      method="post"
      action="?/toggleState"
      class="contents"
      use:enhance={() => {
        return async ({ result, update, ...rest }) => {
          await update();
        };
      }}
    >
      <input type="hidden" name="id" value={selected.id} />
      <input type="hidden" name="state" value={selected.state} />
      <button type="submit" class="btn variant-outline-secondary"
        >Toggle State</button
      >
    </form>
    <button
      type="button"
      class="btn variant-outline-tertiary"
      on:click={() => (showMissingPayments = !showMissingPayments)}
      >Toggle Missing Payments</button
    >
  </section>

  <div class="flex flex-col lg:flex-row">
    <div
      class="grid grid-cols-[1fr_1fr_auto] max-w-fit self-start gap-2 print:hidden"
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
              if (
                "data" in result &&
                result.data &&
                "inserted" in result.data
              ) {
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
            max={totalOwed || 0}
            min={0}
            required
            class="input"
            value={Math.floor(+defaultPmt)}
          />
          <input
            type="hidden"
            name="deal"
            value={deal}
            required
            class="input"
          />
          <button
            type="submit"
            class="btn variant-filled-success"
            disabled={!selected.state}>Save</button
          >
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
            <button
              type="submit"
              class="btn variant-outline-error"
              disabled={!selected.state}>Remove</button
            >
          </form>
        {/each}
      </section>
    </div>

    <section class="flex-1 print:block">
      <h2>Amortization Schedule</h2>
      <table class="w-full">
        <thead>
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
        <tbody class="font-mono text-right">
          <!-- (r) => r.paid || Math.abs(differenceInMonths(r.date, today)) < 2 -->
          {#each scheduleRows.filter((r) => {
            const monthDiff = differenceInMonths(r.date, today);
            const hasMissingPayment = !r.paid;
            return monthDiff <= 1 && showMissingPayments ? !hasMissingPayment : true;
          }) as row}
            {@const dateAfter = isAfter(row.date, today)}
            {@const isCurrentMonth = isSameMonth(row.date, today)}
            <tr
              class:text--600={dateAfter && !isCurrentMonth}
              class:!bg-gray-400={isCurrentMonth}
              class:dark:text-gray-200={!dateAfter && !isCurrentMonth}
              class:dark:!bg-gray-800={isCurrentMonth}
              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-900 dark:even:bg-black border-black"
              class:border-2={isCurrentMonth}
            >
              <td>
                {formatDate(row.date, "MMM `yy")}
              </td>
              <td>
                {formatCurrency(row.expected)}
              </td>
              <td class:text-center={!row.paid} class:text-red-600={!row.paid && !dateAfter}>
                {formatCurrency(row.paid)}
              </td>
              <td class:text-center={!row.paid} class:text-red-600={!row.paid && !dateAfter}>
                {formatCurrency(row.interest)}
              </td>
              <td class:text-center={!row.paid} class:text-red-600={!row.paid && !dateAfter}>
                {formatCurrency(row.principal)}
              </td>
              <td>
                {formatCurrency(row.lastBalance)}
              </td>
              <td>
                {formatCurrency(row.delinquentBalance)}
              </td>
              <td>
                {formatCurrency(row.percentInterest * 100)}{" "}<span
                  class="text-xs">%</span
                >
              </td>
              <td>
                {formatCurrency(row.percentPrincipal * 100)}{" "}<span
                  class="text-xs">%</span
                >
              </td>
            </tr>
          {/each}
          <tr>
            <td />
            <td class:text-red-500={muchOwed} class:font-bold={muchOwed}>
              {formatCurrency(totalExpected)}
            </td>
            <td>{formatCurrency(totalPaid)} </td>
          </tr>
        </tbody>
        <!-- <tfoot> -->
        <!-- </tfoot> -->
      </table>
    </section>
  </div>
{/if}
