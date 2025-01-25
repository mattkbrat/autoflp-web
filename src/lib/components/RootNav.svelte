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
  class="flex flex-row flex-wrap lg:flex-nowrap lg:overflow-auto lg:flex-col lg:my-auto lg:flex-1 lg:border-r-2 h-full"
>
  {#each routes as route}
    {@const isSelected = $page.url.pathname.includes(route.route)}
    <a
      class="flex flex-1 items-center px-2 py-4 lg:pl-8 3xl:text-lg lg:text-lg font-bold text-center text-black uppercase cursor-pointer w-8 hover:bg-surface-400 tracking-wider outline-white outline outline-2 min-w-max"
      class:bg-surface-200={isSelected}
      class:bg-surface-900={!isSelected}
      class:text-surface-100={!isSelected}
      href={route.route}
    >
      <li
        class="w-full text-center lg:vertical-writing-lr lg:orientation-sideways lg:rotate-180 self-center"
      >
        {route.title || route.route.slice(1).split("/")[0]}
      </li>
    </a>
  {/each}
</ul>
