export const getElement = <T>(elementId: string) =>
	document.getElementById(elementId) as T;

export const el = <T>(args: TemplateStringsArray) =>
	getElement<T>(args.toString());
