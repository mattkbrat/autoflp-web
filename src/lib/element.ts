export const getElement = <T>(elementId: string) =>
	document.getElementById(elementId) as T;

export const el = <T extends HTMLElement>(args: TemplateStringsArray) =>
	getElement<T>(args.toString());
