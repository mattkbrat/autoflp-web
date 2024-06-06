<script lang="ts">
import { allCreditors, allSalesmen } from "$lib/stores/accounts";

export let data;

allCreditors.set(data.creditors);
allSalesmen.set(data.salesmen);
</script>
<slot/>