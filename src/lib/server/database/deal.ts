import { randomUUID } from "node:crypto";
import type { DealFields } from "$lib/finance";
import { calcFinance } from "$lib/finance/calc";
import type { AsyncReturnType } from "$lib/types";
import { wrap } from "@mikro-orm/core";
import { orm } from ".";
import type { Account } from "./models/Account";
import type { Creditor } from "./models/Creditor";
import { Deal } from "./models/Deal";
import { DealCharge } from "./models/DealCharge";
import { DealSalesman } from "./models/DealSalesman";
import { DealTrade } from "./models/DealTrade";
import { DefaultCharge } from "./models/DefaultCharge";
import type { Inventory } from "./models/Inventory";

export type DealShortDetails = {
	lastName: string;
	firstName: string;
	deal: string;
	account: string;
	pmt: string;
};

export const getDealIds = async () => {
	return orm.em.findAll(Deal, {
		fields: ["id"],
	});
};

export const getAccountsWithDeals = async () => {
	return orm.em.find(
		Deal,
		{
			state: 1,
		},
		{
			populate: ["account", "account.contact"],
			fields: ["id", "account.contact.lastName", "account.contact.firstName"],
			orderBy: {
				account: {
					contact: {
						lastName: "desc",
					},
				},
			},
		},
	);
};

export type AccountsWithDeals = AsyncReturnType<typeof getAccountsWithDeals>;

export const getAccountDeals = async (account: string) => {
	const deals = orm.em.find(
		Deal,
		{
			account: {
				id: account,
			},
		},
		{
			populate: ["inventory.vin"],
			fields: [
				"date",
				"id",
				"inventory.make",
				"inventory.model",
				"inventory.year",
				"pmt",
			],
			orderBy: {
				state: "desc",
				date: "desc",
			},
		},
	);

	return deals;
};

export const getAndGroupDeals = async () => {
	return getAccountsWithDeals().then((deals) => {
		return deals.reduce(
			(acc, curr) => {
				const key = `${curr.account.contact.lastName} ${curr.account.contact.firstName}`;

				if (key in acc) {
					return acc;
				}

				const theseValues = {
					...curr.account.contact,
					account: curr.account.id,
					deal: curr.id,
				};

				if (!acc[key]) {
					acc[key] = theseValues;
				} else {
					console.warn("duplicate found", curr);
				}

				return acc;
			},
			{} as { [key: string]: DealShortDetails },
		);
	});
};

export const getAndGroupSelected = async (selected: string) => {
	return getAccountDeals(selected).then((deals) =>
		deals.map((deal, n) => {
			const { inventory, date, id, pmt } = deal;
			return {
				...inventory,
				date,
				id,
				pmt,
			};
		}),
	);
};

export const openInventoryDeals = async (vin: string) => {
	return orm.em.find(Deal, {
		inventory: vin,
		state: 1,
	});
};

export const dealExists = async ({
	date,
	vin,
	account,
}: { date: Date; vin: string; account: string }) => {
	return orm.em.findOne(Deal, {
		inventory: vin,
		date: date.toISOString().split("T")[0],
		account,
	});
};

export const getDealById = async (id: string) => {
	return orm.em.findOne(Deal, { id });
};

export const closeDealsByIds = async (ids: string[]) => {
	for await (const id of ids) {
		const deal = await getDealById(id);
		if (!deal) {
			console.warn("Can not close non-existant deal by id", id);
			continue;
		}
		deal.state = 0;
	}

	return orm.em.flush();
};

export const closeDeals = async (deals: Deal[]) => {
	for (const deal of deals) {
		deal.state = 0;
	}

	return orm.em.flush();
};

export const getCharges = async (deal: string) => {
	return orm.em.find(DealCharge, { deal });
};

export const getSalesman = async (deal: string) => {
	return orm.em.find(
		DealSalesman,
		{
			deal,
		},
		{
			populate: ["salesman"],
		},
	);
};

export const deleteCharges = async (deal: string) => {
	const charges = await getCharges(deal);
	for await (const charge of charges) {
		orm.em.remove(charge);
	}

	return orm.em.flush();
};

export const deleteDealSalesmen = async (deal: string) => {
	const dealSalesmen = await orm.em.find(DealSalesman, { deal });
	console.log({ dealSalesmen, deal });
	for await (const salesman of dealSalesmen) {
		console.log("removing", salesman);
		await orm.em.removeAndFlush(salesman);
	}
};

export type DealUpdate = {
	deal: Deal;
	account: Account;
	inventory: Inventory;
	creditor: Creditor | null;
	update: DealFields;
};

export const getDealUpdate = ({ update, ...p }: DealUpdate) => {
	const finance = calcFinance(update);
	return {
		id: p.deal.id || update.id || randomUUID(),
		date: update.date.toISOString().split("T")[0],
		state: 1,
		account: p.account,
		inventory: p.inventory,
		creditor: p.creditor,
		cash: Number(update.priceSelling).toFixed(2),
		down: Number(update.priceDown).toFixed(2),
		apr: Number(update.apr).toFixed(2),
		finance:
			finance.type === "credit"
				? Number(finance.financeAmount).toFixed(2)
				: null,
		lien:
			finance.type === "credit" ? Number(finance.totalLoan).toFixed(2) : null,
		pmt:
			finance.type === "credit"
				? Number(finance.monthlyPayment).toFixed(2)
				: null,
		term: update.term.toString(),
		taxCity:
			finance.type === "credit" ? Number(update.taxCity).toFixed(2) : null,
		taxState:
			finance.type === "credit" ? Number(update.taxState).toFixed(2) : null,
		taxCounty:
			finance.type === "credit" ? Number(update.taxCounty).toFixed(2) : null,
		taxRtd: finance.type === "credit" ? Number(update.taxRtd).toFixed(2) : null,
	};
};

export const updateDeal = async (p: DealUpdate) => {
	const orig = await orm.em.findOneOrFail(Deal, {
		id: p.deal.id,
	});

	const wrapped = wrap(orig).assign(getDealUpdate(p), { em: orm.em });

	await orm.em.persistAndFlush(wrapped);

	return wrapped;
};

export const createDeal = async (p: DealUpdate) => {
	const deal = wrap(new Deal()).assign(getDealUpdate(p));
	await orm.em.insert(Deal, deal);
	return deal;
};

export type GroupedDeals = AsyncReturnType<typeof getAndGroupDeals>;
export type GroupedAccountDeals = AsyncReturnType<typeof getAndGroupSelected>;

export const getCreditorCharges = async (creditor: string) => {
	return orm.em.find(
		DefaultCharge,
		{ creditor },
		{
			populate: ["charge"],
		},
	);
};

export const applySalesmen = async (deal: Deal, salesmen: string[]) => {
	const updates: DealSalesman[] = salesmen.map((id) => {
		return wrap(new DealSalesman()).assign(
			{
				deal: deal.id,
				salesman: id,
				id: randomUUID(),
			},
			{ em: orm.em },
		);
	});
	return orm.em.persistAndFlush(updates);
};

export const applyDefaultCharges = async (deal: Deal) => {
	if (!deal.creditor) {
		console.warn("Can not apply charges without a creditor", deal.id);
		return;
	}
	const charges = await getCreditorCharges(deal.creditor.id);

	const updates: DealCharge[] = charges.map(({ charge: { name, id } }) => {
		return wrap(new DealCharge()).assign(
			{
				deal,
				charge: id,
				note: name,
				id: randomUUID(),
				date: deal.date,
			},
			{ em: orm.em },
		);
	});

	return orm.em.persistAndFlush(updates);
};

export const createTrades = async (deal: Deal, vins: string[]) => {
	if (!deal.id) return;

	const updates: DealTrade[] = vins.map((vin) =>
		wrap(new DealTrade()).assign(
			{ vin, id: randomUUID(), deal: deal.id },
			{ em: orm.em },
		),
	);

	return orm.em.persistAndFlush(updates);
};
