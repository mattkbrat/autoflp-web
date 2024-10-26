<script lang="ts">
import "../app.postcss";

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

import RootNav from "$lib/components/RootNav.svelte";
import TitleStrip from "$lib/components/TitleStrip.svelte";

const { children } = $props();
</script>

<div class="flex flex-col gap-4 print:gap-0 w-screen min-h-screen">
  <div class="flex flex-col lg:flex-row">
    <nav class="lg:fixed h-full print:hidden">
      <RootNav />
    </nav>
    <section
      id="title"
      class="flex flex-row gap-y-2 content-end border-b-2 border-b-primary-100 flex-1 lg:ml-12"
    >
      <TitleStrip />
    </section>
  </div>
  <main
    class="flex flex-col flex-1 gap-y-4 self-center px-4 py-8 min-h-screen lg:mx-16 print:contents w-full lg:ml-12 print:p-0 print:m-0"
  >
    <div
      class="flex flex-col flex-1 py-4 space-y-4 rounded-xl dark:bg-surface-900/75 bg-white print:text-black lg:px-4 lg:ml-12 print:contents"
    >
      {@render children()}
    </div>
  </main>
</div>
