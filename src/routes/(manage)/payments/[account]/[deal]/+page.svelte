<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import { el, waitForElm } from "$lib/element";
import {
	dateFormatStandard,
	formatCurrency,
	formatDate,
	fullNameFromPerson,
} from "$lib/format";
import type { Deals } from "$lib/server/database/deal";
import { accountDeals } from "$lib/stores";
import { browser } from "$app/environment";
import { addMonths } from "date-fns/addMonths";
import { addDays } from "date-fns/addDays";
export let data: PageServerData;
  import type { PageServerData } from "./$types";
  export let data: PageServerData;

  $: selected = data.deal;

const now = new Date();
let today = "";

$: if (!today && browser) {
	waitForElm<HTMLInputElement>("#pmt-date-input").then((el) => {
		if (!el) return;
		today = now.toISOString().split("T")[0];
		el.value = today;
	});
}

$: selectedFinance = +(selected?.finance || 0);
$: schedule = data.schedule;
$: scheduleRows = data.schedule.schedule.toReversed();
$: totalOwed = schedule.owed;

$: fullName =
	selected && fullNameFromPerson({ person: selected?.account.contact });
let defaultPmt = { account: "", amount: 0 };
$: totalDelinquent = schedule.totalDelinquent;
$: inventory = `${selected?.inventory?.make} ${selected?.inventory?.model}`;

let showMissingPayments = false;
let showFuturePayments = false;

$: filteredSchedule = scheduleRows.filter((r) => {
	if (r.paid) return true;
	if (r.dateType === "m") return true;
	if (r.dateType === "a") return showFuturePayments;
	return showMissingPayments;
});

$: if (selected?.id) {
	waitForElm<HTMLInputElement>("#pmt-amount").then((elm) => {
		elm?.focus();
	});
}

$: if (
	selected?.pmt &&
	(defaultPmt.amount === 0 || defaultPmt.account !== selected.id)
) {
	defaultPmt = {
		account: selected.id,
		amount: Math.floor(
			Math.min(selected ? +(selected.pmt || 0) : 0, totalOwed),
		),
	};
	waitForElm<HTMLInputElement>("#pmt-date-input").then((el) => {
		if (!el) return;
		today = now.toISOString().split("T")[0];
		el.value = today;
	});
}
</script>

<svelte:head>
  <title>{fullName} - Payments - {inventory}</title>
</svelte:head>
<h2 class="flex flex-col uppercase items-center">
  <span class="text-xl tracking-wider underline underline-offset-4"> </span>
  <span class="text-lg tracking-tight">
    {fullName}
  </span>
  <span class={"text-2xl"}>
    {inventory}
  </span>
</h2>
<hr />
<div class="flex flex-row uppercase justify-around text-center flex-wrap">
  <span>
    <span class="text-lg">
      {selected && formatCurrency(selectedFinance)}
    </span>
    <br />Financed
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule.totalPaid)}
    </span>
    <br /> paid
  </span>
  {#if schedule.totalDelinquent > 0}
    <span>
      <span class="text-lg">
        {formatCurrency(schedule.totalExpected)}
      </span>
      <br />Expected
    </span>
  {/if}
  {#if selected?.state && Math.abs(totalDelinquent) > 5}
    <span class:hidden={!totalDelinquent}>
      <span class="text-lg">
        {formatCurrency(Math.abs(totalDelinquent))}
      </span>
      <br />
      {totalDelinquent > 0 ? "delinquent" : "advanced"}
    </span>
  {/if}
  <span>
    <span class="text-lg">
      {formatCurrency(schedule.payoff)}
    </span>
    <br /> Payoff
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule.futurePaymentSum)}
    </span>
    <br /> remaining
  </span>
</div>
<hr />
<span class="grid grid-cols-3 border-b-2">
  <span>
    {selected && Number(selected.term)} month term;
    <span class="text-lg">
      {selected && formatCurrency(schedule.pmt)}
      Monthly;
    </span>
    <span>
      {selected && formatCurrency(selected.lien)}
      lien
    </span>
  </span>
  {#if selected?.date}
    <span class="text-center">
      Starting
      {formatDate(addMonths(selected.date, 1), "MMM yyyy")}
    </span>
  {/if}
  <span class="text-right">
    {#if selected?.state}
      Next payment due by
      <span class="text-lg">
        {formatDate(schedule.nextDueDate)}
      </span>
    {:else}
      Thank you!
    {/if}
  </span>
</span>

{#if selected}
  <div
    class="flex flex-col 2xl:flex-row gap-x-4"
    class:flex-row={data.payments.length > 10}
  >
    <section class="bg-black/20 py-6 px-2 print:hidden">
      <h2>Admin Panel</h2>
      <section class="flex flex-row flex-wrap text-surface-50">
        <form
          method="post"
          action="?/toggleState"
          class="contents"
          use:enhance={() => {
            return async ({ update }) => {
              await update();
            };
          }}
        >
          <input type="hidden" name="id" value={selected.id} />
          <input type="hidden" name="state" value={selected.state} />
          <button
            type="submit"
            class="btn variant-outline-secondary flex flex-col flex-1"
            class:bg-secondary-900={selected.state}
          >
            <span> Toggle State </span>
            <span class="text-sm">
              {selected?.state ? "open" : "closed"}
            </span>
          </button>
        </form>
        <button
          type="button"
          class="btn variant-outline-tertiary flex flex-col"
          class:bg-tertiary-900={showMissingPayments}
          on:click={() => (showMissingPayments = !showMissingPayments)}
        >
          <span> Missing Payments </span>
          <span class="text-sm">
            {showMissingPayments ? "show" : "hide"}
          </span>
        </button>
        <button
          type="button"
          class="btn variant-outline-tertiary flex flex-col"
          on:click={() => (showFuturePayments = !showFuturePayments)}
          class:bg-tertiary-900={showFuturePayments}
        >
          <span> Future Payments </span>
          <span class="text-sm">
            {showFuturePayments ? "show" : "hide"}
          </span>
        </button>
      </section>
      <div class="grid grid-cols-[1fr_1fr_auto] max-w-fit self-start gap-2">
        <section
          id="heading"
          class="contents text-lg font-bold text-primary-300"
        >
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
              value={today}
              name="date"
              type="date"
              required
              class="input"
              id="pmt-date-input"
              disabled={!selected.state}
            />
            <input
              type="number"
              name="pmt"
              id={"pmt-amount"}
              min={0}
              step={0.01}
              required
              class="input"
              bind:value={defaultPmt.amount}
              disabled={!selected.state}
            />
            <input
              type="hidden"
              name="deal"
              value={deal}
              required
              class="input"
            />
            <input
              type="hidden"
              name="balance"
              value={totalOwed}
              required
              class="input"
            />
            <button
              type="submit"
              class="btn variant-filled-success"
              disabled={!selected.state}
            >
              Save
            </button>
            <button
              class="btn variant-outline-secondary col-span-full"
              type="button"
              on:click={() => {
                defaultPmt.amount = schedule.payoff;
              }}>Apply remaining owed</button
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
              <input
                type="hidden"
                name="deal"
                value={deal}
                required
                class="input"
              />
              <div class="text-right">{formatCurrency(pmt.amount)}</div>
              <input type="hidden" name="id" value={pmt.id} />
              <button type="submit" class="btn variant-outline-error">
                Remove
              </button>
            </form>
          {/each}
        </section>
      </div>
    </section>

    <section class="flex-1 hidden md:block">
      <h2>Payment History</h2>
      <table class="w-full">
        <thead>
          <tr>
            <th>Date</th>
            <!-- <th>Monthly</th> -->
            <th>Paid</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Balance</th>
            <th>Advanced</th>
            <th>Int (%)</th>
            <th>Princ (%)</th>
          </tr>
        </thead>
        <tbody class="font-mono text-right">
          <!-- (r) => r.paid || Math.abs(differenceInMonths(r.date, today)) < 2 -->
          {#each filteredSchedule as row}
            {@const dateAfter = row.dateType === "a"}
            {@const isCurrentMonth = row.dateType === "m"}
            <tr
              class:!bg-gray-400={isCurrentMonth}
              class:dark:text-gray-200={!dateAfter && !isCurrentMonth}
              class:dark:!bg-gray-800={isCurrentMonth}
              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-900 dark:even:bg-black border-black"
              class:border-2={isCurrentMonth}
            >
              <td>
                {formatDate(addDays(row.date, 1), "MMM `yy")}
                <!-- <span> -->
                <!--   {row.date} -->
                <!-- </span> -->
              </td>
              <!-- <td> -->
              <!--   {formatCurrency(row.expected)} -->
              <!-- </td> -->
              <td
                class:text-center={!row.paid}
                class:text-red-600={!row.paid && !dateAfter}
              >
                {formatCurrency(row.paid)}
              </td>
              <td
                class:text-center={!row.interest}
                class:text-red-600={!row.paid && !dateAfter}
              >
                {formatCurrency(row.interest)}
              </td>
              <td
                class:text-center={!row.principal}
                class:text-red-600={!row.paid && !dateAfter}
              >
                {formatCurrency(row.principal)}
              </td>
              <td>
                {formatCurrency(row.lastBalance)}
              </td>
              <td>
                {formatCurrency(row.delinquentBalance * -1)}
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
        </tbody>
        <!-- <tfoot> -->
        <!-- </tfoot> -->
      </table>
    </section>
  </div>
{/if}
