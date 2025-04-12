import type { DetailedDeal, Payments } from "$lib/server/database/deal";
import { addMonths } from "date-fns";
import { amoritization } from "./amortization";

export const dealAmortization = (
	deal: NonNullable<DetailedDeal>,
	history: Payments,
) => {
	if (+deal.term === 0 || deal.pmt == null) {
		return null;
	}

	return amoritization({
		term: Number(deal.term),
		startDate: addMonths(deal.date, 1),
		apr: Number(deal.apr),
		balance: Number(deal.finance),
		pmt: Number(deal.pmt),
		history,
	});
};
