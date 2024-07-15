<script lang="ts">
import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import AccountDealTabs from "$lib/components/AccountDealTabs.svelte";
import { accountDeals } from "$lib/stores";

export let data;

$: if (data.accountDeals) {
	accountDeals.set(data.accountDeals || []);
	const firstDeal = data.accountDeals[0];
	if (firstDeal && browser) {
		// console.log("Going to first deal");
		goto(`/payments/${firstDeal.accountId}/${firstDeal.id}`);
	}
}
</script>

<AccountDealTabs />
<slot />
