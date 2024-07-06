<script lang="ts">
import { page } from "$app/stores";
import { deals } from "$lib/stores";

export let data;

let id: string | null = null;

page.subscribe((p) => {
	const thisId = p.url.searchParams.get("id");
	if (!thisId || id === thisId) return;
	id = thisId;
});

$: if (id) {
	const select = document.getElementById("account-select") as HTMLSelectElement;
	const index = Object.values($deals).findIndex((e) => e.account === id);
	if (select.selectedIndex !== index) {
		select.selectedIndex = index || 0;
		setTimeout(() => {
			select.focus();
		}, 200);
	}
}
</script>


<h2>
  {$page.url.pathname}
</h2>
