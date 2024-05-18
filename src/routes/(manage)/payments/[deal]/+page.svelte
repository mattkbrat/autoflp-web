
<script lang="ts">
import { page } from "$app/stores";
import type { Payment } from "$lib/types";
export let data: {
	payments: Payment[];
};

const currencyFormat = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "America/Denver",
});

const formatCurrency = (amount: string | number) => {
	return currencyFormat.format(+amount);
};

const formatDate = (date: string | Date) => {
	return dateFormat.format(new Date(date));
};
</script>

<h2>
    {$page.url.pathname}
</h2>

<table class="">
    <thead>

    <tr class="text-lg font-bold text-primary-300">
        <td>
            Date
        </td>
        <td class="text-right">
           $ (USD) 
        </td>
    </tr>
    </thead>
<tbody>
{#each data.payments as pmt}
<tr class="even:bg-unset odd:bg-surface-700" >
<td>{formatDate(pmt.date)}</td>
<td class="text-right">{formatCurrency(pmt.amount)}</td>
</tr>
{/each}

</tbody>

</table>