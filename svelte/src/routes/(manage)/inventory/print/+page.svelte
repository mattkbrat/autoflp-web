<script lang="ts">
  import { formatCurrency, formatSalesmen } from "$lib/format";
  import { allInventory } from "$lib/stores";

  $: inventory = $allInventory
    .sort(
      (a, b) =>
        b.make.localeCompare(a.make) ||
        b.model?.localeCompare(a.model || "") ||
        +b.year - +a.year,
    )
    .filter((i) => i.state);
</script>
