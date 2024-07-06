import { randomUUID } from "node:crypto";
import type { DealFields } from "$lib/finance";
import { wrap } from "@mikro-orm/core";
import {
	applyDefaultCharges,
	applySalesmen,
	closeDeals,
	createDeal,
	createTrades,
	dealExists,
	deleteCharges,
	deleteDealSalesmen,
	openInventoryDeals,
	updateDeal,
} from "../database/deal";
import { Deal } from "../database/models/Deal";
import type { AsyncReturnType } from "$lib/types";
import { getCreditor, getAccount } from "../database/account";
import { getSingleInventory } from "../database/inventory";

export type Trades = { vin: string; value: number }[];

export const upsertDeal = async (deal: DealFields, trades: Trades) => {
	const dealDoesExist =
		deal.id &&
		(await dealExists({
			vin: deal.vin,
			account: deal.account,
			date: deal.date,
		}));

	if (dealDoesExist) {
		deal.id = dealDoesExist.id;
	}

	const openDeals = await openInventoryDeals(deal.vin).then(
		(deals) => deal.id && deals.filter((d) => d.id !== deal.id),
	);
	const account = await getAccount({ id: deal.account });

	const creditor =
		deal.term > 0 ? await getCreditor({ id: deal.creditor }) : null;

	let updatedDeal: Deal | null = null;

	if (!account) {
		console.error("No account for deal by id", account);
		return;
	}
	const inv = await getSingleInventory({ vin: deal.vin });
	if (!inv) {
		console.error("No inventory for deal by vin", deal.vin);
		return;
	}

	await closeDeals(openDeals || []);

	if (dealDoesExist) {
		const trades = await getTrades(deal.id);
		for await (const trade of trades) {
			await deleteInventory(trade.id, true);
		}

		await deleteCharges(deal.id);
		await deleteDealSalesmen(deal.id);

		// Close the inventory
		if (inv) {
			await updateInv({
				vin: inv.vin,
				inventory: wrap(inv).assign({ state: 0 }),
			});
		}

		updatedDeal = await updateDeal({
			deal: dealDoesExist,
			account,
			inventory: inv,
			creditor,
			update: deal,
			finance: deal.finance,
		});
	} else {
		const newDeal = new Deal();
		const id = randomUUID();
		updatedDeal = await createDeal({
			deal: wrap(newDeal).assign({ id }),
			account,
			inventory: inv,
			creditor,
			update: deal,
			finance: deal.finance,
		});
	}

	if (updatedDeal.creditor) {
		await applyDefaultCharges(updatedDeal);
	}

	await createTrades(updatedDeal, trades || []);
	await applySalesmen(updatedDeal, deal.salesmen || []);

	// TODO: notify Deal
	//

	console.debug({ updatedDeal });

	return updatedDeal;
};

export type UspertedDeal = AsyncReturnType<typeof upsertDeal>;
