<script lang="ts">
import { enhance } from "$app/forms";
import CreditorSelect from "$lib/components/CreditorSelect.svelte";
import { defaultDeal } from "$lib/finance";
import { calcFinance } from "$lib/finance/calc";
import { formatCurrency, formatDate } from "$lib/format";
import type { NavType } from "$lib/navState";
import type { ParsedNHTA } from "$lib/server/inventory";
import { allAccounts, allCreditors, allInventory } from "$lib/stores";
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
import type { ActionData } from "./$types";

const deal = defaultDeal;
export let form: ActionData;

let currTrade = "";

$: if ($dealID) {
	handleSelect("deal", "");
}

let trades: {
	make: string;
	year: number;
	model: string;
	vin: string;
	value: number;
}[] = [];

$: deal.trades = trades.map((t) => t.vin);
$: deal.priceTrade = trades.reduce((acc, t) => {
	return acc + t.value;
}, 0);

$: creditor = $allCreditors.find((c) => c.id === $creditorID);
let lastCreditor = "";

let forms: string[] = [];

$: if (creditor && lastCreditor !== creditor.id) {
	deal.apr = +creditor.apr;
	deal.filingFees = +creditor.filingFees;
	lastCreditor = creditor.id;
}

$: inventory = $allInventory.find((i) => i.vin === $inventoryID);

let lastInventory = "";
let lastFilled = "credit";

const handleGetZip = async (forms: string[]) => {
	const account = $allAccounts.find((a) => a.id === deal.account);
	if (!account?.contact) {
		console.error("Could not submit deal", { account, deal });
		throw new Error("No account assigned");
	}
	await getZip(forms, { deal, person: account.contact, type: "deal" });
};

$: if (
	inventory &&
	(deal.dealType !== lastFilled || lastInventory !== inventory.id)
) {
	deal.priceDown = Number(inventory.down || 0);
	deal.vin = inventory.vin;
	const sellingPrice = deal.term > 0 ? inventory.credit : inventory.cash;
	deal.priceSelling = Number(sellingPrice || 0);
	lastFilled = deal.dealType;
	lastInventory = inventory.id;
}

$: if ($accountID) {
	deal.account = $accountID || "";
} else {
	console.log("No account id");
}

$: finance = calcFinance(deal);

$: if (deal.dealType === "cash" && deal.term !== 0) {
	deal.term = 0;
} else if (deal.dealType === "credit" && deal.term === 0) {
	deal.term = 12;
}

const handleSearched = async (result: unknown) => {
	if (typeof result !== "object" || !result || !("data" in result)) return;
	const parsed = result.data as ParsedNHTA;
	if (!parsed) {
		console.log("Could not parse", result);
		return;
	}
	const { wanted, info } = parsed;

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

$: if (form?.data) {
	const { id: resultId, forms: dealForms } = form.data || {
		id: "",
		forms: [],
	};
	deal.id = typeof resultId === "string" ? resultId : "";
	forms = dealForms;
	if (!Array.isArray(forms)) {
		console.log("Failed to get forms", form.data);
	} else {
		handleGetZip(forms);
	}
}
</script>

{#if forms.length > 0}
  <button
    type="button"
    on:click={async () => {
      await handleGetZip(forms);
    }}
  >
    Download Forms
  </button>
{/if}
<form
  action="?/submit"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
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
  <fieldset id="taxes" class="flex flex-row flex-wrap gap-4">
    <legend>Deal</legend>
    <label>
      DATE
      <input
        value={deal.date.toISOString().split("T")[0]}
        on:change={(e) => {
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
      class="btn variant-outline-secondary"
      on:click={() => {
        const newType = deal.dealType === "credit" ? "cash" : "credit";

        deal.dealType = newType;
      }}
    >
      {deal.dealType === "cash" ? "Cash" : "Credit"}
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
        step={10}
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
        step={10}
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
        step={10}
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
        step={10}
        min={0}
        class="input"
      />
    </label>
  </fieldset>
  <fieldset id="trades" class="flex flex-row flex-wrap gap-4">
    <legend>Trades</legend>
    <label class="col-span-2 flex-1">
      VIN
      <input class="input" bind:value={currTrade} />
    </label>
    <button
      class="btn variant-ringed-tertiary w-24"
      type="button"
      on:click={() => {
        document.getElementById("deal-trade-search-button")?.click();
      }}
      disabled={!currTrade ||
        !!trades.find((t) => t.vin.toLowerCase() === currTrade.toLowerCase())}
    >
      Add
    </button>
  </fieldset>
  {#each trades as trade, n}
    <section class="flex flex-row flex-wrap gap-4">
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
          step={10}
          min={0}
        />
      </label>
      <button
        type="button"
        class="btn variant-ringed-warning w-24"
        on:click={() => {
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
  <button type="submit" class="btn variant-ringed-primary"> Submit </button>
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

<fieldset id="deal-details" class="flex flex-row flex-wrap gap-4">
  <legend>
    Calced {finance.type}
  </legend>
  <label class:hidden={finance.type === "cash"} class="flex-1 min-w-max">
    Monthly Pay
    <input
      disabled
      value={finance.type === "credit"
        ? formatCurrency(finance.monthlyPayment)
        : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Last Payment, Due
    <input
      disabled
      value={finance.type === "credit"
        ? formatDate(finance.lastPaymentDueDate)
        : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Last Payment
    <input
      disabled
      value={finance.type === "credit"
        ? formatCurrency(finance.lastPayment)
        : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max max-w-[33%]">
    Total Tax ($)
    <input
      disabled
      value={formatCurrency(finance.totalTaxDollar)}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Total Loan
    <input
      disabled
      value={finance.type === "credit"
        ? formatCurrency(finance.financeAmount)
        : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Total of {deal.term} Loan Payments
    <input
      disabled
      value={finance.type === "credit" ? formatCurrency(finance.totalLoan) : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Total Loan Interest
    <input
      disabled
      value={finance.type === "credit"
        ? formatCurrency(finance.deferredPayment)
        : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Finance Amount
    <input
      disabled
      value={finance.type === "credit"
        ? formatCurrency(finance.financeAmount)
        : 0}
      class="input"
    />
  </label>
  <label class="flex-1 min-w-max" class:hidden={finance.type === "cash"}>
    Total Cost (price, interest, tax, fees)
    <input
      disabled
      value={finance.type === "credit" ? formatCurrency(finance.totalCost) : 0}
      class="input"
    />
  </label>
</fieldset>
