<script lang="ts">
import { enhance } from "$app/forms";
import { el, waitForElm } from "$lib/element";
import {
	formatCurrency,
	formatInventory,
	formatSalesmen,
	fullNameFromPerson,
} from "$lib/format";
import { browser } from "$app/environment";
import { differenceInDays, formatDate } from "date-fns";
import { title } from "$lib/stores/title.js";

const { data } = $props();

const selected = $derived(data.deal);

const salesmen = $derived(
	selected
		? formatSalesmen(selected?.inventory.inventory_salesman, "firstName")
		: "",
);

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

const pmtIsLate = $derived(
	schedule ? differenceInDays(now, schedule.nextDueDate) : 0,
);

// console.log($state.snapshot(schedule));
const scheduleRows = $derived(schedule?.schedule.toReversed());
const totalOwed = $derived(schedule?.remaining || 0);

const fullName = $derived(
	selected
		? fullNameFromPerson({
				person: selected.account.contact,
			})
		: "",
);
const totalDelinquent = $derived(schedule?.totalDiff || 0);
const inventory = $derived(
	selected ? formatInventory(selected?.inventory) : "",
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

$effect(() => {
	title.set(`${fullName} - ${inventory}`);
});
</script>

<h2 class="flex flex-col uppercase items-center">
  <span class="text-xl tracking-wider underline underline-offset-4"> </span>
  <span class="text-lg tracking-tight">
    {fullName}
  </span>
  <span class={"text-2xl"}>
    {inventory}
  </span>
  <span class="print:hidden text-gray-300">
    (
    {#if selected && salesmen}
      Sold by {salesmen}
    {:else if selected}
      No salesman
    {/if}
    )
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
        {formatCurrency(schedule?.totalExpected)}
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
  <span class:hidden={!selected?.state}>
    <span class="text-lg">
      {formatCurrency(schedule?.payoff)}
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
    <span class="text-lg text-primary-200 print:text-primary-800">
      {selected && formatCurrency(schedule?.pmt)}
      Monthly
    </span>
  </span>
  {#if selected?.date && schedule}
    <span class="text-center">
      Starting
      {formatDate(schedule.startDate, "MMM. do ''yy")}
    </span>
  {/if}
  <span class="text-right">
    {#if selected?.state && schedule}
      Nex payment due by
      <span class="text-lg" class:text-red-400={pmtIsLate > 0}>
        {formatDate(
          schedule.nextDueDate,
          schedule.nextDueDate.getFullYear() < now.getFullYear()
            ? "MMM. do yyyy"
            : "MMM. do",
        )}
        {#if pmtIsLate > 60}
          {"!!!"}
        {:else if pmtIsLate > 30}
          {"!!"}
        {:else if pmtIsLate > 7}
          {"!"}
        {/if}
        <br />
      </span>
    {:else}
      Thank you!
    {/if}
  </span>
</span>

{#if selected}
  <div
    class="flex flex-col md:flex-row gap-x-4"
    class:flex-row={data.payments.length > 10}
  >
    <section class="bg-black/20 px-2 print:hidden">
      <h2 class="text-lg underline underline-offset-2 tracking-wide">
        Admin Panel
      </h2>
      <div class="grid grid-cols-[1fr_1fr_auto] max-w-fit self-start gap-2">
        <section
          id="heading"
          class="contents text-lg font-bold text-primary-300"
        >
          <span>Date</span>
          <span>$ (USD)</span>
          <span></span>
        </section>
        <section id="body" class="contents">
          <form
            method="post"
            class="contents"
            action="?/record"
            use:enhance={() => {
              return async ({ result, update }) => {
                await update();
                if (
                  "data" in result &&
                  result.data &&
                  "inserted" in result.data
                ) {
                  setTimeout(() => {
                    const element = el<HTMLInputElement>`pmt-date-input`;
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
            <input type="hidden" name="id" value={selected.id} />
            <input type="hidden" name="state" value={selected.state} />
            <input type="hidden" name="payoff" value={schedule?.payoff} />
            <hr class="col-span-full" />
            <span class="underline underline-offset-2">Date</span>
            <span class="underline underline-offset-2">Amount</span>
            <span class="underline underline-offset-2">Select</span>
            {#each data.payments as pmt}
              <label class="contents">
                <span>
                  {pmt.date.split(" ")[0]}
                </span>
                <span>
                  {formatCurrency(pmt.amount)}
                </span>
                <input
                  class="checkbox"
                  type="checkbox"
                  value={pmt.id}
                  name={"pmt-id"}
                />
              </label>
            {/each}
            <hr class="col-span-full" />
            <div class="flex flex-row gap-1 col-span-full">
              <button
                class="btn preset-outlined-secondary-200-800 h-full flex-1"
                type="button"
                onclick={() => {
                  defaultPmt.amount = schedule?.payoff || 0;
                }}
              >
                Apply Remaining Owed
              </button>
              <button
                type="submit"
                class="btn flex flex-col flex-1 !h-fit gap-y-1"
                class:preset-outlined-secondary-200-800={!selected.state}
                class:preset-outlined-warning-200-800={selected.state}
                formaction="?/toggleState"
              >
                <span>{selected.state ? "Close Deal" : "Open Deal"}</span>
              </button>
              <button
                type="submit"
                class="btn flex flex-col flex-1 h-full gap-y-1 preset-outlined-warning-200-800"
                formaction="?/delete"
              >
                Remove Selected
              </button>
            </div>
          </form>
          <section
            class="flex flex-row flex-wrap text-surface-50 col-span-full"
          >
            <button
              type="button"
              class="btn preset-outlined-tertiary-200-800 flex flex-col !h-fit gap-y-1 flex-1"
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
        </section>
      </div>
    </section>

    <section class="flex-1 bg-black/20">
      <h2 class="text-lg underline underline-offset-2 tracking-wide">
        Payment History
      </h2>
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
  </div>
{/if}
