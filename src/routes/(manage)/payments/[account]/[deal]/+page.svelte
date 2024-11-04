<script lang="ts">
import { enhance } from "$app/forms";
import { el, waitForElm } from "$lib/element";
import { formatCurrency, formatDate, fullNameFromPerson } from "$lib/format";
import { browser } from "$app/environment";
import { addDays } from "date-fns/addDays";

const { data } = $props();

const selected = $derived(data.deal);

let payoff = $state(false);
const now = new Date();
let today = $state("");
let defaultPmt = $state({ account: "", amount: 0, deal: "" });

$effect(() => {
	if (today || !browser) return;
	waitForElm<HTMLInputElement>("#pmt-date-input").then((el) => {
		if (!el) return;
		today = now.toISOString().split("T")[0];
		el.value = today;
	});
});

const schedule = $derived(data.schedule);

$effect(() => console.table(schedule?.schedule));

const scheduleRows = $derived(schedule?.schedule.toReversed());
const totalOwed = $derived(schedule?.owed || 0);

const fullName = $derived(
	selected ? fullNameFromPerson({ person: selected?.account.contact }) : "",
);
const totalDelinquent = $derived(schedule?.totalDiff || 0);
const inventory = $derived(
	`${selected?.inventory?.make} ${selected?.inventory?.model}`,
);

// biome-ignore lint/style/useConst: changed by binded button
let showMissingPayments = $state(false);
// biome-ignore lint/style/useConst: changed by binded button
let showFuturePayments = $state(false);

const filteredSchedule = $derived(
	scheduleRows?.filter((r) => {
		if (r.monthType === "after") return showFuturePayments;
		if (r.monthType === "before" && r.paid === 0) return showMissingPayments;
		return true;
	}),
);

$effect(() => {
	if (!selected?.id) return;
	waitForElm<HTMLInputElement>("#pmt-amount").then((elm) => {
		elm?.focus();
	});
});

$effect(() => {
	if (selected?.id !== data.deal?.id) {
		setsele;
	}
});

$effect(() => {
	if (
		!selected ||
		(defaultPmt.account === selected.account.id &&
			defaultPmt.deal === selected.id)
	) {
		return;
	}

	defaultPmt = {
		account: selected.account.id,
		deal: selected.id,
		amount: Math.floor(
			Math.min(selected ? +(selected.pmt || 0) : 0, totalOwed),
		),
	};
	waitForElm<HTMLInputElement>("#pmt-date-input").then((el) => {
		if (!el) return;
		today = now.toISOString().split("T")[0];
		el.value = today;
	});
});
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
      {selected && formatCurrency(selected.lien)}
    </span>
    <br />Lien
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule?.totalPaid)}
    </span>
    <br /> paid
  </span>
  {#if totalDelinquent}
    <span>
      <span class="text-lg">
        {formatCurrency(schedule?.owed)}
      </span>
      <br />Expected
    </span>
  {/if}
  {#if selected?.state && Math.abs(totalDelinquent) > 5}
    <span class:hidden={!totalDelinquent}>
      <span class="text-lg">
        <span>
          {formatCurrency(Math.abs(totalDelinquent))}
        </span>
      </span>
      <br />
      {totalDelinquent < 0 ? "delinquent" : "advanced"}
      <br />
      {#if schedule?.monthsDelinquent}
        <span class="text-sm">
          {Math.abs(schedule?.monthsDelinquent)} mo.
        </span>
      {/if}
    </span>
  {/if}
  <span class:hidden={!selected.state}>
    <span class="text-lg">
      {formatCurrency(schedule.payoff)}
    </span>
    <br /> Payoff
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule?.remaining)}
    </span>
    <br />

    {#if selected?.state}
      remaining
    {:else}
      saved
    {/if}
    <span> </span>
  </span>
</div>
<hr />
<span class="grid grid-cols-3 border-b-2">
  <span>
    {selected && Number(selected.term)} month term;
    <span class="text-lg">
      {selected && formatCurrency(schedule?.pmt)}
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
      {formatDate(schedule.startDate)}
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
            class="btn preset-outlined-secondary-200-800 flex flex-col flex-1 !h-fit gap-y-1"
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
          class="btn preset-outlined-tertiary-200-800 flex flex-col !h-fit gap-y-1"
          class:bg-tertiary-900={showMissingPayments}
          onclick={() => (showMissingPayments = !showMissingPayments)}
        >
          <span> Missing Payments </span>
          <span class="text-sm">
            {showMissingPayments ? "show" : "hide"}
          </span>
        </button>
        <button
          type="button"
          class="btn preset-outlined-tertiary-200-800 flex flex-col !h-fit gap-y-1"
          onclick={() => (showFuturePayments = !showFuturePayments)}
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
            class:hidden={!selected.state}
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
              value={selected.id}
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
              class="btn preset-filled-success-800-200"
              disabled={!selected.state}
            >
              Save
            </button>
            <input
              type="checkbox"
              class="hidden"
              name="payoff"
              bind:checked={payoff}
            />
            <button
              class="btn preset-outlined-secondary-200-800 col-span-full"
              type="button"
              onclick={() => {
                defaultPmt.amount = schedule.payoff;
                payoff = true;
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
                value={selected.id}
                required
                class="input"
              />
              <div class="text-right">{pmt.amount}</div>
              <input type="hidden" name="id" value={pmt.id} />
              <button type="submit" class="btn preset-outlined-error-500">
                Remove
              </button>
            </form>
          {/each}
        </section>
      </div>
    </section>

    <section class="flex-1">
      <h2>Payment History</h2>
      <table class="w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>B. Bal</th>
            <th>Paid</th>
            <th>Advanced</th>
            <th>E. Bal</th>
          </tr>
        </thead>
        <tbody class="font-mono text-right">
          {#each filteredSchedule || [] as row}
            {@const dateAfter = row.monthType === "after"}
            {@const isCurrentMonth = row.monthType === "current"}
            <tr
              class:!bg-gray-400={isCurrentMonth}
              class:dark:text-gray-200={!dateAfter && !isCurrentMonth}
              class:dark:!bg-gray-800={isCurrentMonth}
              class="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-900 dark:even:bg-black border-black"
              class:border-2={isCurrentMonth}
            >
              <td>
                {row.dateFmt}
              </td>
              <td>
                {formatCurrency(row.start)}
              </td>
              <td>
                {row.paid}
              </td>
              <td class="grid grid-cols-2">
                {formatCurrency(row.diff)}
                <br />
                {formatCurrency(row.totalDiff)}
              </td>
              <td>
                {formatCurrency(row.owed)}
              </td>
            </tr>
          {/each}
        </tbody>
        <!-- <tfoot> -->
        <!--   <tr> -->
        <!--     <td class="row-span-full">* expected</td> -->
        <!--   </tr> -->
        <!-- </tfoot> -->
      </table>
    </section>
  </div>
{/if}
