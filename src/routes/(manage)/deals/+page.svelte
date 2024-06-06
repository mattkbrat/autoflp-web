<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import AccountSelect from "$lib/components/AccountSelect.svelte";
import CreditorSelect from "$lib/components/CreditorSelect.svelte";
import InventorySelect from "$lib/components/InventorySelect.svelte";
import SalesmenSelect from "$lib/components/SalesmenSelect.svelte";
import { defaultDeal } from "$lib/finance";
import { calcFinance } from "$lib/finance/calc";
import { formatCurrency, formatDate } from "$lib/format";
import type { NavType } from "$lib/navState";
import { allAccounts, allCreditors, allInventory } from "$lib/stores";

const deal = defaultDeal;

$: search = $page.url.searchParams;
$: accountId = search.get("account");
$: vin = search.get("vin");

$: inventory = vin && $allInventory.find((i) => i.vin === vin);
$: account = accountId && $allAccounts.find((a) => a.id === accountId);
$: creditor = $allCreditors.find((c) => c.id === search.get("creditor"));

let lastCreditor = "";

$: if (creditor && creditor.businessName !== lastCreditor) {
	deal.apr = +creditor.apr;
	deal.filingFees = +creditor.filingFees;
	lastCreditor = creditor.businessName;
}

$: if (inventory && typeof inventory !== "string") {
	deal.vin = inventory.vin;
	deal.priceDown = Number(inventory.down || 0);
	const sellingPrice = deal.term > 0 ? inventory.credit : inventory.cash;
	deal.priceSelling = Number(sellingPrice || 0);
}

$: if (account && typeof account !== "string" && account.id !== deal.vin) {
	deal.account = account.id;
}

$: finance = calcFinance(deal);

$: if (deal.dealType === "cash" && deal.term !== 0) {
	deal.term = 0;
} else if (deal.dealType === "credit" && deal.term === 0) {
	deal.term = 12;
}

const navType: NavType = "query";
</script>

<h2>
  {$page.url.pathname}
</h2>


<form
  action="?/submit"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      if ("data" in result && result.data && "data" in result.data) {
        //await update();
        const resultId = result.data.id
        deal.id = typeof resultId === 'string'? resultId : '' ;
      }
    };
  }}
>
<AccountSelect {navType} />
<InventorySelect {navType} />
<SalesmenSelect {navType}/>
  <input name="salesmen" type="hidden" class="input" value={$page.url.searchParams.get('salesmen')} />
  <input name="id" type="hidden" class="input" />
  <button type="submit" class="btn variant-soft-success"> Submit </button>
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
  {#if deal.dealType === "credit"}
    <CreditorSelect {navType}/>
    <fieldset id="creditor-fieldset" class="flex flex-row flex-wrap gap-4">
      <legend>Credit</legend>
      <label class="flex-1 min-w-max uppercase">
        Filing Fees
        <input
          bind:value={deal.filingFees}
          name={"filingFees"}
          type="number"
          step={0.01}
          min={0}
          class="input"
        />
      </label>
      <label class="flex-1 min-w-max uppercase">
        APR
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
