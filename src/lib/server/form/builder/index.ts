import type { FinanceCalcCredit, FinanceCalcResult } from "$lib/finance/calc";
import {
	dateFormatStandard,
	formatDate,
	fullNameFromPerson,
} from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { Form } from "$lib/types/forms";
import type { GenerateFormParams } from "..";
import { generate } from "../generate";
import { fillBuyersGuideData } from "./BUYERS_GUIDE";
import { fillBuyersOrderData } from "./BUYERS_ORDER";
import { fillCoverData } from "./COVER";
import { fillDisclosuresData } from "./DISCLOSURES";
import { DR2395_2022 } from "./DR2395_2022";
import { fillOneAndTheSameData } from "./ONE_AND_THE_SAME";
import { fillSalesTax0024Data } from "./SALES_TAX_RECEIPT";
import { fillSecurityData } from "./SECURITY";
import { fillStatementOfFact } from "./STATEMENT_OF_FACT";

export type FormBuilderParams = {
	deal?: NonNullable<DetailedDeal>;
	form: Form;
	obj?: GenerateFormParams["data"];
	finance?: FinanceCalcResult;
};

export type DealFormParams = FormBuilderParams & {
	deal: NonNullable<DetailedDeal>;
};

export const builder = async (p: FormBuilderParams) => {
	let obj: GenerateFormParams["data"] | null = p.obj || null;

	if (!obj && p.deal) {
		switch (p.form) {
			case "DR2395_2022":
				obj = DR2395_2022(p.deal);
				break;
			case "Buyers Guide":
				obj = fillBuyersGuideData(p.deal);
				break;
			case "Buyers Order":
				obj = fillBuyersOrderData(p as DealFormParams);
				break;
			case "Cover":
				obj = fillCoverData(p as DealFormParams);
				break;
			case "Disclosures":
				obj = fillDisclosuresData(p.deal);
				break;
			case "Down Payment Statement of Fact":
				obj = fillStatementOfFact(p.deal);
				break;
			case "One And The Same":
				obj = fillOneAndTheSameData(p.deal);
				break;
			case "DR0024_2021":
				obj = fillSalesTax0024Data(p as DealFormParams);
				break;
			case "Sales Tax Statement":
				obj = [];
				break;
			case "Security":
				obj = fillSecurityData(p as DealFormParams);
				break;
			case "Inventory":
			case "Application":
			case "billing":
			case "Receipt":
			default:
				obj = [];
				break;
		}
	}

	if (!obj) {
		console.error("Could not generate a data object, and one was not provided");
		return;
	}

	console.log(p.form, obj);
	const output = `${fullNameFromPerson({
		person: p.deal?.account.contact,
	})}/${formatDate(p.deal?.date || new Date(), false, "yy-MM-dd")}/`
		.replaceAll(" ", "-")
		.replaceAll(",", "");

	return generate({
		form: p.form,
		data: obj,
		attachments: [],
		output,
	});
};
