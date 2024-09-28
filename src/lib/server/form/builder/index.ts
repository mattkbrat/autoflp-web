import type { FinanceCalcCredit, FinanceCalcResult } from "$lib/finance/calc";
import {
	dateFormatStandard,
	formatDate,
	fullNameFromPerson,
} from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { Form } from "$lib/types/forms";
import type { Inventory } from "@prisma/client";
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

type FormBuilderBaseParams = {
	form: Form;
	obj?: GenerateFormParams["data"];
	finance?: FinanceCalcResult;
};

export type DealFormParams = FormBuilderBaseParams & {
	deal: NonNullable<DetailedDeal>;
};

export type InventoryFormParams = FormBuilderBaseParams & {
	inventory: Partial<Inventory>;
};

type FormBuilderParams = DealFormParams | InventoryFormParams;

const getOutput = (p: FormBuilderParams) => {
	console.log({ p });
	const isDeal = "deal" in p;
	const isInventory = !isDeal && "vin" in p;
	const now = formatDate(isDeal ? p.deal.date : new Date(), "yy-MM-dd");

	let output = "";

	if (isDeal) {
		output = `${fullNameFromPerson({
			person: p.deal?.account.contact,
		})}/${now}/`;
	} else if (isInventory) {
		const {
			inventory: { make, model, year },
		} = p;
		output = make || model || year || "form";
	}
	return output.replaceAll(" ", "-").replaceAll(",", "");
};

export const builder = async (p: DealFormParams | InventoryFormParams) => {
	let obj: GenerateFormParams["data"] | null = p.obj || null;

	const output = getOutput(p);
	if (!obj && "deal" in p) {
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
				obj = fillSalesTaxStatement(p);
				break;
			case "Security":
				obj = fillSecurityData(p as DealFormParams) || [];
				break;
			case "Application":
			case "billing":
			case "Receipt":
			default:
				obj = [];
				break;
		}
	} else if (!obj && "inventory" in p) {
		switch (p.form) {
			case "Buyers Guide":
				obj = fillBuyersGuideData(p.inventory);
				break;
		}
	}

	if (!obj) {
		console.error("Could not generate a data object, and one was not provided");
		return;
	}

	console.log(p.form, obj);

	return generate({
		form: p.form,
		data: obj,
		attachments: [],
		output,
		id: "deal" in p ? p.deal.id : undefined,
	});
};
