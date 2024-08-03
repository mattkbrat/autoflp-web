<script lang="ts">
import { el } from "$lib/element";
import { formatCurrency } from "$lib/format";
import type { ComSingleInventory } from "$lib/types";
import { TabGroup, Tab } from "@skeletonlabs/skeleton";
import type { ActionData, PageData } from "./$types";
import { invalidate, invalidateAll } from "$app/navigation";
import { applyAction, deserialize } from "$app/forms";
import type { ActionResult } from "@sveltejs/kit";

type ComInventory = NonNullable<ComSingleInventory>;

export let data: PageData;
export let form: ActionData;

let tabSet = 0;
let selected = data.selected;
let renderedFile = "";

let images = data.images;

const fieldMap: (keyof ComInventory)[][] = [
	["vin", "year", "fuel"],
	["make", "model", "body", "mileage", "color"],
	["price", "title"],
];

$: image = images[tabSet] || {};

let deleteImage = false;

const renderImageInput = (file: File) => {
	const reader = new FileReader();
	reader.onload = (e) => {
		const result = e.target?.result;
		if (!result || typeof result !== "string") return;
		el<HTMLImageElement>`new-image`.setAttribute("src", result);
	};

	if (!file) return;

	reader.readAsDataURL(file);

	const newName = file.name.split(".").slice(0, -1).join(".");
	const newImages = images;
	newImages[tabSet].title = newName;
	renderedFile = file.name;
	// newImages[tabSet].newUrl = "";
	images = newImages;
};

function setDefaultTitle() {
	const newSelected = selected;
	selected.title = [
		[selected.year, selected.make, selected.model].filter(Boolean).join(" "),
		selected.color,
	]
		.filter(Boolean)
		.join(", ")
		.trim()
		.toUpperCase();
	selected = newSelected;
}
function populateProd() {
	const { local } = data;
	if (!local) return;
	const newSelected = selected;
	newSelected.vin = local.vin;
	newSelected.body = local.body;
	newSelected.fuel = local.fuel;
	newSelected.year = local.year;
	newSelected.make = local.make;
	newSelected.color = selected.color || local.color;
	newSelected.model = selected.model || local.model;
	newSelected.mileage = selected.mileage || local.mileage;
	newSelected.price = selected.price || Number(local.credit || local.cash || 0);

	selected = newSelected;

	if (!selected.title) {
		setDefaultTitle();
	}
}

$: if (image.file && image.file[0].name !== renderedFile) {
	console.debug("rendering", image.file);
	if (image.file instanceof FileList) {
		renderImageInput(image.file[0]);
	} else {
		renderImageInput(image.file);
	}
}

async function handleSaveImage(
	event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
) {
	const data = new FormData(event.currentTarget);
	// data.append("fwle-input", files[0]);
	console.log(event.currentTarget);
	const response = await fetch(event.currentTarget.action, {
		method: "POST",
		body: data,
		headers: {
			"x-sveltekit-action": "true",
		},
	}).catch((e) => {
		console.error("Failed to save image", e);
	});
	const result: ActionResult | null = response
		? deserialize(await response.text())
		: null;
	console.log("Got response", response, { result });
	if (!response || result?.type !== "success") return;

	await invalidateAll();

	applyAction(result);
}
</script>

<div class="flex">
  <a class="anchor" href="/inventory/cars-for-sale"> Cars for sale</a>
  <span>/</span>

  <h1 class="text-lg underline font-bold">{selected.title || "Untitled"}</h1>
</div>

<section>
  <h2>Com Inventory</h2>
  <form method="POST" action="?/saveInv">
    <input type="hidden" name="inventory" value={selected.id} />
    <section>
      {#if data.local}
        <div class=" flex flex-row justify-between">
          <div class="btn-group">
            <button
              type="button"
              class="btn variant-ringed-tertiary"
              on:click={populateProd}
            >
              Populate prod from local</button
            >
            <button
              class="btn variant-ringed-tertiary"
              on:click={setDefaultTitle}
              type="button"
            >
              Set default title</button
            >
          </div>
          <div class="btn-group">
            <button type="submit" class="btn variant-filled-success px-8"
              >Save</button
            >
          </div>
        </div>
      {:else}
        <p>No local match</p>
      {/if}
    </section>
    <label>
      Sold
      <input
        class="checkbox"
        type="checkbox"
        name="sold"
        bind:checked={selected.sold}
      />
    </label>
    {#each fieldMap as fieldRow}
      <div class={`flex flex-row flex-wrap gap-4`}>
        {#each fieldRow as key}
          {@const value = selected[key]}
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
            {#if inputType === "number"}
              {key}
              {formatCurrency(Number(value))}
              <input
                bind:value={selected[key]}
                name={key}
                type="number"
                step={key === "year" ? 1 : 10}
                class="uppercase input"
              />
            {:else}
              {key}
              <input
                bind:value={selected[key]}
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
          <input type="hidden" name="inventory" value={selected.id} />
          <input type="hidden" name="vin" value={selected.vin} />
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
            {#if image.source && !image.replace}
              <label class="flex flex-row justify-between">
                Delete Image
                <input
                  class="btn variant-outline-secondary"
                  name={"delete"}
                  type="checkbox"
                  id="render-image"
                  bind:checked={deleteImage}
                />
              </label>
            {/if}
            {#if !deleteImage && !image.replace && image.url}
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
            {#if !deleteImage}
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
            {/if}
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
        {#if image.replace || image.file}
          <input
            accept="image/*"
            class="input"
            type="file"
            name="file"
            id="file"
            bind:files={images[tabSet].file}
          />
          <img id={"new-image"} src={"#"} alt={image.title} />
        {:else if image.render}
          <img src={image.url} alt={image.title} />
        {/if}
      </form>
    </svelte:fragment>
  </TabGroup>
</section>
