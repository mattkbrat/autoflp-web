<script lang="ts">
import { enhance } from "$app/forms";
import { getZip } from "$lib";
import { title } from "$lib/stores";
import { onMount } from "svelte";

onMount(() => {
	title.set("Admin");
});
</script>

<div class="flex flex-col flex-wrap space-y-4"></div>

<form
  action="?/printBilling"
  method="post"
  use:enhance={() => {
    return async ({ result, update }) => {
      if ("data" in result && result.data) {
        if ("built" in result.data) {
          const { built } = result.data;
          if (typeof built === "string") {
            await getZip([built], { type: "billing" });
          }
        }
      }
    };
  }}
>
  <button class=" btn-lg preset-filled-primary-200-800" type="submit"
    >Print Billing</button
  >
</form>
