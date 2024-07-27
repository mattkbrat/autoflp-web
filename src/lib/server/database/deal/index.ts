import { prisma } from "$lib/server/database";
import type { Deal, DealSalesman, DealTrade, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import type { DealFields } from "$lib/finance";
import type { FinanceCalcResult } from "$lib/finance/calc";
import type { Trades } from "$lib/server/deal";
import { getPayments } from "./getPayments";
import { dealFieldsToDeal } from "./dealFieldsToDeal";
export * from "./dealCharge";
export * from "./getDeals";

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

export const deleteDealSalesmen = async (deal: string) => {
	if (!deal) {
		throw new Error("Must provide a deal ID");
	}
	return prisma.dealSalesman.deleteMany({
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
	return prisma.deal.update({ where: { id: deal.id }, data });
};
export const updatePartialDeal = async (id: string, data: Partial<Deal>) => {
	if (!id) {
		throw new Error("Must provide a deal ID");
	}
	return prisma.deal.update({ where: { id }, data });
};

export const createDeal = async (
	deal: DealFields,
	finance: FinanceCalcResult,
) => {
	const data = dealFieldsToDeal({ ...deal, finance }, 1);
	return prisma.deal.create({ data });
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
	return prisma.dealTrade.createMany({
		data: dealTrades,
	});
};

export const createDealSalemen = async (deal: string, salesmen: string[]) => {
	const dealSalesmen: DealSalesman[] = salesmen.map((id) => {
		return {
			salesmanId: id,
			dealId: deal,
			id: randomUUID(),
		};
	});

	console.log("deal salesmen", dealSalesmen);
	return prisma.dealSalesman.createMany({ data: dealSalesmen });
};

export const getDealSalesmen = async (deal: string) => {
	return prisma.dealSalesman.findMany({ where: { dealId: deal } });
};

export type Payments = Prisma.PromiseReturnType<typeof getPayments>;
