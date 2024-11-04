import {
	BUSINESS_CITY_STATE_ZIP,
	BUSINESS_MOTTO,
	BUSINESS_NAME,
	PHONE_NUMBER,
	STREET,
} from "$env/static/private";
import { getCustomerStatus } from "$lib/finance/status";
import {
	addressFromPerson,
	formatCurrency,
	formatDate,
	formatInventory,
	fullNameFromPerson,
} from "$lib/format";
import type { BillingAccounts } from "$lib/server/database/deal";
import type { Schedule } from "$lib/server/deal";
import { isBefore } from "date-fns";
import type { BillingTemplate } from "./maps";

type BillingDataElement = {
	schedule: Schedule;
	deal: NonNullable<BillingAccounts[number]>;
};

const today = new Date();

const fillBill = (
	{
		schedule: {
			schedule: { totalDiff, pmt, nextDueDate, schedule },
		},
		deal,
	}: BillingDataElement,
	index = 1 | 2 | 3,
) => {
	if (!deal) return {};
	const inventory = "inventory" in deal ? deal.inventory : deal;
	const history = schedule.filter((r) => r.paid);

	const totalDelinquent = totalDiff < 0 ? totalDiff * -1 : 0;

	const monthsDelinquent = Math.floor(totalDelinquent / pmt);

	const introText =
		monthsDelinquent === 0
			? "Your account is in good standing"
			: `${
					monthsDelinquent === 1
						? "You are 1 month late"
						: `You are ${monthsDelinquent} months delinquent`
				}\n( ${formatCurrency(totalDelinquent)} )`;

	const accountStatus = getCustomerStatus(monthsDelinquent);
	const { contact } = deal.account;
	const name = fullNameFromPerson({ person: contact });
	const address = addressFromPerson(contact);
	const formattedInv = formatInventory(inventory);
	const nextPmtText = `Next payment of ${formatCurrency(
		pmt,
	)} is due by ${formatDate(nextDueDate)} `;

	const [paymentBeginBal, paymentPayment, paymentEndBal, paymentMonths] =
		history.reduce(
			([beg, pay, end, month], curr, i) => {
				const last = history[i - 1];
				beg += `\n${formatCurrency(last?.owed || deal.finance || 0)} `;
				pay += `\n${formatCurrency(curr.paid)} `;
				end += `\n${formatCurrency(curr.owed)} `;
				month += `\n${curr.dateFmt} `;

				return [beg, pay, end, month];
			},
			["", "", "", ""] as [string, string, string, string],
		);

	const data = {
		0: BUSINESS_NAME.toUpperCase(),
		1: STREET.toUpperCase(),
		2: BUSINESS_CITY_STATE_ZIP.toUpperCase(),
		3: name.toUpperCase(),
		4: address.street.toUpperCase(),
		5: address.cityStateZip.toUpperCase(),
		6: formattedInv.toUpperCase(),
		7: `Account status: ${accountStatus}\n`,
		8: introText,
		9: nextPmtText,
		10: BUSINESS_NAME,
		11: BUSINESS_MOTTO,
		12: PHONE_NUMBER,
		13: paymentMonths,
		14: paymentBeginBal,
		15: paymentPayment,
		16: paymentEndBal,
	} satisfies Partial<BillingTemplate>;
	const entries = Object.entries(data).map(([k, v]) => {
		const startIndex = Number(k) % 17;
		const start = index > 1 ? 17 * (index - 1) : 0;
		const thisIndex = startIndex + start;

		return [thisIndex, v];
	});
	return Object.fromEntries(entries) as Partial<BillingTemplate>;
};

export type Schedules =
	| [BillingDataElement, BillingDataElement, BillingDataElement]
	| [BillingDataElement, BillingDataElement]
	| [BillingDataElement];

export const fillBilling = (schedules: Schedules): Partial<BillingTemplate> => {
	if (!schedules[0]) return {};
	const billOne = fillBill(schedules[0], 1);
	const billTwo = schedules[1] && fillBill(schedules[1], 2);
	const billThree = schedules[2] && fillBill(schedules[2], 3);

	// Two extra keys
	return Object.assign({}, billOne, billTwo, billThree, {
		"51": " ",
		"52": " ",
	}) satisfies Partial<BillingTemplate>;
};
