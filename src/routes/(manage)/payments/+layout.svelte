<script lang="ts">
import AccountDealTabs from "$lib/components/AccountDealTabs.svelte";
import AccountSelect from "$lib/components/AccountSelect.svelte";
import { accountDeals, deals } from "$lib/stores";
import { onMount } from "svelte";

export let data;

onMount(() => {
	deals.set(data.deals);
});
</script>

<AccountSelect/>
<AccountDealTabs/>
<slot/>
