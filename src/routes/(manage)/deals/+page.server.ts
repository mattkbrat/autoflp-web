import { randomUUID } from "node:crypto";
import { type Trades, upsertDeal } from "$lib/server/deal";
import { getDetailedDeal } from "$lib/server/database/deal";
import { builder } from "$lib/server/form/builder";
import type { FinanceCalcResult } from "$lib/finance/calc";
import { dealForms } from "$lib/types/forms";

import {
	upsertInventory,
	type Inventory,
} from "$lib/server/database/inventory";
import type { DealFieldsWithFinance } from "$lib/finance/fields";
import { fail, type Actions } from "@sveltejs/kit";

export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;

		const deal = Object.fromEntries(data) as unknown as DealFieldsWithFinance;
		const tradeKeys = Object.keys(deal).filter(
			(k) => k.startsWith("trade-") && typeof deal[k] === "string",
		);
		deal.id = deal.id || randomUUID();
		deal.downOwed = Number(data.get("downOwed"));
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

		if (!newDealId) {
			console.error("No deal id");
			return fail(500, { message: "something went wrong" });
		}

		const detailed = await getDetailedDeal({ id: newDealId });

		if (!detailed) {
			console.error("Could not feetch detiled deal");
			return fail(500, { message: "something went wrong" });
		}

		const builtForms: string[] = [];

		for await (const form of dealForms) {
			const built = await builder({
				deal: detailed,
				form: form.key,
				finance: deal.finance,
			}).then((form) => form?.output);

			if (!built) continue;
			console.log("Adding", built);
			builtForms.push(built);
		}

		console.log(builtForms);
		return {
			data: {
				id: newDealId,
				forms: builtForms || [],
			},
			method: id ? "update" : "insert",
		};
	},
} satisfies Actions;
