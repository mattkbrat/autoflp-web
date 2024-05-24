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

import RootNav from "$lib/components/RootNav.svelte";
import TitleStrip from "$lib/components/TitleStrip.svelte";
import { deals } from "$lib/stores";

onMount(() => {
	deals.set(data.deals);
});
</script>

<div class="flex flex-col gap-4 w-screen min-h-screen">
  <div class="flex flex-col 2xl:flex-row">
    <nav class="2xl:fixed print:hidden h-full">
      <RootNav />
    </nav>
    <section
      id="title"
      class="flex flex-col gap-y-2 content-end border-b-2 border-b-primary-100 flex-1 2xl:ml-12"
    >
      <TitleStrip />
    </section>
  </div>
  <main
    class="flex flex-col flex-1 gap-y-4 self-center px-4 py-8 min-h-screen lg:mx-16 w-full 2xl:ml-12"
  >
    <div
      class="flex flex-col flex-1 py-4 space-y-4 rounded-xl bg-surface-900/75 lg:px-4 2xl:ml-12"
    >
      <slot />
    </div>
  </main>
</div>
