<script lang="ts">
import { goto } from "$app/navigation";import { page } from "$app/stores";import { waitForElm, printCanvas } from "$lib/element";import type { CashDeals, SalesmanPayments } from "$lib/server/database/deal";import { Chart } from "chart.js/auto";import { onMount } from "svelte";import { data } from "./monthly-payments-data";import { groupSalesmanPayments } from "$lib/finance";import { formatCurrency } from "$lib/format";import { sum } from "$lib/sum";const {	payments,	cashDeals,}: { payments: SalesmanPayments; cashDeals: CashDeals } = $props();let ctx: HTMLCanvasElement | null = null;let groupBy = $state<string[]>([]);let filterYear = $state<number | string>(	Number($page.url.searchParams?.get("year")) || "",);let taxRate = $state(15.3);let stacked = $state(true);const grouped = $derived(	groupSalesmanPayments(payments, cashDeals, {		salesman: true,		quarter: groupBy.includes("quarter"),		year: groupBy.includes("year"),		month: groupBy.includes("month"),	}),);let chartKey = $state<keyof typeof grouped>("paymentsGrouped");let groupedElement = $derived(grouped[chartKey]);const chartData = $derived(data(groupedElement));$effect(() => {	const newUrl = new URL($page.url);	const workingSearch = newUrl.searchParams;	if (!filterYear) {		workingSearch.delete("year");	} else {		workingSearch.set("year", filterYear.toString());	}	goto(`?${workingSearch.toString()}`);});const toggleGroupBy = (group: string, apply: boolean) => {	if (groupBy.includes(group) && !apply) {		groupBy = groupBy.filter((g) => g !== group);	} else if (apply) {		groupBy.push(group);	}};let chart = $state<ReturnType<typeof createChart>>(null);const chartOptions = $derived(	Object.assign(		{			plugins: {				title: {					display: true,					text: stacked ? "Salesman Payments - Stacked" : "Salesman Payments",				},			},		},		stacked			? {					responsive: true,					scales: {						x: {							stacked: true,						},						y: {							stacked: true,						},					},				}			: {},	),);const createChart = () => {	if (!ctx) return null;	return new Chart(ctx, {		type: "bar",		data: chartData,		options: chartOptions,	});};$effect(() => {	if (!chart) return;	chart.options = chartOptions;	chart.update();});$effect(() => {	if (!chartData) return;	if (chart) {		chart.data = chartData;		chart.update();		return;	}	chart = createChart();});onMount(() => {	waitForElm("#monthlyPayments").then((el) => {		if (!el || !(el instanceof HTMLCanvasElement)) {			console.log("Invalid element", el);			return;		}		ctx = el;	});	return () => {		chart?.destroy();	};});</script>

<div class="bg-surface-800 p-4 outline outline-offset-2">
  <label>
    Stacked
    <input type="checkbox" bind:checked={stacked} />
  </label>
  <div class="flex gap-4">
    Group by
    <label>
      quarter
      <input
        type="checkbox"
        checked={groupBy.includes("quarter")}
        onchange={(v) => {
          const isChecked = v.target?.checked as boolean;
          toggleGroupBy("quarter", isChecked);
        }}
      />
    </label>
    {#if !groupBy.includes("quarter")}
      <label>
        month
        <input
          type="checkbox"
          checked={groupBy.includes("month")}
          onchange={(v) => {
            const isChecked = v.target?.checked as boolean;
            toggleGroupBy("month", isChecked);
          }}
        />
      </label>
      <label>
        year
        <input
          type="checkbox"
          checked={groupBy.includes("year")}
          onchange={(v) => {
            const isChecked = v.target?.checked as boolean;
            toggleGroupBy("year", isChecked);
          }}
        />
      </label>
    {/if}
    <label class="flex items-center gap-2 ml-auto">
      Year
      <select class="input select preset-tonal-surface" bind:value={filterYear}>
        <option value="">No year</option>
        {#each Array.from(new Array(new Date().getFullYear() - 2020)) as _, k}
          {@const year = 2020 + k + 1}
          <option value={year}>
            {year}
          </option>
        {/each}
      </select>
    </label>
    <label class="flex gap-2 items-center">
      Chart Values
      <select
        bind:value={chartKey}
        class="input select preset-tonal-surface w-fit"
      >
        <option value="paymentsGrouped">Payments</option>
        <option value="cashDealsGrouped">Cash Deals</option>
        <option value="totalGrouped">Total</option>
      </select>
    </label>

    <button
      class="btn preset-tonal-secondary"
      type="button"
      onclick={() => {
        if (!ctx) return;
        printCanvas(ctx?.toDataURL(), chartOptions.plugins.title.text);
      }}
    >
      Print
    </button>
  </div>
  <div class="print:hidden">
    <canvas bind:this={ctx} id="monthlyPayments"></canvas>
  </div>
</div>

<label>
  Tax %
  <input bind:value={taxRate} type="number" class="input" />
</label>

<table class="table">
  <thead>
    <tr>
      <th>Salesman</th>
      <th>Payments</th>
      <th>Cash</th>
      <th>Total</th>
      <th>Tax <span class="text-sm"> - {taxRate}%</span></th>
    </tr>
  </thead>
  <tbody>
    {#each chartData["labels"] as group}
      {#each Object.keys(grouped["totalGrouped"][group]) as salesman}
        {@const total = sum(grouped["totalGrouped"]?.[group]?.[salesman] || [])}
        <tr>
          <td>{salesman}</td>
          <td>
            {formatCurrency(
              sum(grouped["paymentsGrouped"]?.[group]?.[salesman] || []),
            )}
          </td>
          <td>
            {formatCurrency(
              sum(grouped["cashDealsGrouped"]?.[group]?.[salesman] || []),
            )}
          </td>
          <td>
            {formatCurrency(total)}
          </td>
          <td>
            {formatCurrency(total * (taxRate / 100))}
          </td>
        </tr>
      {/each}
    {/each}
  </tbody>
</table>
