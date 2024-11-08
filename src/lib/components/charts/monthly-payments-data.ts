import type { GroupedSalesmanPayments } from "$lib/server/database/deal";

const sum = (numbers: number[]) => {
	return numbers.reduce((acc, curr) => acc + curr, 0);
};

export const data = (payments: GroupedSalesmanPayments) => {
	const labelsSet = Object.keys(payments).reduce(
		(acc, k) => {
			const theseLabels = Object.keys(payments[k]);

			for (const label of theseLabels) {
				acc.add(label);
			}

			return acc;
		},
		new Set() as Set<string>,
	);

	const allLabels = Array.from(labelsSet);
	const keys = Object.keys(payments);
	const baseData = Array.from(new Array(allLabels.length)).map((_k) => {
		return Array.from(new Array(keys).keys()).map((_) => 0);
	});

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const salesmen = payments[key];

		for (const [salesman, payments] of Object.entries(salesmen)) {
			const index = allLabels.indexOf(salesman);
			if (index === -1) {
				console.warn("Unkown salesman", salesman, allLabels);
				continue;
			}

			baseData[index][i] = sum(payments);
		}
	}

	return {
		labels: keys,
		datasets: allLabels.map((k, i) => {
			return {
				label: k,
				data: baseData[i],
			};
		}),
	};
};
