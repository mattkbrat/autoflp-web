import {
	BUSINESS_ADDRESS,
	BUSINESS_NAME,
	EMAIL,
	PHONE_NUMBER,
	PRIMARY_DEALER_NAME,
} from "$env/static/private";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { BuyersGuideTemplate } from "./maps";

export const fillBuyersGuideData = (deal: NonNullable<DetailedDeal>) => {
	return {
		"0": deal.inventory.make,
		"1": deal.inventory.model || "",
		"2": deal.inventory.make,
		"3": deal.inventory.vin,
		"4": BUSINESS_NAME,
		"5": BUSINESS_ADDRESS,
		"6": PHONE_NUMBER,
		"7": EMAIL,
	} satisfies Partial<BuyersGuideTemplate>;
};
