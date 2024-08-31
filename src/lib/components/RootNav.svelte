<script lang="ts">
import { page } from "$app/stores";
import { accountID } from "$lib/stores";
$: routes = [
	{
		route: "/home",
	},
	{
		route: !$accountID.value ? "/payments" : `/payments/${$accountID.value}`,
	},
	{
		route: !$accountID.value ? "/accounts" : `/accounts/${$accountID.value}`,
	},
	{
		route: "/inventory",
		title: "inv",
	},
	{
		route: "/deals",
	},
	{
		route: "/credit",
	},
] as {
	route: string;
	title?: string;
}[];
</script>

<ul
  class="flex flex-row flex-wrap gap-4 2xl:flex-nowrap 2xl:overflow-auto 2xl:flex-col 2xl:my-auto 2xl:flex-1 2xl:border-r-2 2xl:pr-1 h-full"
>
  {#each routes as route}
    {@const isSelected = $page.url.pathname.startsWith(route.route)}
    <a
      class="flex flex-1 items-center py-4 text-lg font-bold text-center text-black uppercase cursor-pointer min-w-8 hover:opacity-25"
      class:bg-surface-200={isSelected}
      class:bg-surface-500={!isSelected}
      href={route.route}
    >
      <li
        class="w-full text-center 2xl:vertical-writing-lr 2xl:orientation-sideways 2xl:rotate-180 2xl:pl-2"
      >
        {route.title || route.route.slice(1).split("/")[0]}
      </li>
    </a>
  {/each}
</ul>
