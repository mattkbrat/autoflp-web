<script lang="ts">
import { page } from "$app/stores";

const { children } = $props();
</script>

<nav class="flex print:hidden">
  <h2>
    <a href="/admin" class:underline={$page.url.href.endsWith("admin")}>
      Admin
    </a>
  </h2>
  <span>/</span>
  <a href="/admin/charts" class:underline={$page.url.href.includes("charts")}>
    Charts
  </a>
</nav>

{@render children()}
