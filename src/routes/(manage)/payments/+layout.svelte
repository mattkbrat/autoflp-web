<script lang="ts">
import { groupedDeals, deals } from "$lib/stores";import { onMount } from "svelte";import PaymentCombobox from "$lib/components/PaymentCombobox.svelte";const { data, children } = $props();onMount(() => {	deals.set(data.deals);	groupedDeals.set(data.grouped);});</script>

<PaymentCombobox />
      
{@render children()}
