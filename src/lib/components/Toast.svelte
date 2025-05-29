<script lang="ts">
import { removeToast, toastStore } from "$lib/stores";const hasToasts = $derived($toastStore.length > 0);</script>

<div
  id="toast-container"
  class={{
    hidden: !hasToasts,
    absolute: hasToasts,
    "top-0 right-0 max-w-[30dvw] z-50 space-y-2 print:!hidden": true,
  }}
>
  {#each $toastStore as toast}
    {@const isError = toast.status === "error"}
    {@const isSuccess = toast.status === "success"}
    <div
      class={{
        "bg-red-400": isError,
        "bg-surface-300": !isError,
        outline: true,
      }}
    >
      <div class="flex justify-between items-center">
        <h2
          class={{
            "text-red-200 text-2xl": isError,
            "text-green-200": isSuccess,
            "text-lg": !isError,
            "text-wrap": true,
          }}
        >
          {toast.title} <span class="text-md"> | {toast.status}</span>
        </h2>
        <button
          type="button"
          onclick={() => removeToast(toast.id)}
          class="btn-icon-lg"
        >
          X
        </button>
      </div>
      <hr />
      <div>
        <span>
          {toast.description}
        </span>
        {#if toast.json}
          <pre>
        	{typeof toast.json === "string"
              ? toast.json
              : JSON.stringify(toast.json, null, 2)}
        </pre>
        {/if}
      </div>
    </div>
  {/each}
</div>
