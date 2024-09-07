export const getElement = <T>(elementId: string) =>
	document.getElementById(elementId) as T;

export const el = <T extends HTMLElement>(args: TemplateStringsArray) =>
	getElement<T>(args.toString());

export const selectAll = (inputGroup: string) => {
	const form = document.getElementById(inputGroup);
	if (!form) {
		console.log("no form");
		return;
	}
	const checkboxes = Array.from(form.getElementsByTagName("input")).filter(
		(i) => i.type === "checkbox",
	);
	console.log(checkboxes);
	const someUnchecked = checkboxes.some((c) => !c.checked);
	for (const c of checkboxes) {
		c.checked = someUnchecked;
	}
};
