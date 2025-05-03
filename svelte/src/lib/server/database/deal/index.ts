import { prisma } from "$lib/server/database";
import type { Deal, DealTrade, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { DealFields } from "$lib/finance";
import type { FinanceCalcResult } from "$lib/finance/calc";
import type { Trades } from "$lib/server/deal";
import type { getPayments } from "./getPayments";
import { dealFieldsToDeal } from "./dealFieldsToDeal";
import { sendDealNotification } from "$lib/server/notify";
export * from "./dealCharge";
export * from "./getDeals";
export * from "./getSalesmanPayments";
export * from "./get-expected-with-salesmen";
export * from "./closeUnbillableDeals";

export const closeDeals = async (deals: string[]) => {
	return prisma.deal.updateMany({
		where: {
			id: {
				in: deals,
			},
		},
		data: {
			state: 0,
		},
	});
};

export const getDealTrades = async (deal: string) => {
	return prisma.dealTrade.findMany({ where: { dealId: deal } });
};

export const deleteDealTrades = async (deal: string) => {
	if (!deal) {
		throw new Error("Must provide a deal ID");
	}
	return prisma.dealTrade.deleteMany({
		where: {
			dealId: deal,
		},
	});
};

export const updateDeal = async (
	deal: DealFields,
	finance: FinanceCalcResult,
) => {
	if (!deal.id) {
		throw new Error("Must provide a deal ID");
	}
	const data = dealFieldsToDeal({ ...deal, finance }, 1);
	return prisma.$transaction(async (tx) => {
		const updated = await tx.deal.update({ where: { id: deal.id }, data });
		await tx.inventory.update({ where: { vin: deal.vin }, data: { state: 0 } });
		return updated;
	});
};
export const updatePartialDeal = async (id: string, data: Partial<Deal>) => {
	if (!id) {
		throw new Error("Must provide a deal ID");
	}

	const closeDeal = data.state === 0;

	const updated = await prisma.deal.update({ where: { id }, data });

	if (!closeDeal) return updated;

	return sendDealNotification({ type: "close", dealId: updated.id }).then(
		() => {
			return updated;
		},
	);
};

export const createDeal = async (
	deal: DealFields,
	finance: FinanceCalcResult,
) => {
	const data = dealFieldsToDeal({ ...deal, finance }, 1);
	return prisma.$transaction(async (tx) => {
		const created = await tx.deal.create({ data });
		await tx.inventory.update({
			where: { vin: created.inventoryId },
			data: { state: 0 },
		});
		return created;
	});
};

export const createTrades = async (deal: string, trades: Trades) => {
	const dealTrades: DealTrade[] = trades.map((trade) => {
		return {
			dealId: deal,
			vin: trade.vin,
			value: trade.value.toFixed(2),
			id: randomUUID(),
		};
	});
	return prisma.$transaction(async (tx) => {
		const trades = await tx.dealTrade.createMany({
			data: dealTrades,
		});

		const open = await tx.deal.findMany({
			where: {
				inventoryId: {
					in: dealTrades.map((t) => t.vin),
				},
				state: 1,
			},
		});

		if (open.length) {
			await tx.deal.updateMany({
				where: {
					id: {
						in: open.map((v) => v.id),
					},
				},
				data: {
					state: 0,
				},
			});

			for await (const v of open) {
				await sendDealNotification({ dealId: v.id, type: "close" });
			}
		}

		return trades;
	});
};

export type Payments = Prisma.PromiseReturnType<typeof getPayments>;
