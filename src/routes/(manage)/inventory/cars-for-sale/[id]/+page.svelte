<script lang="ts">
import { el } from "$lib/element";
import { formatCurrency } from "$lib/format";
import type { ComSingleInventory } from "$lib/types";
import type { LocalInventory } from "$lib/types/local";
import { TabGroup, Tab, TabAnchor } from "@skeletonlabs/skeleton";
import type { ActionData, PageData } from "./$types";

type ComInventory = NonNullable<ComSingleInventory>;

export let data: PageData;
export let form: ActionData;

let tabSet = 0;
let files: FileList = [];
let selected = data.selected;

$: console.log("got form response", form);

let images = data.selected.images.map((i) => {
	return {
		...i,
		render: false,
		replace: false,
	};
});

const fieldMap: (keyof ComInventory)[][] = [
	["vin", "year", "fuel"],
	["make", "model", "body", "mileage", "color"],
	["price", "sold"],
];

$: image = images[tabSet];

const renderImageInput = (file: File) => {
	const reader = new FileReader();
	reader.onload = (e) => {
		const result = e.target?.result;
		if (!result || typeof result !== "string") return;
		el<HTMLImageElement>`new-image`.setAttribute("src", result);
	};

	reader.readAsDataURL(file);

	const newName = file.name.split(".").slice(0, -1).join(".");
	const newImages = images;
	newImages[tabSet].title = newName;
	// newImages[tabSet].newUrl = "";
	images = newImages;
};
$: if (files.length > 0) {
	renderImageInput(files[0]);
}

function populateProd() {
	throw new Error("Function not implemented.");
}

async function handleSaveImage(
	event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
	const data = new FormData(event.currentTarget);
	data.append("file-input", files[0]);
	const response = await fetch(event.currentTarget.action, {
		method: "POST",
		body: data,
	}).catch((e) => {
		console.error("Failed to save image", e);
	});

	console.log("Got response", response);
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
  <form method="POST" action="?/saveInv">
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
      <form
        class="flex flex-col gap-4"
        method="post"
        on:submit|preventDefault={handleSaveImage}
      >
        <div class="flex flex-row flex-wrap">
          <input type="hidden" name="image-id" value={image.id} />
          <label>
            Render order
            <input
              class="input"
              name={"order"}
              required
              bind:value={images[tabSet].order}
            />
          </label>
          <label>
            Title
            <input
              class="input"
              name={"title"}
              bind:value={images[tabSet].title}
            />
          </label>
          <input
            type="hidden"
            class="input"
            name={"url"}
            bind:value={images[tabSet].url}
          />
          <div class="flex flex-col self-end">
            {#if !image.replace}
              <label class="flex flex-row justify-between">
                Render Image
                <input
                  class="btn variant-outline-secondary"
                  bind:checked={images[tabSet].render}
                  name={"render-image"}
                  type="checkbox"
                  id="render-image"
                />
              </label>
            {/if}
            <label class="flex flex-row justify-between">
              Replace Image
              <input
                class="btn variant-outline-secondary"
                bind:checked={images[tabSet].replace}
                name={"replace-image"}
                type="checkbox"
                id="replace-image"
              />
            </label>
          </div>
          <div class="btn-group">
            <button type="submit" class="btn variant-filled-primary self-start"
              >Save Image</button
            >
            <button
              class="btn variant-filled-warning self-start"
              formaction="?/deleteImage">Delete Image</button
            >
          </div>
        </div>
        {#if image.replace}
          <input
            accept="image/*"
            class="input"
            type="file"
            name="file"
            id="file"
            bind:files
          />
          <img id={"new-image"} src={"#"} alt={image.title} />
        {:else if image.render}
          <img src={image.url} alt={image.title} />
        {/if}
      </form>
    </svelte:fragment>
  </TabGroup>
</section>
