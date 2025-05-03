import { fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { DR2421_091523Template, OneAndTheSameTemplate } from "./maps";

export const fillOneAndTheSameData091523 = (
	deal: NonNullable<DetailedDeal>,
) => {
	const fullName = fullNameFromPerson({ person: deal.account.contact });
	return {
		Signature: "",
		"Last Name 2": fullName,
		"Last Name 3": "",
		RadioButton1: "",
		RadioButton2: "",
	} satisfies DR2421_091523Template;
};
