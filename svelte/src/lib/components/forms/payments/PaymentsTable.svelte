<script lang="ts">
import { enhance } from "$app/forms";
import { formatCurrency } from "$lib/format";

import type { DetailedDeal } from "$lib/server/database/deal";
import type { PaymentsSchedule } from "$lib/finance/payment-history";
import type { Payment } from "@prisma/client";

let defaultPmt = $state({ account: "", amount: 0, deal: "" });
const {
	selected,
	schedule,
	payments,
}: {
	selected: NonNullable<DetailedDeal>;
	schedule: PaymentsSchedule;
	payments: Payment[];
} = $props();

const totalOwed = $derived(schedule?.remaining || 0);
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
	// waitForElm<HTMLInputElement>("#pmt-date-input").then((el) => {
	//   if (!el) return;
	//   today = now.toISOString().split("T")[0];
	//   el.value = today;
	// });
});
</script>

<section
  class="print:hidden bg-black/20 min-w-max flex-1 content-center pb-4 flex flex-col"
>
  <h2 class="text-lg underline underline-offset-2 tracking-wide">
    Admin Panel
  </h2>
  <div class="grid grid-cols-[1fr_1fr_auto] self-start gap-2 w-full">
    <section id="heading" class="contents text-lg font-bold text-primary-300">
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
          return async ({ update }) => {
            await update({ reset: false });
          };
        }}
      >
        <input
          value={new Date().toISOString().split("T")[0]}
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
        {#each payments as pmt}
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
        <div class="flex flex-row gap-1 col-span-full">
          <button
            type="submit"
            class="btn flex !h-fit gap-y-1 preset-outlined-tertiary-200-800 flex-1"
            formaction="?/getBill"
          >
            Get Bill
          </button>
          <button
            type="submit"
            class="btn flex !h-fit gap-y-1 preset-outlined-tertiary-200-800 col-span-full"
            formaction="?/getForms"
          >
            Get Forms
          </button>
        </div>
      </form>
    </section>
  </div>
</section>
