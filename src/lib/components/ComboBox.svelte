<!-- Adapted from https://svelte.dev/repl/144f22d18c6943abb1fdd00f13e23fde?version=3.49.0 -->

<script lang="ts">
import { waitForElm } from "$lib/element";import { onMount } from "svelte";import { uid, onClickOutside, filterCache, type Option } from "./comboBox";let {	disabled = false,	value = "",	name = "",	required = false,	readonly = false,	label = "",	id = uid(),	error,	placeholder,	options,	onSelect,}: {	value: string;	name: string;	onSelect?: (selected: string) => void;	disabled?: boolean;	required?: boolean;	readonly?: boolean;	options: Option[];	label?: string;	id?: string;	error?: unknown;	placeholder?: string;} = $props();let hasExited = false;export const filter = (text: string) => {	const sanitized = text.trim().toLowerCase();	if (sanitized in filterCache) return filterCache[sanitized];	const match = options.reduce((a, o) => {		let match: Option | undefined = undefined;		if (o.options) {			const options = o.options.filter((o) =>				o.text.toLowerCase().includes(sanitized),			);			if (options.length) {				match = { ...o, options };			}		} else if (o.text.toLowerCase().includes(sanitized)) {			match = o;		}		if (match) {			a.push(match);		}		return a;	}, [] as Option[]);	filterCache[sanitized] = match;	return match;};let listElement: HTMLUListElement;let inputElement: HTMLInputElement;let list: Option[] = $state([]);let available = $state(0);$effect(() => {	if (options.length) {		available = options.length;	} else {		available = list.length;	}});let isListOpen = $state(false);let selectedOption: Pick<Option, "value" | "text"> = $state({	value: "",	text: "",});const inputValue = $derived(selectedOption.value);const displayInputValue = $derived(	selectedOption.text.replaceAll("|", " ").trim(),);async function onInputKeyup(event: KeyboardEvent) {	if (		!event?.target ||		!("value" in event.target) ||		typeof event.target.value !== "string"	)		return;	switch (event.key) {		case "Escape":		case "ArrowUp":		case "ArrowLeft":		case "ArrowRight":		case "Enter":		case "Tab":		case "Shift":			break;		case "ArrowDown":			showList(event.target.value).then(() => {				waitForElm('[role="option"]:not([aria-disabled="true"])').then((el) =>					el?.focus(),				);			});			event.preventDefault();			event.stopPropagation();			break;		default:			showList(event.target.value);	}}function onInputKeydown(event: KeyboardEvent) {	if (!event || !("key" in event)) return;	let flag = false;	switch (event.key) {		case "Escape":			hideList();			flag = true;			break;		case "Tab":			hideList();			break;	}	if (flag) {		event.preventDefault();		event.stopPropagation();	}}async function onInputClick(event: MouseEvent) {	if (		!event.target ||		!("value" in event.target) ||		typeof event.target.value !== "string"	)		return;	await showList(event.target.value);	// // Scroll selected option into view.	// listElement	//   .querySelector(`[role="option"][data-value="${value}"]`)	//   ?.scrollIntoView();}function onOptionClick(event: MouseEvent) {	if (		!event.target ||		!("matches" in event.target) ||		!(event.target.matches instanceof Function)	)		return;	if (!event.target.matches(`[role="option"]:not([aria-disabled="true"])`))		return;	selectOption(event.target as HTMLElement);	hideList();}function onListKeyDown(event: KeyboardEvent) {	if (!event?.target || !("previousElementSibling" in event.target)) return;	if (		!("matches" in event.target) ||		!(event.target.matches instanceof Function)	)		return;	let flag = false;	switch (event.key) {		case "ArrowUp": {			let prevOptionElement = event.target				.previousElementSibling as HTMLElement | null;			while (prevOptionElement) {				if (					prevOptionElement.matches(						`[role="option"]:not([aria-disabled="true"])`,					)				)					break;				if (!(prevOptionElement.previousElementSibling instanceof HTMLElement))					break;				prevOptionElement = prevOptionElement.previousElementSibling;			}			prevOptionElement?.focus();			flag = true;			break;		}		case "ArrowDown": {			if (!("nextElementSibling" in event.target)) return;			let nextOptionElement = event.target				.nextElementSibling as HTMLElement | null;			while (nextOptionElement) {				if (					nextOptionElement.matches(						`[role="option"]:not([aria-disabled="true"])`,					)				)					break;				if (!(nextOptionElement.nextElementSibling instanceof HTMLElement))					break;				nextOptionElement = nextOptionElement.nextElementSibling;			}			nextOptionElement?.focus();			flag = true;			break;		}		case "Enter":			selectOption(event.target as HTMLElement);			hideList();			flag = true;			break;		case "Escape":			hideList();			flag = true;			break;		case "Tab":			hideList();			break;		default:			inputElement.focus();	}	if (flag) {		event.preventDefault();		event.stopPropagation();	}}async function showList(inputValue: string) {	const isExactMatch = options.some((o) =>		o.options			? o.options.some((o) => o.text === inputValue)			: o.text === inputValue,	);	list = inputValue === "" || isExactMatch ? options : filter(inputValue);	if (list.length === 0) list = options;	isListOpen = true;}function hideList() {	if (!isListOpen) return;	isListOpen = false;	inputElement.focus();}$effect(() => {	if (value && selectedOption?.value !== value && options.length) {		setTimeout(() => {			waitForElm(`#${CSS.escape(value)}`).then(				(el) => el && !hasExited && selectOption(el),			);		}, 200);	}});function selectOption(optionElement: HTMLElement) {	if (!optionElement.dataset.text || !optionElement.dataset.value) return;	selectedOption = {		text: optionElement.dataset.text,		value: optionElement.dataset.value,	};	value = selectedOption.value;	if (onSelect) {		onSelect(value);	}}const cols = $derived(options[0]?.text?.split("|").length);onMount(() => {	return () => {		hasExited = true;	};});</script>

{#snippet combo_option(o: Option)}
  {@const parts = o.text.split("|")}
  <li
    class="list__option grid grid-cols-subgrid col-span-full"
    id={o.value}
    class:--disabled={o.disabled}
    role="option"
    tabindex={o.disabled ? undefined : -1}
    data-text={o.text}
    data-value={o.value}
    aria-selected={value === o.value}
    aria-disabled={o.disabled}
  >
    {#each parts as part}
      <span>
        {part}
      </span>
    {/each}
  </li>
{/snippet}

<div class="flex flex-col focus-within:border-primary-200 print:hidden flex-1">
  <label class="min-w-max uppercase" for={id}>
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
    <input {id} {name} value={inputValue} type="hidden" />
    <input
      {disabled}
      {readonly}
      {placeholder}
      bind:this={inputElement}
      onkeyup={onInputKeyup}
      onkeydown={onInputKeydown}
      onmousedown={onInputClick}
      value={displayInputValue}
      class="combobox__input m-0 w-full py-2 px-4 border-2 border-gray-50 rounded-sm focus:outline-none input"
      type="text"
      autocapitalize="none"
      autocomplete="off"
      spellcheck="false"
      role="combobox"
      aria-autocomplete="list"
      aria-controls="combobox-options"
      aria-expanded={isListOpen}
      aria-required={required ? "true" : undefined}
    />

    <ul
      class={"bg-slate-800 max-h-[50dvh] overflow-y-auto absolute top-12 grid gap-x-4"}
      style={`grid-template-columns: repeat(${cols}, minmax(auto,1fr)); z-index: 20`}
      class:hidden={!isListOpen}
      role="listbox"
      id="combobox-options"
      aria-label={label}
      onclick={onOptionClick}
      onkeydown={onListKeyDown}
      bind:this={listElement}
    >
      {#each list as option (option)}
        {#if option.options}
          <li class="list__option-heading">
            {option.text}
          </li>
          {#each option.options as o (o)}
            {@render combo_option(o)}
          {/each}
        {:else}
          {@render combo_option(option)}
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
  @import "./combobox.css";
</style>
