// Adapted from https://svelte.dev/repl/144f22d18c6943abb1fdd00f13e23fde?version=3.49.0
let id = 1;

export type InnerOption = {
	text: string;
	value: string;
	disabled?: boolean;
};
export type Option = InnerOption & {
	options?: InnerOption[];
};
export function uid() {
	return `ui:${id++}`;
}

export function clone(json: string) {
	return JSON.parse(JSON.stringify(json));
}

export function onClickOutside(element: HTMLElement, callback: () => void) {
	const onClick = (event) => !element.contains(event.target) && callback();

	document.body.addEventListener("mousedown", onClick);

	return {
		update(newCallback) {
			callback = newCallback;
		},

		destroy() {
			document.body.removeEventListener("mousedown", onClick);
		},
	};
}

export const filterCache: {
	[key: string]: Option[];
} = {};