import { roundToPenny } from "$lib/finance/roundToPenny";

export const getPercent = (num: number) => {
	const dividend = num > 0 ? 100 : 1;
	return roundToPenny(num / dividend);
};
