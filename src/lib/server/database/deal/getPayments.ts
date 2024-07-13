import { prisma } from "$lib/server/database";

export const getPayments = async (deal: string) => {
	if (!deal) return [];
	return prisma.payment.findMany({
		where: {
			dealId: deal,
		},
	});
};
