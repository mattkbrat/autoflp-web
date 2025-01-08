import { browser } from "$app/environment";

export const getElement = <T>(elementId: string) =>
	document.getElementById(elementId) as T;

export const el = <T extends HTMLElement>(args: TemplateStringsArray) =>
	getElement<T>(args.toString());

export const selectAll = (
	inputGroup: string,
	p?: {
		exclude?: string[];
		include?: string[];
	},
) => {
	const form = document.getElementById(inputGroup);
	if (!form) {
		console.log("no form");
		return;
	}
	const checkboxes = Array.from(form.getElementsByTagName("input")).filter(
		(i) => {
			if (i.type !== "checkbox") return false;
			if (!p) return true;
			if (p.exclude) {
				return !p.exclude.includes(i.name);
			}
			if (p.include) {
				return p.include.includes(i.name);
			}
			return true;
		},
	);
	console.log(checkboxes);
	const someUnchecked = checkboxes.some((c) => !c.checked);
	for (const c of checkboxes) {
		c.checked = someUnchecked;
	}
};

export function waitForElm<Element extends HTMLElement>(
	selector: string,
): Promise<Element | null> {
	return new Promise((resolve) => {
		if (!browser) return null;
		const querySelector = document.querySelector(selector);
		if (querySelector) {
			return resolve(querySelector);
		}

		const observer = new MutationObserver((_mutations) => {
			const querySelector = document.querySelector(selector);
			if (querySelector) {
				observer.disconnect();
				resolve(querySelector);
			}
		});

		// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

export function printCanvas(dataUrl: string, title = "Print Canvas") {
	const windowContent = `<!DOCTYPE html><html><head><title>${title}</title></head><body><img src="${dataUrl}"></body></html>`;
	const printWin = window.open("", "", "width=340,height=260");
	if (!printWin) return;
	printWin.document.open();
	printWin.document.write(windowContent);
	printWin.document.close();
	printWin.focus();
	printWin.print();
	printWin.close();
}
