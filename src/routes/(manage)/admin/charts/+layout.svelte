<script lang="ts">
import Tabs from "$lib/components/tabs/Tabs.svelte";

const { children } = $props();

const pageMap = {
	"Expected Payments": "expected-payments",
	"Salesman Payments": "salesman-payments",
};
</script>

<Tabs
  title={"Charts"}
  tabs={Object.entries(pageMap).map(([k, v]) => {
    return {
      id: v,
      text: k,
    };
  })}
  asLinks
  rootUrl="/admin/charts"
>
  {@render children()}
</Tabs>
