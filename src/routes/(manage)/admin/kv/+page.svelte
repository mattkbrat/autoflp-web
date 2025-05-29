<script lang="ts">
import { enhance } from "$app/forms";const { data } = $props();const keys = $derived([...data.keys, { value: "", key: "", id: "" }]);</script>

{#each keys as key}
  <form
    class="flex flex-col gap-4 outline outline-4 outline-surface-200 outline-offset-4"
    action="?/submit"
    method="post"
    use:enhance={() => {
      return async ({ update }) => {
        await update();
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
      <textarea name="value" value={key.value} class="input"></textarea>
    </label>
    <button type="submit">Save</button>
  </form>
{/each}
