
<script lang="ts">
import { page } from "$app/stores";

const { children } = $props();

const pageMap = {
	"Expected Payments": "expected-payments",
	"Salesman Payments": "salesman-payments",
};

let selected = $derived(
	$page.url.pathname.split("/").pop() === pageMap["Expected Payments"]
		? "exp"
		: "sales",
);
</script>

<svelte:head>
  <title>Inventory - AutoFLP</title>
</svelte:head>

<nav class="flex gap-4 print:hidden text-lg">
  <a
    class:underline={selected === "exp"}
    class="hover:text-surface-300"
    href={`/admin/charts/${pageMap["Expected Payments"]}`}
  >
    Expected Payments
  </a>

  <a
    class:underline={selected === 'sales'}
    href={`/admin/charts/${pageMap["Salesman Payments"]}`}
    class="hover:text-surface-300"
    data-sveltekit-reload
  >
    Salesman Payments
  </a>
</nav>

{@render children()}
