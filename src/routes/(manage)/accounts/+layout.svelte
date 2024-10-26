<script lang="ts">
import AccountCombobox from "$lib/components/AccountCombobox.svelte";
import { allAccounts } from "$lib/stores/accounts";
import { dealID, handleSelect } from "$lib/stores/selected.js";
import { onMount } from "svelte";

const { data, children } = $props();

$effect(() => {
	if (!$dealID) return;
	handleSelect("deal", "");
});
onMount(() => {
	allAccounts.set(data.accounts);
});
</script>

<svelte:head>
  <title>Accounts - AutoFLP</title>
</svelte:head>
<AccountCombobox />

{@render children()}
