import { createParser } from "nuqs";

export const parseAsState = createParser({
	parse(query) {
		const num = Number(query);
		if (Number.isNaN(num) || (num !== 0 && num !== 1)) return null;
		return num;
	},
	serialize(v) {
		return v.toString();
	},
});
