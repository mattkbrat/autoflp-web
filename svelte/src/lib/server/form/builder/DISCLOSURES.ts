import { PRIMARY_DEALER_NAME } from "$env/static/private";
import { dateFormatStandard, fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import { formatDate } from "date-fns";
import type { DisclosuresTemplate } from "./maps";

export const fillDisclosuresData = (deal: NonNullable<DetailedDeal>) => {
	return {
		"0": deal.inventory.vin,
		"1": PRIMARY_DEALER_NAME,
		"2": fullNameFromPerson({ person: deal.account.contact }),
		"3": formatDate(deal.date, dateFormatStandard),
	} satisfies Partial<DisclosuresTemplate>;
};
