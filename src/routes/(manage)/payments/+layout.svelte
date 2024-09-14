<script lang="ts">
import { groupedDeals, deals } from "$lib/stores";
import { onMount } from "svelte";
import type { PageData } from "./$types";
import AccountCombobox from "$lib/components/AccountCombobox.svelte";

export let data: PageData;

onMount(() => {
	deals.set(data.deals);
	groupedDeals.set(data.grouped);
});
</script>

<AccountCombobox />
<slot />
