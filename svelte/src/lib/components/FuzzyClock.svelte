<script lang="ts">
import { formatDate, roundToNearestMinutes } from "date-fns";
import { onMount } from "svelte";

type Interval = ReturnType<typeof setInterval>;

let date = $state(new Date().getTime());
let lastFuzzied = $state(0);
let fuzzyTime = $state("");

let isFirefox = $state(false);

let longInterval = $state(0 as Interval | number);
let shortInterval = $state(0 as Interval | number);

const setOneSecondInteval = () => {
	if (shortInterval) return;
	date = new Date().getTime();
	shortInterval = setInterval(() => {
		date = new Date().getTime();
	}, 1_000);
};

const clearOneSecondInteval = () => {
	if (!shortInterval) return;
	clearInterval(shortInterval);
	shortInterval = 0;
};

const getFuzzyTime = () => {
	const roundedDate = roundToNearestMinutes(date, {
		nearestTo: 15,
	});
	lastFuzzied = date;
	return formatDate(roundedDate, "~ h:mm B, ccc");
};

onMount(() => {
	isFirefox = !!navigator.userAgent.match(/firefox|fxios/i);

	fuzzyTime = getFuzzyTime();
	window.addEventListener("beforeprint", () => {
		console.log("printing");
		setOneSecondInteval();
	});
	window.addEventListener("afterprint", () => {
		clearOneSecondInteval();
	});
	longInterval = setInterval(() => {
		date = new Date().getTime();
		if (!lastFuzzied || date - lastFuzzied > 15_000) {
			fuzzyTime = getFuzzyTime();
		}
	}, 120_000);
});
</script>

<span
  class="flex relative flex-col flex-1 self-end pl-8 text-right opacity-75 cursor-pointer group print:contents w-80"
  id="fuzzy-clock-string"
  role="figure"
  onfocus={() => {
    setOneSecondInteval();
  }}
  onmouseover={() => {
    setOneSecondInteval();
  }}
  onfocusout={() => {
    clearOneSecondInteval();
  }}
  onmouseout={() => {
    clearOneSecondInteval();
  }}
  onblur={() => {
    clearOneSecondInteval();
  }}
>
  {#if shortInterval || isFirefox}
    <span class:hidden={!shortInterval} class="print:!block">
      {formatDate(date, "PPpp")}
    </span>
    <br />
  {/if}
  {#if !isFirefox || !shortInterval}
    <span class="print:hidden">
      {fuzzyTime}
    </span>
  {/if}
</span>
