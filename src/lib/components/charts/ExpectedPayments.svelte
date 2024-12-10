<script lang="ts">
import type { ExpectedWithPayments } from "$lib/server/database/deal";
import { onMount } from "svelte";
import { waitForElm, printCanvas } from "$lib/element";
import { Chart } from "chart.js/auto";
import { data } from "./expected-payments-data";
import { page } from "$app/stores";
import { goto } from "$app/navigation";
const { expected }: { expected: ExpectedWithPayments } = $props();
let ctx: HTMLCanvasElement | null = null;
let chart = $state<ReturnType<typeof createChart>>(null);

const now = new Date();

let stacked = $state(true);
let filterMonth = $state(
	Number($page.url.searchParams?.get("month")) || now.getMonth() + 1,
);
let filterYear = $state(
	Number($page.url.searchParams?.get("year")) ||
		now.getFullYear() ||
		now.getFullYear(),
);

const filter = () => {
	if (!filterYear || !filterMonth) return;
	const url = new URL($page.url);
	url.searchParams.set("year", filterYear.toString());
	url.searchParams.set("month", filterMonth.toString());
	goto(url);
};

const chartOptions = $derived(
	Object.assign(
		{
			plugins: {
				title: {
					display: true,
					text: "Expected and Received Current Month's Payments",
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

const chartData = $derived(data(expected));

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
	waitForElm("#expectedPayments").then((el) => {
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
  <div class="flex justify-between">
    <label>
      Stacked
      <input type="checkbox" bind:checked={stacked} />
    </label>
    <div class="flex flex-1 mx-16 gap-x-2">
      <select
        class="input select preset-tonal-surface"
        bind:value={filterMonth}
      >
        {#each Array.from(new Array(12)) as _, i}
          {@const month = 1 + i}
          <option value={month}>
            {month}
          </option>
        {/each}
      </select>
      <select class="input select preset-tonal-surface" bind:value={filterYear}>
        {#each Array.from(new Array(new Date().getFullYear() + 1 - 2020)) as _, k}
          {@const year = 2020 + k + 1}
          <option value={year}>
            {year}
          </option>
        {/each}
      </select>
    </div>
    <div>
      <button
        class="btn preset-tonal-primary"
        type="button"
        onclick={() => {
          if (!ctx) return;
          filter();
        }}
      >
        Filter
      </button>
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
  </div>
  <canvas bind:this={ctx} id="expectedPayments"></canvas>
</div>
