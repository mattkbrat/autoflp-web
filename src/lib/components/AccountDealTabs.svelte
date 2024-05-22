<script>
import { page } from "$app/stores";
import { TabAnchor, TabGroup } from "@skeletonlabs/skeleton";

import { goto } from "$app/navigation";
import { accountDeals } from "$lib/stores";

$: if ($accountDeals.length > 0 && $page.url.pathname.endsWith("payments")) {
	console.info($page.url.pathname);
	goto(`/payments/${$accountDeals[0].id}`);
}
</script>

<TabGroup 
	justify="justify-center"
	active="variant-filled-primary"
	hover="hover:variant-soft-primary"
	flex="flex-1 lg:flex-none"
	rounded=""
	border=""
	class="bg-surface-100-800-token w-full"
>
{#each $accountDeals as deal}
	<TabAnchor href={`/payments/${deal.id}`} selected={$page.url.pathname.endsWith(deal.id)}>
		<svelte:fragment slot="lead">{deal.make} {deal.model}</svelte:fragment>
		<span>{deal.date}</span>
	</TabAnchor>
{/each}
</TabGroup>