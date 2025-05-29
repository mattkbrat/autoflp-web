<script lang="ts">
import { formatCurrency } from "$lib/format";import { differenceInDays, formatDate } from "date-fns";const now = new Date();const { selected, schedule } = $props();const totalDelinquent = $derived(schedule?.totalDiff || 0);const pmtIsLate = $derived(	schedule ? differenceInDays(now, schedule.nextDueDate) : 0,);const isLate = $derived(totalDelinquent < 0);</script>

<div
  class="flex flex-row uppercase justify-around text-center flex-wrap bg-black/20 py-2"
>
  <span>
    <span class="text-lg">
      {selected && formatCurrency(selected.lien)}
    </span>
    <br />Lien
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule?.totalPaid)}
    </span>
    <br /> paid
  </span>
  {#if totalDelinquent}
    <span>
      <span class="text-lg">
        {formatCurrency(schedule?.totalExpected)}
      </span>
      <br />Expected
    </span>
  {/if}
  {#if selected?.state && Math.abs(totalDelinquent) > 5}
    <span class:hidden={!totalDelinquent}>
      <span class="text-lg">
        <span>
          {formatCurrency(Math.abs(totalDelinquent))}
        </span>
      </span>
      <br />
      {isLate ? "delinquent" : "advanced"}
      <br />
      {#if schedule?.monthsDelinquent}
        <span class="text-sm" class:text-red-400={isLate}>
          {Math.abs(schedule?.monthsDelinquent)} mo.
        </span>
      {/if}
    </span>
  {/if}
  <span class:hidden={!selected?.state}>
    <span class="text-lg">
      {formatCurrency(schedule?.payoff)}
    </span>
    <br /> Payoff
  </span>
  <span>
    <span class="text-lg">
      {formatCurrency(schedule?.remaining)}
    </span>
    <br />

    {#if selected?.state}
      remaining
    {:else}
      saved
    {/if}
    <span> </span>
  </span>
</div>
<hr />
<span class="grid grid-cols-3 border-b-2 bg-black/20 pt-2 px-4">
  <span>
    {selected && Number(selected.term)} month term;
    <span class="text-lg text-primary-200 print:text-primary-800">
      {selected && formatCurrency(schedule?.pmt)}
      Monthly
    </span>
  </span>
  {#if selected?.date && schedule}
    <span class="text-center">
      Starting
      {formatDate(schedule.startDate, "MMM. do ''yy")}
    </span>
  {/if}
  <span class="text-right">
    {#if selected?.state && schedule}
      Nex payment due by
      <span class="text-lg" class:text-red-400={isLate}>
        {formatDate(
          schedule.nextDueDate,
          schedule.nextDueDate.getFullYear() < now.getFullYear()
            ? "MMM. do yyyy"
            : "MMM. do",
        )}
        {#if pmtIsLate > 60}
          {"!!!"}
        {:else if pmtIsLate > 30}
          {"!!"}
        {:else if pmtIsLate > 7}
          {"!"}
        {/if}
        <br />
      </span>
    {:else}
      Thank you!
    {/if}
  </span>
</span>
