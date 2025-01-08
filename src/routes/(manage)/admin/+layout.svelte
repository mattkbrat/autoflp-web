<script lang="ts">
import Tabs from "$lib/components/tabs/Tabs.svelte";
import { allSalesmen } from "$lib/stores";
import { onMount } from "svelte";

const { children, data } = $props();

onMount(() => {
	allSalesmen.set(data.salesmen);
});
</script>

<Tabs
  title={"Admin"}
  tabs={[
    { text: "admin", id: "" },
    "kv",
    "charts",
    {
      text: "match accounts",
      id: "match-accounts",
    },
  ]}
  asLinks
  rootUrl="/admin"
>
  {@render children()}
</Tabs>
