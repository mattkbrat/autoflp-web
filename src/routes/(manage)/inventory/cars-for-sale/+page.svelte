<script lang="ts">
import { formatCurrency } from "$lib/format";
import { selectAll } from "$lib/element";
import type { GroupedComInv, MissingVins } from "$lib/types";
export let data: {
	grouped: GroupedComInv;
	missingVins: MissingVins;
};

$: missing = data.missingVins.reduce(
	(acc, v) => {
		if (v.type === "local") {
			acc.local.push(v);
		} else {
			acc.com.push(v);
		}
		return acc;
	},
	{ local: [], com: [] } as { local: MissingVins; com: MissingVins },
);
</script>

<h1>Manage .com Inventory</h1>

<div class="flex flex-row flex-wrap">
  <section
    class="flex flex-col border-solid border-2 border-white/25 p-4 flex-1"
  >
    <div class="flex flex-row justify-between">
      <h2 class="text-xl underline">Cars for Sale</h2>
      <div class="btn-group">
        <button type="submit" class="btn variant-ringed-warning flex-1">
          Toggle Visibility
        </button>
        <button
          type="submit"
          class="btn variant-ringed-success flex-1"
          formaction="?/markSold"
        >
          Mark sold and Hide
        </button>
      </div>
    </div>
    <form>
      <table class="text-left table">
        <thead>
          <tr>
            <th>
              Select

              <button
                type="button"
                class="btn variant-ringed-secondary"
                on:click={() => selectAll("cars-for-sale-body")}
              >
                Select all
              </button>
            </th>
            <th> Price </th>
            <th> Sold </th>
            <th> Visible </th>
            <th> Goto </th>
          </tr>
        </thead>
        <tbody class="items-center" id="cars-for-sale-body">
          {#each data.grouped as inv}
            {@const comId = inv.com.id.toString()}
            <tr class:text-gray-400={inv.com.hidden}>
              <th>
                <label for={comId} class="flex flex-row gap-2">
                  <input
                    id={comId}
                    type="checkbox"
                    name={"com"}
                    class="checkbox"
                    value={comId}
                  />
                  <div class="flex flex-col">
                    <span class="text-lg">
                      {inv.com.title ||
                        [inv.com.make, inv.com.model, inv.com.year]
                          .filter(Boolean)
                          .join(" ") ||
                        "No title"}
                    </span>
                    <span class="text-sm">
                      {inv.local.make}
                      {inv.local.model}
                      {inv.local.year}
                    </span>
                  </div>
                </label>
              </th>
              <td class="flex flex-col">
                <span class="text-lg">
                  {formatCurrency(inv.com.price)}
                </span>
                <span class="text-sm">
                  {formatCurrency(inv.local.credit || undefined)}
                </span>
              </td>
              <td>
                <span
                  class="text-lg"
                  class:text-red-400={inv.com.sold !== (inv.local.state === 0)}
                >
                  {inv.com.sold ? "Sold" : "Not sold"}
                  <br />
                  <span class="text-sm">
                    {!inv.local.state ? "Closed" : "Current"}
                  </span>
                </span>
              </td>
              <td>
                <span class="text-lg">
                  {inv.com.hidden ? "Hidden" : "Visible"}
                </span>
              </td>
              <td class="btn-group gap-2 text-white flex">
                <a
                  class="btn variant-outline-tertiary flex-1"
                  href={`/inventory/cars-for-sale/${inv.com.id}`}
                >
                  Edit
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </form>
  </section>

  {#if data.missingVins.length > 0}
    <section class="flex flex-col border-solid border-2 border-white/25 p-4">
      <form method="POST" action="?/populateProd">
        <div class="flex flex-col justify-between flex-wrap gap-4">
          <h2 class="text-xl underline">Missing</h2>
          <div class="btn-group">
            <button type="submit" class="btn variant-ringed-primary flex-1">
              Populate Prod from Local
            </button>
          </div>
        </div>
        <table class="table text-left">
          <tbody id="missing-vins">
            <tr>
              <th> Missing from .com </th>
              <th>
                <button
                  type="button"
                  class="btn variant-ringed-secondary w-full"
                  on:click={() => selectAll("missing-com")}
                >
                  Select all
                </button>
              </th>
            </tr>
            <tr class="contents" id="missing-com">
              {#each missing.local as v}
                {@const id = v.id.toString()}
                <tr>
                  <td class="flex flex-row gap-2">
                    <label for={id}>
                      <input
                        type="checkbox"
                        {id}
                        name={v.type}
                        class="checkbox"
                        value={id}
                      />
                      Select
                    </label>
                  </td>
                  <td>
                    {v.description}
                    <br />
                    <span class="text-xs">
                      {id}
                    </span>
                  </td>
                </tr>
              {/each}
            </tr>
            <tr>
              <td colspan="2">
                <hr />
              </td>
            </tr>
            {#if missing.com.length > 0}
              <tr>
                <th> Missing from local </th>
                <td>
                  <button
                    type="button"
                    class="btn variant-ringed-secondary w-full"
                    on:click={() => selectAll("missing-local")}
                  >
                    Select all
                  </button>
                </td>
              </tr>
            {/if}
            <tr class="contents" id="missing-local">
              {#each missing.com as v}
                {@const id = v.id.toString()}
                <tr>
                  <td class="flex flex-row gap-2">
                    <label for={id}>
                      <input
                        type="checkbox"
                        {id}
                        name={v.type}
                        class="checkbox"
                        value={id}
                      />
                      Select
                    </label>
                  </td>
                  <td>
                    {v.description}
                    <br />
                    <span class="text-xs">
                      ID #{id}
                    </span>
                    <a href="/inventory/"> Add to inventory </a>
                  </td>
                </tr>
              {/each}
            </tr>
          </tbody>
        </table>
      </form>
    </section>
  {/if}
</div>
