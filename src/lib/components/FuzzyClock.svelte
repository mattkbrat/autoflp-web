<script lang="ts">
import { Time } from "$lib/fuzzy-time";
import { onMount } from "svelte";

const time = new Time();
let now = new Date();
let fuzzy = "";

if (now && time !== null) {
	time.update(now);
	fuzzy = time.fuzzyTime;
}

$: fuzzy = time ? time.fuzzyTime : "";
let interval: number | null = null;

const timeCb = () => {
	now = new Date();
};

const handleInterval = (clear = false) => {
	if (clear) {
		return interval && window.clearInterval(interval);
	}
	interval = window.setInterval(timeCb, 1000);
};
onMount(() => {
	handleInterval();
});
</script>

<span
  class="flex relative flex-col flex-1 self-end pl-8 text-right opacity-75 cursor-pointer group print:hidden"
  id="fuzzy-clock-string"
>
  {fuzzy}
  <span
    class="hidden absolute left-0 top-8 flex-col w-full text-sm transition-all group-hover:flex"
  >
    {now.toLocaleDateString()}
    {now.toLocaleTimeString()}
  </span>
</span>
