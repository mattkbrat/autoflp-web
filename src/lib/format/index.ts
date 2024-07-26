import type { Person } from "$lib/server/database/models/Person";

type DealPerson = NonNullable<DetailedDeal>["account"]["contact"];

export type FullNameParams = {
	person: Person | DealPerson;
	format?: "firstLast" | "lastFirst";
	titleCase?: boolean;
};

import { fullNameFromPerson } from "./fullNameFromPerson";
import { addressFromPerson } from "./addressFromPerson";

export { fullNameFromPerson, addressFromPerson };

import { format } from "date-fns";
import type { DetailedDeal } from "$lib/server/database/deal";

const currencyFormat = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "America/Denver",
});

export const formatCurrency = (
	amount: string | number | undefined,
	blankZeroes = true,
) => {
	if (!amount || Number.isNaN(Number(amount))) return "-";
	if (+amount === 0 && blankZeroes) return "-";
	const formatted = currencyFormat.format(Number(amount || 0));
	return `${formatted[0]} ${formatted.slice(1)}`;
};

export const dateFormatStandard = "MM/dd/yyyy";

export const formatDate = (
	date: string | Date,
	withTime = false,
	formatStr = "E, LLL d, y",
) => {
	return withTime
		? dateTimeFormat.format(new Date(date))
		: format(date, formatStr);
};
