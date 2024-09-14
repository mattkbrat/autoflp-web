<!-- Adapted from https://svelte.dev/repl/144f22d18c6943abb1fdd00f13e23fde?version=3.49.0 -->

<script lang="ts">
import { waitForElm } from "$lib/element";
import { uid, onClickOutside, filterCache, type Option } from "./comboBox";

export let disabled = undefined;
export let error = undefined;
export let expand = true;
export let id = uid();
export let label = "";
export let loading = false;
export let name: string;
export let options: Option[] = [];
export let placeholder: string | undefined = undefined;
export let readonly = false;
export let required = false;
export let value = "";
export let onSelect: (selected: string) => void;

export const filter = (text: string) => {
	const sanitized = text.trim().toLowerCase();
	if (sanitized in filterCache) return filterCache[sanitized];

	const match = options.reduce((a, o) => {
		let match: Option | undefined = undefined;

		if (o.options) {
			const options = o.options.filter((o) =>
				o.text.toLowerCase().includes(sanitized),
			);

			if (options.length) {
				match = { ...o, options };
			}
		} else if (o.text.toLowerCase().includes(sanitized)) {
			match = o;
		}

		if (match) {
			a.push(match);
		}

		return a;
	}, [] as Option[]);

	filterCache[sanitized] = match;
	return match;
};

let listElement: HTMLUListElement;
let inputElement: HTMLInputElement;
let list: Option[] = [];

$: available = list.length || options.length;

let isListOpen = false;
let selectedOption: Pick<Option, "value" | "text"> = {
	value: "",
	text: "",
};

async function onInputKeyup(event: KeyboardEvent) {
	if (
		!event?.target ||
		!("value" in event.target) ||
		typeof event.target.value !== "string"
	)
		return;
	switch (event.key) {
		case "Escape":
		case "ArrowUp":
		case "ArrowLeft":
		case "ArrowRight":
		case "Enter":
		case "Tab":
		case "Shift":
			break;
		case "ArrowDown":
			showList(event.target.value).then(() => {
				waitForElm('[role="option"]:not([aria-disabled="true"])').then((el) =>
					el?.focus(),
				);
			});

			event.preventDefault();
			event.stopPropagation();
			break;

		default:
			showList(event.target.value);
	}
}

function onInputKeydown(event: KeyboardEvent) {
	if (!event || !("key" in event)) return;
	let flag = false;

	switch (event.key) {
		case "Escape":
			hideList();
			flag = true;
			break;

		case "Tab":
			hideList();
			break;
	}

	if (flag) {
		event.preventDefault();
		event.stopPropagation();
	}
}

async function onInputClick(event: MouseEvent) {
	if (
		!event.target ||
		!("value" in event.target) ||
		typeof event.target.value !== "string"
	)
		return;
	await showList(event.target.value);
	// // Scroll selected option into view.
	// listElement
	//   .querySelector(`[role="option"][data-value="${value}"]`)
	//   ?.scrollIntoView();
}

function onOptionClick(event: MouseEvent) {
	if (
		!event.target ||
		!("matches" in event.target) ||
		!(event.target.matches instanceof Function)
	)
		return;
	if (!event.target.matches(`[role="option"]:not([aria-disabled="true"])`))
		return;

	selectOption(event.target as HTMLElement);
	hideList();
}

function onListKeyDown(event: KeyboardEvent) {
	if (!event?.target || !("previousElementSibling" in event.target)) return;
	if (
		!("matches" in event.target) ||
		!(event.target.matches instanceof Function)
	)
		return;
	let flag = false;

	switch (event.key) {
		case "ArrowUp": {
			let prevOptionElement = event.target
				.previousElementSibling as HTMLElement | null;

			while (prevOptionElement) {
				if (
					prevOptionElement.matches(
						`[role="option"]:not([aria-disabled="true"])`,
					)
				)
					break;
				if (!(prevOptionElement.previousElementSibling instanceof HTMLElement))
					break;
				prevOptionElement = prevOptionElement.previousElementSibling;
			}

			prevOptionElement?.focus();
			flag = true;
			break;
		}

		case "ArrowDown": {
			if (!("nextElementSibling" in event.target)) return;
			let nextOptionElement = event.target
				.nextElementSibling as HTMLElement | null;

			while (nextOptionElement) {
				if (
					nextOptionElement.matches(
						`[role="option"]:not([aria-disabled="true"])`,
					)
				)
					break;

				if (!(nextOptionElement.nextElementSibling instanceof HTMLElement))
					break;
				nextOptionElement = nextOptionElement.nextElementSibling;
			}

			nextOptionElement?.focus();
			flag = true;
			break;
		}

		case "Enter":
			selectOption(event.target as HTMLElement);
			hideList();
			flag = true;
			break;

		case "Escape":
			hideList();
			flag = true;
			break;

		case "Tab":
			hideList();
			break;

		default:
			inputElement.focus();
	}

	if (flag) {
		event.preventDefault();
		event.stopPropagation();
	}
}

async function showList(inputValue: string) {
	const isExactMatch = options.some((o) =>
		o.options
			? o.options.some((o) => o.text === inputValue)
			: o.text === inputValue,
	);

	list = inputValue === "" || isExactMatch ? options : filter(inputValue);
	isListOpen = true;
}

function hideList() {
	if (!isListOpen) return;

	if (selectedOption) {
		inputElement.value = selectedOption.text;
	}

	isListOpen = false;
	inputElement.focus();
}

$: if (value && !!onSelect) {
	onSelect(value);
}

function selectOption(optionElement: HTMLElement) {
	value = optionElement.dataset.value || "";

	if (!optionElement.dataset.text || !optionElement.dataset.value) return;

	selectedOption = {
		text: optionElement.dataset.text,
		value: optionElement.dataset.value,
	};
}

$: cols = options[0]?.text?.split("|").length;
</script>

<div
  class="flex flex-col gap-2 focus-within:border-primary-200 print:hidden flex-1"
>
  <label class="label" for={id}>
    {label}
    {#if error}
      <span class="form-validation-error">
        {error}
      </span>
    {/if}
  </label>

  <div
    id="combobox"
    class="relative print:hidden"
    use:onClickOutside={hideList}
  >
    <slot name="icon-start" />

    <input
      bind:this={inputElement}
      on:focus
      on:blur
      on:input
      on:keyup={onInputKeyup}
      on:keydown={onInputKeydown}
      on:mousedown={onInputClick}
      class="combobox__input m-0 w-full py-2 px-4 border-2 border-gray-50 rounded-sm focus:outline-none input"
      {id}
      {name}
      type="text"
      {disabled}
      autocapitalize="none"
      autocomplete="off"
      {readonly}
      {placeholder}
      spellcheck="false"
      role="combobox"
      aria-autocomplete="list"
      aria-controls="combobox-options"
      aria-expanded={isListOpen}
      aria-required={required ? "true" : undefined}
    />

    <ul
      class={`bg-slate-800 max-h-[25dvh] overflow-y-auto absolute top-12 grid gap-x-4`}
      style={`grid-template-columns: repeat(${cols}, minmax(auto,1fr));`}
      class:hidden={!isListOpen}
      role="listbox"
      id="combobox-options"
      aria-label={label}
      on:click={onOptionClick}
      on:keydown={onListKeyDown}
      bind:this={listElement}
    >
      {#each list as option (option)}
        {#if option.options}
          <li class="list__option-heading">
            <slot name="group" group={option}>
              {option.text}
            </slot>
          </li>
          {#each option.options as o (o)}
            <li
              class="list__option"
              class:--disabled={o.disabled}
              role="option"
              tabindex={o.disabled ? undefined : -1}
              data-text={o.text}
              data-value={o.value}
              aria-selected={value === o.value}
              aria-disabled={o.disabled}
            >
              <slot name="option" option={o}>
                {o.text}
              </slot>
              <!-- {#if option.value === value} -->
              <!--   <svg viewBox="0 0 24 24" class="icon"> -->
              <!--     <polyline points="20 6 9 17 4 12"></polyline> -->
              <!--   </svg> -->
              <!-- {/if} -->
            </li>
          {/each}
        {:else}
          <li
            class="list__option grid grid-cols-subgrid col-span-full"
            class:bg-secondary-700={option.text === selectedOption.text}
            class:--disabled={option.disabled}
            role="option"
            tabindex={option.disabled === true ? undefined : -1}
            data-text={option.text}
            data-value={option.value}
            aria-selected={value === option.value}
            aria-disabled={option.disabled}
          >
            <slot name="option" {option}>
              {#each option.text.split("|") as part}
                <span>
                  {part}
                </span>
              {/each}
            </slot>
            <!-- {#if option.value === value} -->
            <!--   <svg viewBox="0 0 24 24" class="icon"> -->
            <!--     <polyline points="20 6 9 17 4 12"></polyline> -->
            <!--   </svg> -->
            <!-- {/if} -->
          </li>
        {/if}
      {:else}
        <li>No results available</li>
      {/each}
    </ul>

    <div class="visually-hidden" role="status" aria-live="polite">
      {available} results available.
    </div>
  </div>
</div>

<style>
  .combobox {
    --accent-color: #06113c;
    --border-radius: 1em;

    --option-border: ;
    --option-padding: ;

    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .input-container {
    position: relative;
  }

  .combobox__input:focus {
    outline: none;
  }

  .combobox:focus-within .combobox__input {
    border-color: var(--accent-color);
  }

  .list__option-heading {
    font-size: 0.9em;
    padding-inline: 1rem;
    padding-block-start: 0.4rem;
    color: gray;
  }

  .list__no-results {
    padding: 0.8rem 1rem;
  }

  .list__option {
    padding: 0.8rem 1rem;
    border: 0.2rem solid transparent;
    border-radius: 0.3rem;
  }

  .list__option > :global(*) {
    pointer-events: none;
  }

  .list__option.--disabled {
    pointer-events: none;
    opacity: 0.4;
  }

  .list__option:focus,
  .list__option:not([aria-disabled="true"]):hover {
    outline: none;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .list__option:active {
    cursor: pointer;
    outline: none;
    color: white;
    /* background-color: var(--accent-color) !important; */
  }
</style>
