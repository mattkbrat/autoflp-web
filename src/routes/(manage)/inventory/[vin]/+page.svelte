<script lang="ts">
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import type { AllInventory } from "$lib/server/database/inventory";
import { allInventory } from "$lib/stores";

$: vin = $page.params.vin;

export let data;

$: selected = data.inventory;

$: if (!selected.vin) {
	goto("/inventory");
}
</script>

{vin}
{selected?.make}
{selected?.color}