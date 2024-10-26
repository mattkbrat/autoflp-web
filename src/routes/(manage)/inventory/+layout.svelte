<script lang="ts">
import { page } from "$app/stores";

$: pathName = $page.url.pathname;
$: selected = pathName.endsWith("cars-for-sale")
	? "sale"
	: pathName.endsWith("print")
		? "print"
		: "inventory";
</script>

<svelte:head>
  <title>Inventory - AutoFLP</title>
</svelte:head>

<nav class="flex gap-4 print:hidden text-lg">
  <a
    class:underline={selected === "inventory"}
    class="hover:text-surface-300"
    href="/inventory"
  >
    Manage Inventory
  </a>
  <a
    href={"/inventory/cars-for-sale"}
    class:underline={selected === "sale"}
    class="hover:text-surface-300"
  >
    Manage Cars for Sale
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

<slot />
