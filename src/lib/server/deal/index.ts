import { randomUUID } from "node:crypto";
import type { AsyncReturnType } from "$lib/types";
import { getCreditor, getAccount } from "../database/account";
import { getSingleInventory, upsertInventory } from "../database/inventory";
import {
	closeDeals,
	deleteDealCharges,
	deleteDealSalesmen,
	deleteDealTrades,
	getDeal,
	getDealTrades,
	getOpenInventoryDeals,
	updateDeal,
	applyDefaultCharges,
	createTrades,
	createDealSalemen,
	createDeal,
} from "../database/deal";
import type { DealFieldsWithFinance } from "$lib/finance/fields";
import type { Deal } from "@prisma/client";

export type Trades = { vin: string; value: number }[];
export * from "./billing";

export const upsertDeal = async (
	deal: DealFieldsWithFinance,
	trades: Trades,
) => {
	const dealDoesExist =
		deal.id &&
		(await getDeal({
			date_accountId_inventoryId: {
				inventoryId: deal.vin,
				accountId: deal.account,
				date: deal.date.toISOString(),
			},
		}));

	if (dealDoesExist) {
		deal.id = dealDoesExist.id;
	}

	const openDeals = await getOpenInventoryDeals(deal.vin).then(
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

	if (Array.isArray(openDeals) && openDeals.length > 0) {
		await closeDeals(openDeals.map((d) => d.id));
	}

	if (dealDoesExist) {
		await deleteDealTrades(deal.id);
		await deleteDealCharges(deal.id);
		await deleteDealSalesmen(deal.id);

		// Close the inventory
		if (inv) {
			await upsertInventory({
				vin: inv.vin,
				state: 0,
			});
		}

		updatedDeal = await updateDeal(deal, deal.finance);
	} else {
		deal.id = randomUUID();
		updatedDeal = await createDeal(deal, deal.finance);
	}

	if (!updatedDeal) {
		throw new Error("Failed to upsert deal!");
	}
	if (updatedDeal.creditorId) {
		await applyDefaultCharges(updatedDeal);
	}

	await createTrades(updatedDeal.id, trades || []);
	await createDealSalemen(updatedDeal.id, deal.salesmen || []);

	// TODO: notify Deal
	//

	console.debug({ updatedDeal });

	return updatedDeal;
};

export type UspertedDeal = AsyncReturnType<typeof upsertDeal>;
