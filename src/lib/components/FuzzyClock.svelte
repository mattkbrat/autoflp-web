<script lang="ts">
import { Time } from "$lib/fuzzy-time";
import { formatDate } from "date-fns";
import { onMount } from "svelte";

const time = new Time();
let now = $state(new Date());

let fuzzy = $derived(time ? time.fuzzyTime : "");
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
  class="flex relative flex-col flex-1 self-end pl-8 text-right opacity-75 cursor-pointer group print:contents"
  id="fuzzy-clock-string"
>
  <span class="print:hidden">
    {fuzzy}
  </span>
  <span
    class="hidden print:flex absolute print:relative left-0 top-8 print:top-0 flex-col w-full print:w-fit text-sm transition-all group-hover:flex"
  >
    {formatDate(now, "MM-dd-yyyy HH:MM:SS")}
  </span>
</span>
