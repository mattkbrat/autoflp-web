<script lang="ts">
import { page } from "$app/stores";
import { title } from "$lib/stores";
import { onMount } from "svelte";

const { children } = $props();

const pageMap = {
	"Expected Payments": "expected-payments",
	"Salesman Payments": "salesman-payments",
};

const selected = $derived(
	$page.url.pathname.split("/").pop() === pageMap["Expected Payments"]
		? "exp"
		: "sales",
);

onMount(() => {
	title.set("Inventory");
});
</script>

<nav class="flex gap-4 print:hidden text-lg">
  <a
    class:underline={selected === "exp"}
    class="hover:text-surface-300"
    href={`/admin/charts/${pageMap["Expected Payments"]}`}
  >
    Expected Payments
  </a>

  <a
    class:underline={selected === "sales"}
    href={`/admin/charts/${pageMap["Salesman Payments"]}`}
    class="hover:text-surface-300"
    data-sveltekit-reload
  >
    Salesman Payments
  </a>
</nav>

{@render children()}
