<script lang="ts">
import { page } from "$app/stores";
import { TabGroup, TabAnchor } from "@skeletonlabs/skeleton";

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

<TabGroup class="flex gap-2 print:hidden">
  <TabAnchor selected={selected === "inventory"} href="/inventory"
    >Manage Inventory</TabAnchor
  >
  <TabAnchor href={"/inventory/cars-for-sale"} selected={selected === "sale"}
    >Manage Cars for Sale</TabAnchor
  >

  <TabAnchor
    href="/inventory/print?state=1"
    selected={selected === "print"}
    data-sveltekit-reload
  >
    Print inventory
  </TabAnchor>
</TabGroup>

<slot />
