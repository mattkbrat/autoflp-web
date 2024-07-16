import { prisma } from "$lib/server/database";

export const getPayments = async (deal: string) => {
	if (!deal) return [];
	return prisma.payment.findMany({
		where: {
			dealId: deal,
		},
	});
};

export const getMonthlyPayments = async ({
	month,
	year,
}: { month: number; year: number }) => {
	const date = new Date(year, month, 2);
	return prisma.payment.findMany({
		where: {
			date: {
				startsWith: `${date.getFullYear()}-${date.getMonth()}`,
			},
		},
	});
};
