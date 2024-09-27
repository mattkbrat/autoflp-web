import type { Deal } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { DealFieldsWithFinance } from "$lib/finance/fields";

export const dealFieldsToDeal = (
	dealFields: DealFieldsWithFinance,
	state: number,
): Deal => {
	const { id, account, creditor, date, vin, finance } = dealFields;

	const isCredit = finance.type === "credit";
	const financeAmount: string = (isCredit ? finance.financeAmount : 0).toFixed(
		2,
	);
	const lieneAmount: string = (isCredit ? finance.totalLoan : 0).toFixed(2);
	const pmtAmount = isCredit ? finance.monthlyPayment.toFixed(2) : null;
	const down: string = Number(dealFields.priceDown || 0).toFixed(2);
	const cash: string = Number(dealFields.priceSelling || 0).toFixed(2);
	const apr: string = Number(dealFields.apr || 0).toFixed(2);
	const term: string = Number(dealFields.term || 0).toFixed(0);
	const taxCity: string = Number(dealFields.taxCity || 0).toFixed(2);
	const taxCounty: string = Number(dealFields.taxCounty || 0).toFixed(2);
	const taxRtd: string = Number(dealFields.taxRtd || 0).toFixed(2);
	const taxState: string = Number(dealFields.taxState || 0).toFixed(2);

	const deal: Deal = {
		state,
		id: id || randomUUID(),
		date: date.toISOString(),
		accountId: account,
		down_owed: dealFields.downOwed.toFixed(2),
		creditorId: creditor,
		cash,
		down,
		apr,
		finance: financeAmount,
		lien: lieneAmount,
		pmt: pmtAmount,
		term,
		taxCity,
		taxState,
		taxCounty,
		taxRtd,
		inventoryId: vin,
	};

	console.log("new deal params", deal);
	return deal;
};
