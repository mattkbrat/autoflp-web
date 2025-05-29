<script lang="ts">
import AccountCombobox from "$lib/components/AccountCombobox.svelte";import { allAccounts } from "$lib/stores/accounts";import { dealID, handleSelect } from "$lib/stores";import { title } from "$lib/stores";import { onMount } from "svelte";const { data, children } = $props();$effect(() => {	if (!$dealID) return;	handleSelect("deal", "");});onMount(() => {	allAccounts.set(data.accounts);	title.set("Accounts");});</script>

<AccountCombobox selectType={"account"} />

{@render children()}
