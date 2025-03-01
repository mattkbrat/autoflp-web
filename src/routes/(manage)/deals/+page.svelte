<script lang="ts">
import { enhance } from "$app/forms";
import CreditorSelect from "$lib/components/CreditorSelect.svelte";
import { defaultDeal } from "$lib/finance";
import { calcFinance } from "$lib/finance/calc";
import {
	formatCurrency,
	formatDate,
	formatInventory,
	fullNameFromPerson,
} from "$lib/format";
import type { ParsedNHTA } from "$lib/server/inventory";
import { allAccounts, allCreditors, allInventory, toast } from "$lib/stores";
import {
	accountID,
	creditorID,
	inventoryID,
	dealID,
	handleSelect,
} from "$lib/stores/selected";
import { getZip } from "$lib/index";
import InventoryCombobox from "$lib/components/InventoryCombobox.svelte";
import AccCombobox from "$lib/components/AccountCombobox.svelte";

const deal = $state(defaultDeal);
const { form } = $props();

let currTrade = $state("");

$effect(() => {
	if (!$dealID) return;

	handleSelect("deal", "");
});

let trades: {
	make: string;
	year: number;
	model: string;
	vin: string;
	value: number;
}[] = $state([]);

$effect(() => {
	if (trades.length === deal.trades.length) return;
	deal.trades = trades.map((t) => t.vin);
});

$effect(() => {
	const priceTrade = trades.reduce((acc, t) => {
		return acc + t.value;
	}, 0);

	if (deal.priceTrade === priceTrade) return;

	deal.priceTrade = priceTrade;
});

const creditor = $derived($allCreditors.find((c) => c.id === $creditorID));

let lastCreditor = $state("");
let forms: string[] = $state([]);

$effect(() => {
	if (!creditor || lastCreditor === creditor.id) {
		console.log(lastCreditor, "last");
		return;
	}
	deal.apr = +creditor.apr;
	deal.filingFees = +creditor.filingFees;
	lastCreditor = creditor.id;
});

const inventory = $derived($allInventory.find((i) => i.vin === $inventoryID));
const account = $derived($allAccounts.find((a) => a.id === deal.account));

$effect(() => {
	if (!inventory || deal.vin === inventory.vin) return;
	updateDealType();
});
const handleGetZip = async (forms: string[]) => {
	if (!forms.length) {
		console.log("Cannot get 0 forms");
		return;
	}
	const account = $allAccounts.find((a) => a.id === deal.account);
	if (!account?.contact) {
		console.error("Could not submit deal", { account, deal });
		throw new Error("No account assigned");
	}
	await getZip(forms, { deal, person: account.contact, type: "deal" });
};

$effect(() => {
	if (!inventory) return;
	deal.vin = inventory.vin;
});

$effect(() => {
	if (!$accountID || deal.account === $accountID) return;

	deal.account = $accountID || "";
});

const finance = $derived(calcFinance(deal));

const isCredit = $derived(finance.type === "credit");

$effect(() => {
	if (deal.term !== 0 || deal.priceDown === finance.unpaidCashBalance) return;
	deal.priceDown = finance.unpaidCashBalance;
});
$effect(() => {
	if (deal.dealType === "cash" && deal.term !== 0) {
		deal.term = 0;
	} else if (deal.dealType === "credit" && deal.term === 0) {
		deal.term = 12;
	}
});

const handleSearched = async (result: unknown) => {
	if (typeof result !== "object" || !result || !("data" in result)) return;
	const parsed = result.data as ParsedNHTA;
	if (!parsed) {
		console.log("Could not parse", result);
		return;
	}
	const { wanted } = parsed;

	const newTrades = trades;
	newTrades.push({
		make: wanted.Make,
		model: wanted.Model,
		year: +(wanted["Model Year"] || 0) || 0,
		value: 0,
		vin: currTrade,
	});

	trades = newTrades;
	currTrade = "";
};

$effect(() => {
	if (!form) return;

	if (!form.data) {
		toast({
			title: "Failed to record deal",
			description: form.message,
			json: JSON.stringify(form, null, 2),
		});

		return;
	}

	toast({
		title: "Recorded deal",
		description: "",
		status: "success",
	});
	const { id: resultId, forms: dealForms } = form.data;
	deal.id = typeof resultId === "string" ? resultId : "";
	handleGetZip(dealForms).then(() => {
		forms = dealForms;
		form.data.forms = [];
	});
});

function updateDealType(t?: "credit" | "cash") {
	if (inventory) {
		deal.priceSelling = Number(
			t === "cash" ? inventory.cash : inventory.credit,
		);
	}

	if (t) {
		deal.dealType = t;
	}
}
</script>

{#if forms.length > 0}
  <div>
    <button
      class="btn-lg preset-outlined-secondary-200-800"
      type="button"
      onclick={async () => {
        await handleGetZip(forms);
      }}
    >
      Download Forms
    </button>
    <a target="_blank" href={`/payments/${deal.account}/${deal.id}`}>
      Goto Payments Page
    </a>
  </div>
{/if}

<form
  action="?/submit"
  method="post"
  class="flex flex-col flex-wrap space-y-4 print:hidden"
  id="inventory-form"
  use:enhance={() => {
    return async ({ update }) => {
      await update({ reset: false });
    };
  }}
>
  <div class="flex flex-row gap-2">
    <div class="flex-1">
      <AccCombobox selectType="deal" />
    </div>
    <label class="flex-1 min-w-max uppercase">
      Cosigner
      <input
        type="text"
        name="cosigner"
        bind:value={deal.cosigner}
        class="input"
      />
    </label>
  </div>
  <InventoryCombobox selectType="deal" />
  <input
    type={"hidden"}
    value={JSON.stringify(finance || {})}
    name={"finance"}
  />
  <input name="id" type="hidden" class="input" />
  <fieldset id="taxes" class="flex flex-row flex-wrap gap-4 items-end">
    <legend>Deal</legend>
    <label>
      DATE
      <input
        value={deal.date.toISOString().split("T")[0]}
        onchange={(e) => {
          const newDate = e.target?.value || new Date();
          deal.date = new Date(newDate);
        }}
        name={"date"}
        type="date"
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase">
      Term
      <input
        bind:value={deal.term}
        name={"term"}
        type="number"
        step={1}
        min={0}
        class="input"
        disabled={deal.dealType === "cash"}
      />
    </label>
    <button
      name={"term"}
      type="button"
      class="btn-md preset-outlined-secondary-200-800 h-full"
      onclick={() => {
        updateDealType(deal.dealType === "cash" ? "credit" : "cash");
      }}
    >
      <span> {deal.dealType === "cash" ? "Cash Deal" : "Credit Deal"}</span>
    </button>
  </fieldset>
  <fieldset id="taxes" class="flex flex-row flex-wrap gap-4">
    <legend>Tax</legend>
    <label class="flex-1 min-w-max uppercase">
      City
      <input
        bind:value={deal.taxCity}
        name={"taxCity"}
        type="number"
        step={0.1}
        min={0}
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase">
      State
      <input
        bind:value={deal.taxState}
        name={"taxState"}
        type="number"
        step={0.1}
        min={0}
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase">
      County
      <input
        bind:value={deal.taxCounty}
        name={"taxCounty"}
        type="number"
        step={0.1}
        min={0}
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase">
      Rtd
      <input
        bind:value={deal.taxRtd}
        name={"taxRtd"}
        type="number"
        step={0.1}
        class="input"
      />
    </label>
  </fieldset>

  <fieldset id="taxes" class="flex flex-row flex-wrap gap-4">
    <legend>Prices</legend>
    <label class="flex-1 min-w-max uppercase">
      Selling
      <input
        bind:value={deal.priceSelling}
        name={"priceSelling"}
        type="number"
        step={1}
        min={0}
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase">
      Down
      <input
        bind:value={deal.priceDown}
        name={"priceDown"}
        type="number"
        step={isCredit ? 10 : 0.01}
        min={0}
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase">
      Down Owed
      <input
        bind:value={deal.downOwed}
        max={deal.priceDown}
        name={"downOwed"}
        type="number"
        step={1}
        min={0}
        class="input"
      />
    </label>
    <label class="flex-1 min-w-max uppercase hidden">
      Trade
      <input
        bind:value={deal.priceTrade}
        name={"priceTrade"}
        type="number"
        step={1}
        min={0}
        class="input"
      />
    </label>
  </fieldset>
  <fieldset id="trades" class="flex flex-row flex-wrap gap-4 items-end">
    <legend>Trades</legend>
    <label class="col-span-2 flex-1">
      VIN
      <input class="input" bind:value={currTrade} />
    </label>
    <button
      class="btn-md preset-outlined-tertiary-200-800 w-24 h-full"
      type="button"
      onclick={() => {
        document.getElementById("deal-trade-search-button")?.click();
      }}
      disabled={!currTrade ||
        !!trades.find((t) => t.vin.toLowerCase() === currTrade.toLowerCase())}
    >
      Add
    </button>
  </fieldset>
  {#each trades as trade, n}
    <section class="flex flex-row flex-wrap gap-4 items-end">
      <span class="self-center uppercase">
        {trade.year}
        {trade.make}
        {trade.model}
        {trade.vin.slice(-4)}
      </span>
      <input
        class="hidden"
        name={`trade-${trade.vin}`}
        value={JSON.stringify(trade)}
      />
      <label class="flex-1 min-w-max">
        VALUE
        <input
          bind:value={trade.value}
          class="input"
          type="number"
          step={1}
          min={0}
        />
      </label>
      <button
        type="button"
        class="btn preset-outlined-warning-200-800 w-24"
        onclick={() => {
          const newTrades = trades;
          newTrades.splice(n, 1);
          trades = newTrades;
        }}>Delete</button
      >
    </section>
  {/each}
  <input name="trades" type="hidden" value={deal.trades.join(",")} />
  {#if deal.dealType === "credit"}
    <fieldset
      id="creditor-fieldset"
      class="flex flex-row flex-wrap gap-4 items-end"
    >
      <legend>Credit</legend>
      <label
        for="creditor-select"
        class="flex-1 min-w-max uppercase flex flex-col"
      >
        Creditor
        <CreditorSelect />
      </label>
      <label class="flex-1 min-w-max uppercase">
        Filing Fees ($)
        <input
          bind:value={deal.filingFees}
          name={"filingFees"}
          type="number"
          id="filingFees"
          step={0.01}
          min={0}
          class="input"
        />
      </label>
      <label class="flex-1 min-w-max uppercase">
        APR (%)
        <input
          bind:value={deal.apr}
          name={"apr"}
          type="number"
          step={0.1}
          min={0}
          class="input"
        />
      </label>
    </fieldset>
  {/if}
  <button type="submit" class="btn-lg preset-outlined-primary-200-800">
    Submit
  </button>
</form>

<form
  action="/inventory?/search"
  method="post"
  class="hidden"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      handleSearched(result);
    };
  }}
>
  <label class="col-span-2">
    Vin
    <input name="vin" bind:value={currTrade} />
  </label>
  <button type="submit" id="deal-trade-search-button">Search</button>
</form>

<hr />

{#snippet deal_stat({
  label,
  sublabel,
  value,
  render,
}: {
  label: string;
  sublabel?: string;
  value: string | number | undefined;
  render?: boolean;
})}
  <!-- border-surface-200-800/25 -->
  {#if render !== false}
    <div
      class="grid px-2 items-start border-x-[1px] border-warning-200-800 flex-1 min-w-64"
    >
      <span class="font-bold underline underline-offset-2">{label}</span>
      {#if sublabel}
        <span class="text-sm">{sublabel}</span>
      {/if}
      <span class="content-center inset-2">{value}</span>
    </div>
  {/if}
{/snippet}

<section
  id="deal-details"
  class="flex flex-wrap gap-4 bg-surface-800 outline p-[1px]"
>
  <h2 class="underline text-lg col-span-full uppercase w-full">
    {finance.type} Deal
  </h2>
  {@render deal_stat({
    label: "Account",
    value: account
      ? fullNameFromPerson({ person: account?.contact, withCell: true })
      : "",
  })}
  {@render deal_stat({
    label: "Inventory",
    value: account ? (inventory ? formatInventory(inventory) : "") : "",
  })}
  {@render deal_stat({
    label: "Cosigner",
    value: deal.cosigner,
    render: !!deal.cosigner,
  })}
  {@render deal_stat({
    label: "Trade Value",
    value: formatCurrency(finance.tradeValue),
    render: finance.tradeValue > 0,
  })}
  {@render deal_stat({
    label: finance.tradeValue > 0 ? "Selling Trade Diff." : "Selling Price",
    value: formatCurrency(finance.sellingTradeDifferential),
  })}
  {@render deal_stat({
    label: deal.term === 0 ? "Down Payment" : "Unpaid Cash Balance",
    value: formatCurrency(finance.unpaidCashBalance),
  })}
  {@render deal_stat({
    label: "Creditor",
    value: creditor?.businessName.toUpperCase(),
    // value: creditor ? fullNameFromPerson({ person: creditor?.contact }) : "",
    render: !!creditor,
  })}
  {@render deal_stat({
    label: "Creditor APR %",
    value: creditor?.apr,
    // value: creditor ? fullNameFromPerson({ person: creditor?.contact }) : "",
    render: !!creditor,
  })}
  {@render deal_stat({
    label: "First Payment, Due",
    value:
      finance.type === "credit" ? formatDate(finance.firstPaymentDueDate) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Monthly Payment",
    value:
      finance.type === "credit" ? formatCurrency(finance.monthlyPayment) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Last Payment, Due",
    value:
      finance.type === "credit" ? formatDate(finance.lastPaymentDueDate) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Last Payment",
    value: finance.type === "credit" ? formatCurrency(finance.lastPayment) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Total Tax ($)",
    value: formatCurrency(finance.totalTaxDollar),
  })}
  {@render deal_stat({
    label: "Cash Balance w/ Tax",
    value: formatCurrency(finance?.cashBalanceWithTax),
  })}
  {@render deal_stat({
    label: "Total Loan",
    value:
      finance.type === "credit" ? formatCurrency(finance.financeAmount) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: `Total of ${deal.term} Loan Payments`,
    value: finance.type === "credit" ? formatCurrency(finance.totalLoan) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Total Loan Interest",
    value:
      finance.type === "credit" ? formatCurrency(finance.deferredPayment) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Finance Amount",
    value:
      finance.type === "credit" ? formatCurrency(finance.financeAmount) : 0,
    render: isCredit,
  })}
  {@render deal_stat({
    label: "Total Cost",
    sublabel: "(price, interest, tax, fees)",
    value: finance.type === "credit" ? formatCurrency(finance.totalCost) : 0,
    render: isCredit,
  })}
</section>
