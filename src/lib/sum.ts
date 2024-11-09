export const sum = (numbers: number[]) => {
	return numbers.reduce((acc, curr) => acc + curr, 0);
};

export const sumPayments = (payments: { amount: string }[]) => {
	return payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
};