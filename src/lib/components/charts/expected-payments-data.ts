import { stringToColorHsl } from "$lib/format/stringToColor";
import type { ExpectedWithPayments } from "$lib/server/database/deal";

export const data = (expected: ExpectedWithPayments) => {
	const keys = Object.keys(expected);
	type SubKey = keyof ExpectedWithPayments[keyof ExpectedWithPayments];
	const subKeys: SubKey[] = ["expected", "paid"];

	return {
		labels: subKeys,
		datasets: keys.map((key) => {
			const label = key || "Unasigned";
			const isUnasigned = !key;
			return {
				label,
				backgroundColor: isUnasigned ? "gray" : stringToColorHsl(label, 40, 50),
				borderColor: isUnasigned ? "black" : stringToColorHsl(label, 90, 50),
				data: subKeys.map((k) => expected[key][k]),
			};
		}),
	};
};