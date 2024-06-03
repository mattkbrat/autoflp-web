import { format } from "date-fns";

const currencyFormat = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
	dateStyle: "long",
	timeStyle: "short",
	timeZone: "America/Denver",
});

export const formatCurrency = (amount: string | number) => {
	const formatted = currencyFormat.format(+amount);
	return `${formatted[0]} ${formatted.slice(1)}`;
};

export const formatDate = (date: string | Date, withTime = false) => {
	return withTime
		? dateTimeFormat.format(new Date(date))
		: format(date, "E, LLL d, y");
};
