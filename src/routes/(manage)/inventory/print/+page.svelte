<script lang="ts">
import { formatCurrency, formatSalesmen } from "$lib/format";
import { allInventory } from "$lib/stores";

$: inventory = $allInventory
	.sort(
		(a, b) =>
			b.make.localeCompare(a.make) ||
			b.model?.localeCompare(a.model || "") ||
			+b.year - +a.year,
	)
	.filter((i) => i.state);
</script>

<table class="border-separate">
  <thead
    class="table-header-group col-g uppercase dark:bg-gray-900 bg-gray-50 border-b-2 text-left"
  >
    <tr>
      <th></th>
      <th scope="col" class="">Salesman</th>
      <th scope="col" class="ml-2 print:ml-0">Make</th>
      <th scope="col" class="">Model</th>
      <th scope="col" class="">Year</th>
      <th scope="col" class="">Color</th>
      <th scope="col" class="">Cash</th>
      <th scope="col" class="">Down</th>
      <th scope="col" class="">Credit</th>
    </tr>
  </thead>
  <tbody>
    {#each inventory as i, n}
      {@const salesman = formatSalesmen(
        i.inventory_salesman,
        i.inventory_salesman.length === 1 ? "firstName" : "firstInitial",
      )}
      <tr id={i.vin} class="uppercase print:even:bg-gray-50 print:odd:bg-white">
        <th scope="row" class="print:bg-gray-50">
          <span class="text-gray-400/75">
            {n + 1})
          </span>
        </th>
        <td>
          {salesman}
        </td>
        <td class="break-all">
          {i.make}
        </td>
        <td>
          {i.model}
        </td>
        <td>
          {Math.floor(Number(i.year))}
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
