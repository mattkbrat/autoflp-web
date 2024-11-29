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

<div class="flex">
  <h2>
    <a href="/admin" class:underline={$page.url.href.endsWith("admin")}>
      Admin
    </a>
  </h2>
  <span>/</span>
  <a href="/admin/charts" class:underline={$page.url.href.includes("charts")}>
    Charts
  </a>
</div>

{@render children()}
