<script lang="ts">
import MonthlyPayments from "$lib/components/charts/MonthlyPayments.svelte";
import { title } from "$lib/stores";
import { onMount } from "svelte";

const { data } = $props();

onMount(() => {
	title.set("Charts - Salesman Payments");
});
</script>

<MonthlyPayments payments={data.payments} />
