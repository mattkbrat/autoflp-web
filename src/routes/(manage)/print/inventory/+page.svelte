<script lang="ts">
import { formatCurrency } from "$lib/format";
import { allInventory } from "$lib/stores";
import { onMount } from "svelte";

$: inventory = $allInventory.sort(
	(a, b) =>
		b.make.localeCompare(a.make) ||
		b.model?.localeCompare(a.model || "") ||
		+b.year - +a.year,
);

// $: printInventory = inventory
// 	.concat(inventory)
// 	.concat(inventory)
// 	.concat(inventory);

onMount(() => {
	const root = document.getElementsByTagName("html")?.[0];
	root?.classList.remove("dark");
	root?.classList.add("light");

	return () => {
		root?.classList.remove("light");
		root?.classList.add("dark");
	};
});
</script>

<table class="border-separate">
  <thead
    class="table-header-group col-g uppercase dark:bg-gray-900 bg-gray-50 border-b-2 text-left"
  >
    <th />
    <th scope="col" class="ml-2 print:ml-0">Make</th>
    <th scope="col" class="">Model</th>
    <th scope="col" class="">Year</th>
    <th scope="col" class="">Color</th>
    <th scope="col" class="">Cash</th>
    <th scope="col" class="">Down</th>
    <th scope="col" class="">Credit</th>
  </thead>
  <tbody>
    {#each inventory as i, n}
      <tr id={i.vin} class="uppercase even:bg-gray-50 odd:bg-white">
        <th scope="row" class="bg-gray-50">
          <span class="text-gray-400/75">
            {n + 1})
          </span>
        </th>
        <td class="break-all">
          {i.make}
        </td>
        <td>
          {i.model}
        </td>
        <td>
          {i.year}
        </td>
        <td>
          {i.color}
        </td>
        <td>
          {i.cash && formatCurrency(i.cash)}
        </td>
        <td>
          {i.down && formatCurrency(i.down)}
        </td>
        <td>
          {i.credit && formatCurrency(i.credit)}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
