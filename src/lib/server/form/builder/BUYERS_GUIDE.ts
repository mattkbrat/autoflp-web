import {
	BUSINESS_ADDRESS,
	BUSINESS_NAME,
	EMAIL,
	PHONE_NUMBER,
	PRIMARY_DEALER_NAME,
} from "$env/static/private";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { Inventory } from "@prisma/client";
import type { BuyersGuideTemplate } from "./maps";

export const fillBuyersGuideData = (
	deal: NonNullable<DetailedDeal> | Partial<Inventory>,
) => {
	const inventory = "inventory" in deal ? deal.inventory : deal;
	return {
		"0": inventory.make,
		"1": inventory.model || "",
		"2": inventory.year,
		"3": inventory.vin,
		"4": BUSINESS_NAME,
		"5": BUSINESS_ADDRESS,
		"6": PHONE_NUMBER,
		"7": EMAIL,
	} satisfies Partial<BuyersGuideTemplate>;
};
