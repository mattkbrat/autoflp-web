
export const DealStats = () => {
  return (
<div
  className="flex flex-row flex-wrap justify-around bg-black/20 py-2 text-center uppercase"
>
  <span>
    <span className="text-lg">
      {selected && formatCurrency(selected.lien)}
    </span>
    <br />Lien
  </span>
  <span>
    <span className="text-lg">
      {formatCurrency(schedule?.totalPaid)}
    </span>
    <br /> paid
  </span>
  {#if totalDelinquent}
    <span>
      <span className="text-lg">
        {formatCurrency(schedule?.totalExpected)}
      </span>
      <br />Expected
    </span>
  {/if}
  {#if selected?.state && Math.abs(totalDelinquent) > 5}
    <span className:hidden={!totalDelinquent}>
      <span className="text-lg">
        <span>
          {formatCurrency(Math.abs(totalDelinquent))}
        </span>
      </span>
      <br />
      {isLate ? "delinquent" : "advanced"}
      <br />
      {#if schedule?.monthsDelinquent}
        <span className="text-sm" className:text-red-400={isLate}>
          {Math.abs(schedule?.monthsDelinquent)} mo.
        </span>
      {/if}
    </span>
  {/if}
  <span className:hidden={!selected?.state}>
    <span className="text-lg">
      {formatCurrency(schedule?.payoff)}
    </span>
    <br /> Payoff
  </span>
  <span>
    <span className="text-lg">
      {formatCurrency(schedule?.remaining)}
    </span>
    <br />

    {#if selected?.state}
      remaining:else
      saved/if}
    <span> </span>
  </span>
</div>
<hr />
<span className="grid grid-cols-3 border-b-2 bg-black/20 pt-2 px-4">
  <span>selected && Number(selected.term)month term;
    <span className="text-lg text-primary-200 print:text-primary-800">
      {selected && formatCurrency(schedule?.pmt)}
      Monthly
    </span>
  </span>#if selected?.date && schedule
    <span className="text-center">
      Starting
      {formatDate(schedule.startDate, "MMM. do ''yy")}
    </span>/if}
  <span className="text-right">
    {#if selected?.state && schedule}
      Nex payment due by
      <span className="text-lg" className:text-red-400={isLate}>
        {formatDate(
          schedule.nextDueDate,
          schedule.nextDueDate.getFullYear() < now.getFullYear()
            ? "MMM. do yyyy"
            : "MMM. do",
        )#if pmtIsLate > 60"!!!":else if pmtIsLate > 30"!!":else if pmtIsLate > 7"!"/if}
        <br />
      </span>:else
      Thank you!/if}
  </span>
</span>

  )

