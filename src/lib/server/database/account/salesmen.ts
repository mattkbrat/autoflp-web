import { prisma } from "$lib/server/database";
import { contactSelect, orderContactsBy } from ".";

export const getSalesmen = async () => {
	return prisma.salesman.findMany({
		select: {
			id: true,
			contact: contactSelect,
		},
		orderBy: orderContactsBy,
	});
};
