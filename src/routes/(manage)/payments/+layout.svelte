<script lang="ts">
import { groupedDeals, deals } from "$lib/stores";
import { onMount } from "svelte";
import type { PageData } from "./$types";
import PaymentCombobox from "$lib/components/PaymentCombobox.svelte";

export let data: PageData;

onMount(() => {
	deals.set(data.deals);
	groupedDeals.set(data.grouped);
});
</script>

<PaymentCombobox />
<slot />
