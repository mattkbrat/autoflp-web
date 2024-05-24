<script lang="ts">
import "../app.postcss";

import { storeHighlightJs } from "@skeletonlabs/skeleton";
// Highlight JS
import hljs from "highlight.js/lib/core";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml"; // for HTML
import "highlight.js/styles/github-dark.css";
import { page } from "$app/stores";

export let data;

hljs.registerLanguage("xml", xml); // for HTML
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
storeHighlightJs.set(hljs);

// Floating UI for Popups
import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from "@floating-ui/dom";
import { storePopup } from "@skeletonlabs/skeleton";
import { onMount } from "svelte";
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

import { Time } from "$lib/fuzzy-time";
import { deals } from "$lib/stores";
let time: Time | null = null;

const routes: {
	route: string;
	title?: string;
}[] = [
	{
		route: "/home",
	},
	{
		route: "/payments",
	},
	{
		route: "/deals",
	},
	{
		route: "/accounts",
	},
	{
		route: "/inventory",
		title: "inv",
	},
];

let now = new Date();
let fuzzy = "";

if (now && time) {
	time.update(now);
	fuzzy = time.fuzzyTime;
}

$: fuzzy = time ? time.fuzzyTime : "";
let interval: number | null = null;

const timeCb = () => {
	now = new Date();
};

const handleInterval = (clear = false) => {
	if (clear) {
		return interval && window.clearInterval(interval);
	}
	interval = window.setInterval(timeCb, 1000);
};

onMount(() => {
	time = new Time();
	handleInterval();
	deals.set(data.deals);
});
</script>

<div class="flex flex-col gap-4 w-screen 2xl:flex-row">
  <nav class="2xl:fixed print:hidden">
    <ul
      class="flex flex-row flex-wrap gap-4 2xl:flex-nowrap 2xl:overflow-auto 2xl:flex-col 2xl:my-auto 2xl:h-screen 2xl:border-r-2 2xl:pr-1"
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
            {route.title || route.route.slice(1)}
          </li>
        </a>
      {/each}
    </ul>
  </nav>
  <main
    class="flex flex-col flex-1 gap-y-4 self-center px-4 py-8 min-h-screen lg:mx-16"
  >
    <section
      id="title"
      class="flex flex-col gap-y-2 content-end border-b-2 border-b-primary-100"
    >
      <h1 class="text-4xl font-black">AutoFLP</h1>
      <div class="flex flex-row flex-wrap justify-between">
        <span class="text-lg">
          Auto Dealer Management for Family Owned Businesses
        </span>
        <span
          class="flex relative flex-col flex-1 self-end pl-8 text-right opacity-75 cursor-pointer group print:hidden"
          id="fuzzy-clock-string"
        >
          {fuzzy}
          <span
            class="hidden absolute left-0 top-8 flex-col w-full text-sm transition-all group-hover:flex"
          >
            {now.toLocaleDateString()}
            {now.toLocaleTimeString()}
          </span>
        </span>
      </div>
    </section>

    <div
      class="flex flex-col flex-1 py-4 space-y-4 w-full rounded-xl bg-surface-900/75 lg:px-4"
    >
      <slot />
    </div>
  </main>
</div>
