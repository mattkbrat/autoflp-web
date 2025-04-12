<script lang="ts">
import { dev } from "$app/environment";
import { title } from "$lib/stores";

const text = $derived(
	[$title, "AUTOFLP", dev ? "DEV" : ""].filter(Boolean).join(" - "),
);
</script>

<svelte:head>
  <title>{text}</title>
</svelte:head>
