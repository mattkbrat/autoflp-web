import { prisma } from "$lib/server/database";
import type { Deal, DealCharge } from "@prisma/client";
import { randomUUID } from "node:crypto";

export const getDefaultCharges = async (creditor: string) => {
	return prisma.defaultCharge.findMany({
		where: {
			creditorId: creditor,
		},
	});
};

export const applyDefaultCharges = async (deal: Deal) => {
	if (!deal.creditorId) {
		console.warn("Can not apply charges without a creditor", deal.id);
		return;
	}
	const charges = await getDefaultCharges(deal.creditorId);

	const dealCharges: Omit<DealCharge, "note">[] = charges.map((charge) => {
		return {
			id: randomUUID(),
			chargeId: charge.id,
			dealId: deal.id,
			date: deal.date,
		};
	});
	return prisma.dealCharge.createMany({
		data: dealCharges,
	});
};

export const getDealCharges = async (deal: string) => {
	return prisma.dealCharge.findMany({
		where: { dealId: deal },
		include: { charge: true },
	});
};

export const deleteDealCharges = async (deal: string) => {
	if (!deal) {
		throw new Error("Must provide a deal ID");
	}
	return prisma.dealCharge.deleteMany({
		where: {
			dealId: deal,
		},
	});
};
