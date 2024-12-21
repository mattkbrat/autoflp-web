<script lang="ts">
  import Tabs from "$lib/components/tabs/Tabs.svelte";

  const { children } = $props();
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
