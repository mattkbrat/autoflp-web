<script lang="ts">
import MonthlyPayments from "$lib/components/charts/MonthlyPayments.svelte";

const { data } = $props();
</script>

<MonthlyPayments payments={data.payments} />
