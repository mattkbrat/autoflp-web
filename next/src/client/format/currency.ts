const currencyFormat = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export const formatCurrency = (
	amount: string | number | undefined | null,
	blankZeroes = true,
) => {
	if (!amount || Number.isNaN(Number(amount))) return "-";
	if (+amount === 0 && blankZeroes) return "-";
	const num = Number(amount || 0);
	const abs = Math.abs(num);
	const formatted = currencyFormat.format(abs).slice(1);
	if (num > 0) {
		return formatted;
	}
	return `( ${formatted} )`;
};
