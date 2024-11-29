<script lang="ts">
import { page } from "$app/stores";
import { title } from "$lib/stores";
import { onMount } from "svelte";

const { children } = $props();

const selected = $derived(
	$page.url.pathname.endsWith("print") ? "print" : "inventory",
);

onMount(() => {
	title.set("Inventory");
});
</script>

<nav class="flex gap-4 print:hidden text-lg">
  <a
    class:underline={selected === "inventory"}
    class="hover:text-surface-300"
    href="/inventory"
  >
    Manage Inventory
  </a>

  <a
    href="/inventory/print?state=1"
    class:underline={selected === "print"}
    class="hover:text-surface-300"
    data-sveltekit-reload
  >
    Print inventory
  </a>
</nav>

{@render children()}
