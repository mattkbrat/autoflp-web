import { randomUUID } from "node:crypto";
import type { DealFields } from "$lib/finance";
import { type Trades, upsertDeal } from "$lib/server/deal";
import {
	getCharges,
	getDetailedDeal,
	getSalesmen,
} from "$lib/server/database/deal";
import { builder } from "$lib/server/form/builder";
import type { FinanceCalcResult } from "$lib/finance/calc";
import { forms } from "$lib/types/forms";

import {
	upsertInventory,
	type Inventory,
} from "$lib/server/database/inventory";

export const load = async ({ params }) => {
	return {};
};

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;

		const deal = Object.fromEntries(data) as unknown as DealFields;
		const tradeKeys = Object.keys(deal).filter(
			(k) => k.startsWith("trade-") && typeof deal[k] === "string",
		);
		deal.salesmen = (deal.salesmen as unknown as string).split(",");
		deal.id = deal.id || randomUUID();
		deal.date = new Date(deal.date);
		deal.trades = (deal.trades as unknown as string).split(",");

		deal.finance = JSON.parse(
			deal.finance as unknown as string,
		) as FinanceCalcResult;

		const trades: Trades = [];

		for await (const tradeString of tradeKeys) {
			const trade = JSON.parse(deal[tradeString]) as Partial<Inventory> & {
				value: number;
			};
			if (!trade.vin) {
				continue;
			}
			deal[tradeString] = undefined;

			const inventory: Partial<Inventory> = {
				vin: trade.vin || "",
				year: trade.year?.toString() || "",
				make: trade.make || "",
				state: 1,
			};

			await upsertInventory(inventory);

			trades.push({ vin: trade.vin, value: trade.value });
		}

		const handled = await upsertDeal(deal, trades);

		const { id: newDealId } = handled || {};

		if (newDealId) {
			const detailed = await getDetailedDeal(newDealId);
			const salesmen = await getSalesmen(deal.salesmen);

			console.log("Got salesmen", salesmen);
			const charges = await getCharges(newDealId);

			if (detailed) {
				for (const { key, title } of forms) {
					await builder({
						deal: detailed,
						form: key,
						charges,
						salesmen,
						finance: deal.finance,
					});
				}
			} else {
				console.error("Could not get detailed");
			}
		} else {
			console.log("No deal id");
		}

		return {
			data: {
				id: newDealId,
			},
			method: id ? "update" : "insert",
		};
	},
};
