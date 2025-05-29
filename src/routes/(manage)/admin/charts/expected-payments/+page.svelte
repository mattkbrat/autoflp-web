<script lang="ts">
import { page } from "$app/stores";import ExpectedPayments from "$lib/components/charts/ExpectedPayments.svelte";import type { AccountDetail } from "$lib/server/database/deal";import { formatCurrency } from "$lib/format";import { onMount } from "svelte";import { title } from "$lib/stores";import Tabs from "$lib/components/tabs/Tabs.svelte";const { data } = $props();const salesmen = $derived(Object.keys(data.expected));let tab = $state("" as keyof typeof data.expected);$effect(() => {	if (tab) return;	tab = Object.keys(data)[0];});page.subscribe((p) => {	tab = p.url.hash ? decodeURIComponent(p.url.hash.slice(1)) : "";});let row = $derived(data.expected[tab] || {});onMount(() => {	title.set("Charts - Expected Payments");});</script>

<div class="print:hidden">
  <ExpectedPayments expected={data.expected} />
</div>

{#snippet section_head(paid: boolean)}
  <tr
    class="text-lg underline font-bold"
    class:text-red-200={!paid}
    class:text-green-200={paid}
  >
    <td> {paid ? "Paid" : "Unpaid"}</td>
  </tr>
{/snippet}

{#snippet row_info(r: AccountDetail)}
  {@const { name, lastPaid, address, vehicle, link: pmtLink, phone } = r}
  <tr class="border-2 border-white">
    <td>
      <input
        class="print:!bg-transparent print:outline-black outline-2 outline m-auto"
        type="checkbox"
      />
    </td>
    <td>
      <span class="underline">
        {name}
      </span>
      <br />

      <span>
        {lastPaid}
      </span>
      <br />
      <span class="print:hidden">
        <a class="text-blue-200 underline" href={pmtLink}> Deal Page </a>
      </span>
    </td>
    <td class="max-w-80">
      <span>
        {vehicle}
      </span>
      <br />
      <span>
        {phone}
      </span>
      <br />
      <span class="uppercase break-words">
        {address}
      </span>
    </td>
  </tr>
{/snippet}

<Tabs
  title={"Admin"}
  tabs={salesmen.map((salesman) => {
    return {
      id: encodeURIComponent(salesman),
      text: salesman,
    };
  })}
  asLinks
  useHash
  rootUrl="/admin/charts/expected-payments"
>
  <h3 class="col-span-full">{tab}</h3>
  <span>
    {formatCurrency(row.paid)} / {formatCurrency(row.paid + row.expected)}
  </span>
  <table class="table">
    <tbody>
      {@render section_head(true)}
      {#each row?.paidAccounts as r}
        {@render row_info(r)}
      {/each}
      {@render section_head(false)}
      {#each row?.unpaidAccounts as r}
        {@render row_info(r)}
      {/each}
    </tbody>
  </table>
</Tabs>
