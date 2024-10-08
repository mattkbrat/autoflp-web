<script lang="ts">
import { page } from "$app/stores";
import { accountID } from "$lib/stores";
$: routes = [
	{
		route: "/home",
	},
	{
		route: !$accountID ? "/payments" : `/payments/${$accountID}`,
	},
	{
		route: !$accountID ? "/accounts" : `/accounts/${$accountID}`,
	},
	{
		route: "/inventory",
		title: "inv",
	},
	{
		route: "/deals",
	},
	{
		route: "/admin",
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
  class="flex flex-row flex-wrap gap-4 2xl:flex-nowrap 2xl:overflow-auto 2xl:flex-col 2xl:my-auto 2xl:flex-1 2xl:border-r-2 h-full"
>
  {#each routes as route}
    {@const isSelected = $page.url.pathname.includes(route.route)}
    <a
      class="flex flex-1 items-center px-2 py-4 lg:pl-8 lg:text-2xl font-bold text-center text-black uppercase cursor-pointer w-8 hover:bg-surface-400 tracking-wider outline-white outline outline-2 min-w-max"
      class:bg-surface-200={isSelected}
      class:bg-surface-900={!isSelected}
      class:text-surface-100={!isSelected}
      href={route.route}
    >
      <li
        class="w-full text-center 2xl:vertical-writing-lr 2xl:orientation-sideways 2xl:rotate-180 self-center"
      >
        {route.title || route.route.slice(1).split("/")[0]}
      </li>
    </a>
  {/each}
</ul>
