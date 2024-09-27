<script lang="ts">
</script>

<svelte:head>
  <title>Inventory - AutoFLP</title>
</svelte:head>

<div class="flex gap-2 print:hidden">
  <a
    class="underline font-bold text-secondary-300 hover:text-secondary-200"
    href="/inventory"
  >
    Manage Inventory
  </a>
  <div class="h-4 w-px border-r border self-center" />
  <a
    class="underline font-bold text-secondary-300 hover:text-secondary-200"
    href={"/inventory/cars-for-sale"}
  >
    Manage Cars for Sale
  </a>

  <div class="h-4 w-px border-r border self-center" />
  <a
    class="underline font-bold text-secondary-300 hover:text-secondary-200"
    href="/inventory/print?state=1"
    data-sveltekit-reload
  >
    Print inventory
  </a>
</div>

<slot />
