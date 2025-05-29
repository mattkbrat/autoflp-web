<script lang="ts">
import { page } from "$app/state";import { formatDate, formatInventory } from "$lib/format";import { accountDeals } from "$lib/stores";import Tabs from "./tabs/Tabs.svelte";const thisUrl = $derived(page.params);$effect(() => console.log($state.snapshot(thisUrl)));const tabs = $derived(	$accountDeals.map((d) => {		return {			text: `${formatInventory(d.inventory)} - ${formatDate(				d.date,				"MMM dd ''yy",			)}`,			id: d.id,		};	}),);const rootUrl = $derived(`/payments/${thisUrl.account}`);</script>

<Tabs title="payments" trackUrl {rootUrl} {tabs} asLinks />
