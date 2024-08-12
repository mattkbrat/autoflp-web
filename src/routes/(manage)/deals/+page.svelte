<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import AccountSelect from "$lib/components/AccountSelect.svelte";
import CreditorSelect from "$lib/components/CreditorSelect.svelte";
import InventorySelect from "$lib/components/InventorySelect.svelte";
import SalesmenSelect from "$lib/components/SalesmenSelect.svelte";
import { defaultDeal } from "$lib/finance";
import { calcFinance } from "$lib/finance/calc";
import { formatCurrency, formatDate, fullNameFromPerson } from "$lib/format";
import type { NavType } from "$lib/navState";
import type { ParsedNHTA } from "$lib/server/inventory";
import { allAccounts, allCreditors, allInventory } from "$lib/stores";
import { accountID, creditorID, inventoryID } from "$lib/stores/selected";

const deal = defaultDeal;

let currTrade = "";

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

$: creditor = $allCreditors.find((c) => c.id === $creditorID.value);
let lastCreditor = "";
let forms: string[] = [];
$: if (creditor && lastCreditor !== creditor.id) {
	deal.apr = +creditor.apr;
	deal.filingFees = +creditor.filingFees;
	lastCreditor = creditor.id;
}

$: inventory = $allInventory.find((i) => i.vin === $inventoryID.value);
let lastInventory = "";

const getZip = async (forms: string[]) => {
	const formsSearch = forms.map((form) => {
		return ["file", form];
	});
	const search = new URLSearchParams(formsSearch);
	return fetch(`/api/get-file?${search.toString()}`)
		.then((resp) =>
			resp.status === 200
				? resp.blob()
				: Promise.reject("something went wrong"),
		)
		.then((blob) => {
			const account = $allAccounts.find((a) => a.id === deal.account);
			const name = fullNameFromPerson({ person: account?.contact || {} });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			// the filename you want
			// const urlEncoded = encodeURIComponent(name);
			const nameBase = `${name}_${
				deal.vin
			}_${deal.date.toDateString()}`.replace(/[^a-zA-Z0-9]/g, "_");
			a.download = `${nameBase}.zip`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			// or you know, something with better UX...
			alert("your file has downloaded!");
		});
};

$: if (inventory && inventory.id !== lastInventory) {
	deal.vin = inventory.vin;
	deal.priceDown = Number(inventory.down || 0);
	const sellingPrice = deal.term > 0 ? inventory.credit : inventory.cash;
	deal.priceSelling = Number(sellingPrice || 0);
	lastInventory = inventory.id;
}

$: if ($accountID.value) {
	deal.account = $accountID.value || "";
} else {
	console.log("No account id");
}

$: finance = calcFinance(deal);

$: if (deal.dealType === "cash" && deal.term !== 0) {
	deal.term = 0;
} else if (deal.dealType === "credit" && deal.term === 0) {
	deal.term = 12;
}

// $: console.log("deal update", deal);

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
	console.log(trades);
	currTrade = "";
};

const navType: NavType = "query";
</script>

{#if forms.length > 0}
  <button
    type="button"
    on:click={async () => {
      await getZip(forms);
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
    return async ({ result, update }) => {
      if ("data" in result && result.data && "data" in result.data) {
        //await update();
        const { id: resultId, forms: dealForms } = result.data.data || {
          id: "",
          forms: [],
        };
        deal.id = typeof resultId === "string" ? resultId : "";
        forms = dealForms;
        if (!Array.isArray(forms)) {
          console.log("Failed to get forms", result.data);
          return;
        }
        await getZip(forms);
      }
    };
  }}
>
  <AccountSelect {navType} baseRoute={"account"} />
  <InventorySelect {navType} />
  <SalesmenSelect />
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
        <CreditorSelect {navType} />
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
    Total Cost (price, interest, tax, fees)
    <input
      disabled
      value={finance.type === "credit" ? formatCurrency(finance.totalCost) : 0}
      class="input"
    />
  </label>
</fieldset>
