import { randomUUID } from "node:crypto";
import type { DealFields } from "$lib/finance";
import type { FinanceCalcCredit, FinanceCalcResult } from "$lib/finance/calc";
import { wrap } from "@mikro-orm/core";
import {
	getAccount,
	getAccounts,
	getCreditor,
	updateAccount,
	upsertAccount,
} from "../database/account";
import {} from "../database/deal";
import {
	deleteInventory,
	getSingleInventory,
	getTrades,
	update as updateInv,
} from "../database/inventory";
import { Deal } from "../database/models/Deal";
import { Inventory } from "../database/models/Inventory";

export const upsertDeal = async (
	deal: DealFields,
	finance: FinanceCalcResult,
) => {
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

	console.log("exists", dealDoesExist, deal.vin, deal.account, deal.date);

	const openDeals = await openInventoryDeals(deal.vin).then(
		(deals) => deal.id && deals.filter((d) => d.id !== deal.id),
	);
	const account = await getAccount(deal.account);

	const creditor = deal.term > 0 ? await getCreditor(deal.creditor) : null;

	let updatedDeal: Deal | null = null;

	if (!account) {
		console.error("No account for deal by id", account);
		return;
	}
	const inv = await getSingleInventory(deal.vin);
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
			await updateInv(
				inv.id,

				wrap(inv).assign({ state: 0 }),
			);
		}

		updatedDeal = await updateDeal({
			deal: dealDoesExist,
			account,
			inventory: inv,
			creditor,
			update: deal,
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
		});
	}

	if (updatedDeal.creditor) {
		await applyDefaultCharges(updatedDeal);
	}

	await createTrades(updatedDeal, deal.trades || []);
	await applySalesmen(updatedDeal, deal.salesmen || []);

	// TODO: notify Deal

	return updatedDeal;
};
