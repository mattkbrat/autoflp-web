<script lang="ts">
import { el } from "$lib/element";
import { formatCurrency } from "$lib/format";
import type { ComSingleInventory } from "$lib/types";
import type { LocalInventory } from "$lib/types/local";
import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";

let tabSet = 0;

type ComInventory = NonNullable<ComSingleInventory>;
export let data: {
	selected: ComInventory;
	local: LocalInventory | null;
};

let selected = data.selected;

let images = data.selected.images.map((i) => {
	return {
		...i,
		render: false,
	};
});

const fieldMap: (keyof ComInventory)[][] = [
	["vin", "year", "fuel"],
	["make", "model", "body", "mileage", "color"],
	["price", "sold"],
];

$: image = images[tabSet];

let replaceImage = false;

const toggleRender = () => {
	let newImages = images;
	newImages[tabSet].render = !newImages[tabSet].render;
	// newImages[tabSet].newUrl = "";
	images = newImages;
};

const renderImageInput = (
	event: Event & { currentTarget: EventTarget & HTMLInputElement },
) => {
	const files = event.currentTarget.files;
	if (!files || files.length !== 1) {
		return;
	}

	const reader = new FileReader();
	reader.onload = (e) => {
		const result = e.target?.result;
		if (!result || typeof result !== "string") return;
		el<HTMLImageElement>`new-image`.setAttribute("src", result);
	};

	reader.readAsDataURL(files[0]);

	let newImages = images;
	newImages[tabSet].title = files[0].name.split(".").slice(0, -1).join(".");
	// newImages[tabSet].newUrl = "";
	images = newImages;
};

function populateProd() {
	throw new Error("Function not implemented.");
}
</script>

<h1 class="text-lg underline font-bold">Car for Sale</h1>
<section>
  {#if data.local}
    {@const local = data.local}
    <div>
      <p>
        {local.vin}
      </p>
      <button class="btn variant-ringed-secondary" on:click={populateProd}>
        Populate prod from local</button
      >
    </div>
  {:else}
    <p>No local match</p>
  {/if}
</section>

<section>
  <h2>Com Inventory</h2>
  <form>
    {#each fieldMap as fieldRow}
      <div class={`flex flex-row flex-wrap gap-4`}>
        {#each fieldRow as key}
          {@const value = data.selected[key]}
          {@const inputType =
            typeof value === "boolean"
              ? "checkbox"
              : value && Number.isFinite(Number(value))
                ? "number"
                : "text"}
          <label
            class="flex-1 min-w-max uppercase inline-flex content-center flex-col gap-x-2"
            class:!flex-row={inputType === "checkbox"}
            class:!self-center={inputType === "checkbox"}
          >
            {#if inputType === "checkbox"}
              {key}
              <input
                bind:checked={selected[key]}
                name={key}
                type="checkbox"
                class="checkbox"
              />
            {:else if inputType === "number"}
              {key}
              {formatCurrency(Number(value))}
              <input
                bind:value={data.selected[key]}
                name={key}
                type="number"
                step={key === "year" ? 1 : 10}
                class="uppercase input"
              />
            {:else}
              {key}
              <input
                bind:value={data.selected[key]}
                name={key}
                type="text"
                class="uppercase input"
              />
            {/if}
          </label>
        {/each}
      </div>
    {/each}
  </form>
</section>

<section>
  <h2>Images</h2>

  <TabGroup>
    {#each images as image, i}
      <Tab bind:group={tabSet} name={image.title} value={i}>
        <svelte:fragment slot="lead">{image.order}</svelte:fragment>
        <span>{image.title || "No title"}</span>
      </Tab>
    {/each}
    <svelte:fragment slot="panel">
      <section>
        <h3>
          {image.source}
        </h3>
      </section>
      <form class="flex flex-col gap-4">
        <div class="flex flex-row">
          <label>
            Render order
            <input
              class="input"
              name={"order"}
              required
              bind:value={image.order}
            />
          </label>
          <label>
            Title
            <input class="input" name={"title"} bind:value={image.title} />
          </label>
          <label>
            URL
            <input class="input" name={"title"} bind:value={image.url} />
          </label>
          <div class="flex flex-col">
            <label class="flex flex-row justify-between">
              Replace Image
              <input
                class="btn variant-outline-secondary"
                bind:checked={replaceImage}
                name={"replace-image"}
                type="checkbox"
                id="replace-image"
              />
            </label>
            {#if !replaceImage}
              <label class="flex flex-row justify-between">
                Render Image
                <input
                  class="btn variant-outline-secondary"
                  bind:checked={image.render}
                  name={"replace-image"}
                  type="checkbox"
                  id="replace-image"
                />
              </label>
            {/if}
          </div>
        </div>
        {#if replaceImage}
          <input
            accept="image/*"
            class="input"
            type="file"
            on:change={renderImageInput}
          />
          <img id={"new-image"} src={"#"} alt={image.title} />
        {:else if image.render}
          <img src={image.url} alt={image.title} />
        {/if}
      </form>
    </svelte:fragment>
  </TabGroup>
</section>