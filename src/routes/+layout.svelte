<script lang="ts">
import "../app.postcss";

// Highlight JS
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/github-dark.css";
import { storeHighlightJs } from "@skeletonlabs/skeleton";
import xml from "highlight.js/lib/languages/xml"; // for HTML
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("xml", xml); // for HTML
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
storeHighlightJs.set(hljs);

// Floating UI for Popups
import {
	computePosition,
	autoUpdate,
	flip,
	shift,
	offset,
	arrow,
} from "@floating-ui/dom";
import { storePopup } from "@skeletonlabs/skeleton";
storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

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
</script>

<div class="flex flex-col gap-4 2xl:flex-row w-screen">
  <nav>
    <ul class="flex flex-row 2xl:flex-col gap-4 2xl:my-auto 2xl:h-screen">
      {#each routes as route}
        <a
          class="flex-1 text-center uppercase hover:opacity-25 bg-surface-200 text-black py-4 text-lg font-bold items-center flex cursor-pointer"
          href={route.route}
        >
          <li class="text-center w-full 2xl:text-right 2xl:-rotate-90">
            {route.title || route.route.slice(1)}
          </li>
        </a>
      {/each}
    </ul>
  </nav>
    <main class="bg-surface-800/75 py-8 mx-16 self-center min-h-screen flex flex-col flex-1">

    <slot />
    </main>
</div>
