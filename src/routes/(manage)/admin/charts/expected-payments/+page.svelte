<script lang="ts">
import { page } from "$app/stores";
import ExpectedPayments from "$lib/components/charts/ExpectedPayments.svelte";
import { formatCurrency } from "$lib/format";
const { data } = $props();

const salesmen = $derived(Object.keys(data.expected));

let tab = $state("" as keyof typeof data.expected);

$effect(() => {
	if (tab) return;
	tab = Object.keys(data)[0];
});

page.subscribe((p) => {
	tab = p.url.hash ? decodeURIComponent(p.url.hash.slice(1)) : "";
});

let row = $derived(data.expected[tab] || {});
</script>

<ExpectedPayments expected={data.expected} />

<div class="flex gap-2">
  {#each salesmen as salesman}
    <a
      href={`#${encodeURIComponent(salesman)}`}
      class={"font-bold"}
      class:underline={salesman === tab}
    >
      {salesman}
    </a>
  {/each}
</div>
<div class="grid grid-cols-2 gap-4">
  <div class="grid grid-cols-subgrid col-span-full outline p-4">
    <h3 class="col-span-full">{tab}</h3>
    <p>
      {formatCurrency(row.paid)} / {formatCurrency(row.paid + row.expected)}
    </p>
    <h4 class="col-span-full text-lg underline">Paid</h4>
    {#each row?.paidAccounts as r}
      {@const { name, vehicle, link: pmtLink, phone } = r}
      <div>
        {name}
      </div>
      <div class="grid grid-cols-subgrid">
        <div>
          {vehicle}
        </div>
        <div>
          {phone}
        </div>
        <a class="text-blue-200 underline" href={pmtLink}> Deal Page </a>
      </div>
      <hr class="col-span-full" />
    {/each}
    <h4 class="col-span-full text-lg underline mt-4">Unpaid</h4>
    {#each row?.unpaidAccounts as r}
      {@const { name, vehicle, link: pmtLink, phone } = r}
      <div>
        {name}
      </div>
      <div class="grid grid-cols-subgrid">
        <div>
          {vehicle}
        </div>
        <div>
          {phone}
        </div>
        <a class="text-blue-200 underline" href={pmtLink}> Deal Page </a>
      </div>
      <hr class="col-span-full" />
    {/each}
  </div>
</div>
