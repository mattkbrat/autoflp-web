<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { waitForElm, printCanvas } from "$lib/element";
import type { SalesmanPayments } from "$lib/server/database/deal";
import { Chart } from "chart.js/auto";
import { onMount } from "svelte";
import { data } from "./monthly-payments-data";
import { groupSalesmanPayments } from "$lib/finance";

const { payments }: { payments: SalesmanPayments } = $props();

let ctx: HTMLCanvasElement | null = null;

let groupBy = $state<string[]>([]);
let filterYear = $state<number | string>(
	Number($page.url.searchParams?.get("year")) || "",
);

let stacked = $state(true);

const chartData = $derived(
	data(
		groupSalesmanPayments(payments, {
			salesman: true,
			quarter: groupBy.includes("quarter"),
			year: groupBy.includes("year"),
			month: groupBy.includes("month"),
		}),
	),
);

$effect(() => {
	const newUrl = new URL($page.url);
	const workingSearch = newUrl.searchParams;
	if (!filterYear) {
		workingSearch.delete("year");
	} else {
		workingSearch.set("year", filterYear.toString());
	}

	goto(`?${workingSearch.toString()}`);
});

const toggleGroupBy = (group: string, apply: boolean) => {
	if (groupBy.includes(group) && !apply) {
		groupBy = groupBy.filter((g) => g !== group);
	} else if (apply) {
		groupBy.push(group);
	}
};

let chart = $state<ReturnType<typeof createChart>>(null);

const chartOptions = $derived(
	Object.assign(
		{
			plugins: {
				title: {
					display: true,
					text: stacked ? "Salesman Payments - Stacked" : "Salesman Payments",
				},
			},
		},
		stacked
			? {
					responsive: true,
					scales: {
						x: {
							stacked: true,
						},
						y: {
							stacked: true,
						},
					},
				}
			: {},
	),
);

const createChart = () => {
	if (!ctx) return null;
	return new Chart(ctx, {
		type: "bar",
		data: chartData,
		options: chartOptions,
	});
};

$effect(() => {
	if (!chart) return;
	chart.options = chartOptions;
	chart.update();
});

$effect(() => {
	if (!chartData) return;
	if (chart) {
		chart.data = chartData;
		chart.update();
		return;
	}

	chart = createChart();
});

onMount(() => {
	waitForElm("#monthlyPayments").then((el) => {
		if (!el || !(el instanceof HTMLCanvasElement)) {
			console.log("Invalid element", el);
			return;
		}
		ctx = el;
	});

	return () => {
		chart?.destroy();
	};
});
</script>

<div class="bg-surface-800 p-4 outline outline-offset-2">
  <label>
    Stacked
    <input type="checkbox" bind:checked={stacked} />
  </label>
	<div class='flex gap-4'>
	Group by
  <label>
  	 quarter
  	<input
  	  type="checkbox"
  	  checked={groupBy.includes('quarter')}
			onchange = {(v) => {
			  const isChecked = v.target?.checked as boolean;
			  toggleGroupBy('quarter', isChecked)
			}}
  	/>
  </label>
  	{#if !(groupBy.includes('quarter'))}
  <label>
  	 month
  	<input
  	  type="checkbox"
  	  checked={groupBy.includes('month')}
			onchange = {(v) => {
			  const isChecked = v.target?.checked as boolean;
			  toggleGroupBy('month', isChecked)
			}}
  	/>
  </label>
  <label>
	  year	
  	<input
  	  type="checkbox"
  	  checked={groupBy.includes('year')}
			onchange = {(v) => {
			  const isChecked = v.target?.checked as boolean;
			  toggleGroupBy('year', isChecked)
			}}
  	/>
  </label>
{/if}
  <label class='flex items-center gap-2 ml-auto'>
  	Year
  <select class="input select preset-tonal-surface" bind:value={filterYear}>
  		<option value="">No year</option>
  	{#each Array.from(new Array(new Date().getFullYear() - 2020 )) as _, k}
  		{@const year = 2020 + k + 1}
  		<option value={year} >
	  		{year}
  		</option>
  	{/each}
  </select>
  </label>

		<button class="btn preset-tonal-secondary " type="button" onclick={() => {
			if (!ctx) return
			printCanvas(ctx?.toDataURL(), chartOptions.plugins.title.text)
		}}>
			Print
		</button>
	</div>
  <canvas bind:this={ctx} id="monthlyPayments"></canvas>
</div>
