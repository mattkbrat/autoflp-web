<script lang="ts">
import { enhance } from "$app/forms";
import { page } from "$app/stores";
import AccountSelect from "$lib/components/AccountSelect.svelte";
import InventorySelect from "$lib/components/InventorySelect.svelte";
import { defaultDeal } from "$lib/finance";
import type { NavType } from "$lib/navState";
import { allAccounts, allInventory } from "$lib/stores";
const id = "";

const deal = defaultDeal;

$: search = $page.url.searchParams;
$: accountId = search.get("account");
$: vin = search.get("vin");

$: inventory = vin && $allInventory.find((i) => i.vin === vin);
$: account = accountId && $allAccounts.find((a) => a.id === accountId);

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

<AccountSelect {navType} />
<InventorySelect {navType} />
<form
  action="?/update"
  method="post"
  class="flex flex-col flex-wrap space-y-4"
  id="inventory-form"
  use:enhance={() => {
    return async ({ result, update }) => {
      if ("data" in result && result.data && "data" in result.data) {
        //await update();
        id = result.data.id;
      }
    };
  }}
>
  <input name="id" type="hidden" class="input" />
  <button type="submit" class="btn variant-soft-success"> Submit </button>
  <fieldset id="taxes" class="flex flex-row flex-wrap gap-4">
    <legend>Deal</legend>
    <label>
      First Payment
      <input
        value={deal.firstPayment.toISOString().split("T")[0]}
        on:change={(e) => {
          const newDate = e.target?.value || new Date();
          deal.firstPayment = new Date(newDate);
        }}
        name={"firstPayment"}
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
    <fieldset id="creditor-fieldset" class="flex flex-row flex-wrap gap-4">
      <legend>Credit</legend>
      <label class="flex-1 min-w-max uppercase">
        Filing Fees
        <input
          bind:value={deal.filingFees}
          name={"filingFees"}
          type="number"
          step={0.1}
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

<p>{JSON.stringify(inventory)} {vin}</p>
<p>{JSON.stringify(account)} {accountId}</p>
