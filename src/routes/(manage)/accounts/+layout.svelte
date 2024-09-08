<script lang="ts">
import AccountSelect from "$lib/components/AccountSelect.svelte";
import { allAccounts } from "$lib/stores/accounts";
import { onMount } from "svelte";

export let data;

onMount(() => {
	allAccounts.set(data.accounts);
});
</script>

<AccountSelect baseRoute="account" />
<slot />
