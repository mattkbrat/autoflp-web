<script lang="ts">
import { browser } from "$app/environment";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import AccountDealTabs from "$lib/components/AccountDealTabs.svelte";
import { accountDeals } from "$lib/stores";
import type { PageData } from "./$types";

export let data: PageData;

$: if (data.accountDeals && $page.url) {
	accountDeals.set(data.accountDeals || []);
}
</script>

<AccountDealTabs />
<slot />
