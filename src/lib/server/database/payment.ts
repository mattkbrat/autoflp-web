import type { Payment } from "$lib/types";
import { db } from ".";

export const getPaymentsByDeal = (deal: string): Payment[] => {
	return db()
		.prepare("SELECT * FROM payment WHERE deal = ? order by date desc")
		.all(deal) as Payment[];
};
