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
});
</script>

<div class="flex flex-col gap-4 w-screen 2xl:flex-row">
  <nav class="2xl:fixed">
    <ul class="flex flex-row gap-4 2xl:flex-col 2xl:my-auto 2xl:h-screen">
      {#each routes as route}
        <a
          class="flex flex-1 items-center py-4 w-10 text-lg font-bold text-center text-black uppercase cursor-pointer hover:opacity-25 bg-surface-200"
          href={route.route}
        >
          <li class="w-full text-center 2xl:vertical-writing-lr 2xl:orientation-sideways 2xl:rotate-180 2xl:pl-2">
            {route.title || route.route.slice(1)}
          </li>
        </a>
      {/each}
    </ul>
  </nav>
  <main
    class="flex flex-col flex-1 gap-y-4 self-center px-4 py-8 min-h-screen lg:mx-16 bg-surface-800/75"
  >
  <section id="title" class="flex flex-col gap-y-2 content-end border-b-2 border-b-primary-100">

    <h1 class="text-4xl font-black">AutoFLP</h1>
    <div class="flex flex-row flex-wrap justify-between">

    <span class="text-lg">
      Auto Dealer Management Software for Family Owned Businesses
    </span>
    <span class="flex relative flex-col flex-1 self-end pl-8 text-right opacity-75 cursor-pointer group" id="fuzzy-clock-string">
      {fuzzy}
      <span class="hidden absolute left-0 top-8 flex-col w-full text-sm transition-all group-hover:flex">
        {now.toLocaleDateString()}
        {now.toLocaleTimeString()}
      </span> 
    </span>
    </div>
  </section>

    <slot />
  </main>
</div>
