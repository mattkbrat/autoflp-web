<script lang="ts">
import "./tabs.css";import { goto } from "$app/navigation";import { page } from "$app/state";import type { OnClick, TabComponentProps } from "./tabs.ts";const { title, tabs, children, ...r }: TabComponentProps = $props();const url = $derived(	page.url.hash ? page.url.href.split(page.url.hash)[0] : page.url.href,);const urlSplit = $derived(url.split("/"));const thisTab = $derived(	"useHash" in r && r.useHash		? page.url.hash.slice(1)		: tabs.findLast((t) => urlSplit.includes(typeof t === "string" ? t : t.id)),);const index = $derived(	"index" in r		? r.index.index		: tabs.findIndex((t) =>				typeof t !== "string"					? t.id === thisTab ||						(thisTab &&							typeof thisTab !== "string" &&							"text" in thisTab &&							t.text === thisTab.text)					: t === thisTab || t === tabs[0],			),);const query = page.url.search;const handleTabChange = ({	tab,	onClick,}: {	tab: number;	onClick?: OnClick;}) => {	if ("index" in r) {		r.index.onChange(tab);	}	if ("trackUrl" in r) {		goto(`?${query.toString()}#${tab}`, {			noScroll: true,		});	}	onClick?.();};const tabsListId = typeof title === "string" ? title : title.id;</script>

<section
  class="tabs children"
  class:!outline-none={!children}
  class:!py-0={!children}
>
  <h3 class="sr-only" id={tabsListId}>
    {typeof title === "string" ? title : title.text}
  </h3>
  <div role="tablist" aria-labelledby={tabsListId} class="print:hidden">
    {#each tabs as tab, n}
      {@const isBasic = typeof tab === "string"}
      {@const tabId = isBasic ? tab : tab.id}
      {@const panelId = `tabPanel-${n}`}
      {@const href = `${"rootUrl" in r && r.rootUrl}${"useHash" in r && r.useHash ? "#" : "/"}${typeof tab === "string" ? tab : tab.id}`}
      {#if "asLinks" in r}
        <a
          role="tab"
          id={tabId}
          aria-selected={index === n}
          aria-controls={panelId}
          {href}
        >
          <span class="focus">{isBasic ? tab : tab.text}</span>
        </a>
      {:else}
        <button
          type="button"
          role="tab"
          id={tabId}
          aria-selected={index === n}
          aria-controls={panelId}
          onclick={() => {
            handleTabChange({
              tab: n,
              onClick: isBasic ? undefined : tab.onClick,
            });
          }}
        >
          <span class="focus">{isBasic ? tab : tab.text}</span>
        </button>
      {/if}
    {/each}
  </div>
  <div
    id={`panel-${index}`}
    role={"tabpanel"}
    aria-labelledby={`tab-${index}`}
    class="children"
  >
    {@render children?.()}
  </div>
</section>
