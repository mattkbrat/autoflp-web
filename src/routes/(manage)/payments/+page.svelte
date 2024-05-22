<script lang="ts">
import { page } from "$app/stores";
import AccountDealTabs from "$lib/components/AccountDealTabs.svelte";
import { accountDeals, deals } from "$lib/stores";
import { onMount } from "svelte";

export let data;

let id: string | null = null;

page.subscribe((p) => {
	const thisId = p.url.searchParams.get("id");
	if (!thisId || id === thisId) return;
	id = thisId;
});

$: if (id) {
	const select = document.getElementById("account-select") as HTMLSelectElement;
	const index = Object.values($deals).findIndex((e) => e.account === id);
	if (select.selectedIndex !== index) {
		select.selectedIndex = index || 0;
		setTimeout(() => {
			select.focus();
		}, 200);
	}
	if (data.accountDeals) {
		accountDeals.set(data.accountDeals);
	}
}
</script>


<h2>
  {$page.url.pathname}
</h2>
