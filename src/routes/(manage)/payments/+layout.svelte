<script lang="ts">
import AccountSelect from "$lib/components/AccountSelect.svelte";
import { groupedDeals, deals } from "$lib/stores";
import { onMount } from "svelte";
import type { PageData } from "./$types";

export let data: PageData;

onMount(() => {
	deals.set(data.deals);
	groupedDeals.set(data.grouped);
});
</script>

<AccountSelect baseRoute={"payment"} />
<slot />
