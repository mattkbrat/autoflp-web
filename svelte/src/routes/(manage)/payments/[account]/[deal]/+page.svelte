<script lang="ts">
import { getZip } from "$lib";
import DealStats from "$lib/components/forms/payments/DealStats.svelte";
import PaymentHistory from "$lib/components/forms/payments/PaymentHistory.svelte";
import PaymentsTable from "$lib/components/forms/payments/PaymentsTable.svelte";
import TitleStrip from "$lib/components/forms/payments/TitleStrip.svelte";
import { waitForElm } from "$lib/element";
import {
	formatInventory,
	formatSalesmen,
	fullNameFromPerson,
} from "$lib/format";
import { title, toast } from "$lib/stores";
import type { ActionData, PageData } from "./$types";

const { data, form }: { data: PageData; form: ActionData } = $props();

const selected = $derived(data.deal);
let printedForms = $state(0);

$effect(() => {
	if (!form) return;

	if (!form.success) {
		toast({
			title: "Failed to record payment",
			description: form.message,
			json: JSON.stringify(form),
			status: "error",
		});
		return;
	}

	if ("generated" in form) {
		const ms = form?.generated?.getTime();
		if (ms === printedForms) return;
		if (form.generated instanceof Date) {
			if (!form?.bill?.length) return;
			getZip([form.bill], { type: "billing" }).then(() => {
				printedForms = ms;
			});
		} else if (form.forms && selected) {
			getZip(form.forms, {
				deal: { date: new Date(selected.date), vin: selected.inventory.vin },
				person: selected?.account.contact,
				type: "deal",
			}).then(() => {
				printedForms = ms;
			});
		}
		toast({ title: "Downloading forms", description: "", status: "info" });
		return;
	}
	toast({
		title: form.action || "success",
		description: form.message,
		json:
			form.action === "get-bill" ? undefined : JSON.stringify(form, null, 2),
		status: "success",
	});
});

const schedule = $derived(data.schedule);

$effect(() => {
	if (!selected?.id) return;
	waitForElm<HTMLInputElement>("#pmt-amount").then((elm) => {
		elm?.focus();
	});
});
const fullName = $derived(
	selected
		? fullNameFromPerson({
				person: selected.account.contact,
			})
		: "",
);
const inventory = $derived(
	selected ? formatInventory(selected?.inventory) : "",
);
const salesmen = $derived(
	selected
		? formatSalesmen(selected?.inventory.inventory_salesman, "firstName")
		: "",
);
$effect(() => {
	title.set(`${fullName} - ${inventory}`);
});
</script>

{#if selected}
  <div>
    <TitleStrip {inventory} {fullName} {salesmen} />
    <hr />
    <DealStats {selected} {schedule} />
  </div>
{/if}

<div class="flex gap-2 flex-wrap">
  {#if schedule}
    {#if selected}
      <PaymentsTable {selected} {schedule} payments={data.payments} />
    {/if}
    <PaymentHistory {schedule} />
  {/if}
</div>
