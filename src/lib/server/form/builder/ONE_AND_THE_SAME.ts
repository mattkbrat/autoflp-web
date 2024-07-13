import { fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { BuyersGuideTemplate, OneAndTheSameTemplate } from "./maps";

export const fillOneAndTheSameData = (deal: NonNullable<DetailedDeal>) => {
	return {
		"0": fullNameFromPerson({ person: deal.account.contact }),
		"1": "",
	} satisfies Partial<OneAndTheSameTemplate>;
};
