<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { TabAnchor, TabGroup } from "@skeletonlabs/skeleton";

export let data;
</script>

<h2>
  {$page.url.pathname}
</h2>

<select on:change={(e) => e.target && goto("/payments?id="+e.target.value) } class="bg-surface-800 text">
  {#each Object.entries(data.deals) as [key, deal]}
    <option value={deal.account} >{key}</option
    >
  {/each}
</select>

{#if data.accountDeals}

<TabGroup 
	justify="justify-center"
	active="variant-filled-primary"
	hover="hover:variant-soft-primary"
	flex="flex-1 lg:flex-none"
	rounded=""
	border=""
	class="bg-surface-100-800-token w-full"
>
{#each data.accountDeals as deal}
	<TabAnchor href={`/payments/${deal.id}`} selected={$page.url.pathname === '/'}>
		<svelte:fragment slot="lead">{deal.make} {deal.model}</svelte:fragment>
		<span>{deal.date}</span>
	</TabAnchor>
{/each}
</TabGroup>

{/if}