<script lang="ts">
import { allCreditors, allInventory, title } from "$lib/stores";import { onMount } from "svelte";const { data, children } = $props();allCreditors.set(data.creditors);allInventory.set(data.inventory);onMount(() => {	title.set("Deals");});</script>

{@render children()}
