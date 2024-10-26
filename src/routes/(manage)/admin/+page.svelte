<script lang="ts">
import { enhance } from "$app/forms";
import { download, getZip } from "$lib";

export let data;

$: keys = [...data.keys, { value: "", key: "", id: "" }];
</script>

<svelte:head>
  <title>Admin - AutoFLP</title>
</svelte:head>

<h2>Admin</h2>

<div class="flex flex-col flex-wrap space-y-4"></div>
{#each keys as key}
  <form
    class="flex flex-col gap-4 outline outline-4 outline-surface-200 outline-offset-4"
    action="?/submit"
    method="post"
    use:enhance={() => {
      return async ({ result, update }) => {
        if ("data" in result && result.data)
          if ("data" in result.data) {
            //await update();
            const resultId = result.data.id;
            console.log(result.data);
          }
      };
    }}
  >
    <input type="hidden" name="id" value={key.id} class="input" />
    <label class="flex-w min-w-max">
      Key
      <input name="key" value={key.key} class="input" />
    </label>
    <label class="flex-1 min-w-max">
      Value
      <textarea name="value" value={key.value} class="input" />
    </label>
    <button type="submit">Save</button>
  </form>
{/each}

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
