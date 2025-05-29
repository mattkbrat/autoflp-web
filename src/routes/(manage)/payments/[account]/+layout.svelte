<script lang="ts">
import { page } from "$app/stores";import AccountDealTabs from "$lib/components/AccountDealTabs.svelte";import { accountDeals } from "$lib/stores";const { data, children } = $props();$effect(() => {	if (!data.accountDeals || !$page.url) return;	accountDeals.set(data.accountDeals || []);});</script>

<div>
  <AccountDealTabs />

  {@render children()}
</div>
