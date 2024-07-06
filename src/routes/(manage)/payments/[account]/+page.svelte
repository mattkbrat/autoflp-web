<script lang="ts">
import { accountDeals } from "$lib/stores";
import { onMount } from "svelte";

export let data;
$: if (data.deals) {
	accountDeals.set(data.deals || []);
}
</script>
