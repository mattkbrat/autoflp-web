import {
	DEALER_ID,
	DEALER_NUMBER,
	PRIMARY_DEALER_NAME,
} from "$env/static/private";
import { addressFromPerson, formatCurrency, formatDate } from "$lib/format";
import { fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { Form } from "$lib/types/forms";
import type { GenerateFormParams } from "..";
import { generate } from "../generate";
import { getDR2395_2022Data, type DR2395_2022_DATA } from "./maps";

export const DR2395_2022 = (deal: NonNullable<DetailedDeal>) => {
	const personFullName = fullNameFromPerson({ person: deal.account.contact });
	const personAddress = addressFromPerson(deal.account.contact);
	const creditorAddress =
		deal.creditor && addressFromPerson(deal.creditor.contact);

	let vinSplit = deal.inventory.vin.split("");
	if (vinSplit.length !== 17) {
		console.log("Invalid vin lenth", deal.inventory.vin, vinSplit.length);
		for (let i = vinSplit.length; i < 18; i++) {
			vinSplit[i] = "X";
		}
	}

	const legalNames = [personFullName, deal.account.cosigner, personAddress.full]
		.filter(Boolean)
		.join("\n");

	const dateFormat = "MM/dd/yyyy";
	const date = formatDate(deal.date, false, dateFormat);
	const obj: Partial<DR2395_2022_DATA> = {
		"Vehicle Identification Number VIN_1": vinSplit[0],
		"Vehicle Identification Number VIN_2": vinSplit[1],
		"Vehicle Identification Number VIN_3": vinSplit[2],
		"Vehicle Identification Number VIN_4": vinSplit[3],
		"Vehicle Identification Number VIN_5": vinSplit[4],
		"Vehicle Identification Number VIN_6": vinSplit[5],
		"Vehicle Identification Number VIN_7": vinSplit[6],
		"Vehicle Identification Number VIN_8": vinSplit[7],
		"Vehicle Identification Number VIN_9": vinSplit[8],
		"Vehicle Identification Number VIN_10": vinSplit[9],
		"Vehicle Identification Number VIN_11": vinSplit[10],
		"Vehicle Identification Number VIN_12": vinSplit[11],
		"Vehicle Identification Number VIN_13": vinSplit[12],
		"Vehicle Identification Number VIN_14": vinSplit[13],
		"Vehicle Identification Number VIN_15": vinSplit[14],
		"Vehicle Identification Number VIN_16": vinSplit[15],
		"Vehicle Identification Number VIN_17": vinSplit[16],
		Year: deal.inventory.year,
		Make: deal.inventory.make,
		Body: deal.inventory.body,
		Model: deal.inventory.model,
		Color: deal.inventory.color,
		CWT: deal.inventory.cwt,
		"Dealer #": DEALER_NUMBER,
		"Date Purchased": date,
		"Legal Names as it Appears on Identification and Physical Address Owner's or Enity":
			legalNames,
		"DR 2421 Attached": "",
		//"Lease Buy-Out": "",
		// "Legal Names as it Appears on Identification and Physical Address of Lessee": legalNames,
		//"Indicate Alternate Address Here if The Registration Renewal Should be Sent to a Different Address": "",
		"First Lienholder Name and Address":
			`${personFullName}\n${personAddress.full}`.trim(),
		"Lien Amount": deal.lien ? formatCurrency(+deal.lien) : undefined,
		"Second Lienholder Name and Address": deal.account.cosigner,
		//"Lien Amount_2": "",
		//"Indicate Alternate Address Here if The Title Should be Sent to a Different Lienholder Address": "",
		//"Indicate Alternate Address Here if The Title Should be Sent to a Different Lienholder Address_2": "",
		Date: date,
		"Printed name of OwnerAgent as it appears on Identification:":
			personFullName,
		//"Colorado DL": "",
		//"Colorado ID": "",
		//Other: "",
		//Other_1: "",
		"ID #": deal.account.licenseNumber,
		Expires:
			deal.account.licenseExpiration &&
			formatDate(deal.account.licenseExpiration, false, dateFormat),
		DOB:
			deal.account.dateOfBirth &&
			formatDate(deal.account.dateOfBirth, false, dateFormat),
		Date_2: date,
		//"Previous Title Number": "",
		//"Title Number": "",
		//"Date Accepted": "",
		//"Purchase Price": "",
		//"Odometer Reading Indicator": deal.inventory.mileage,
		//GVWR: "",
		//"Fleet #": "",
		//"Unit #": "",
		//"First Lienholder": deal.creditor?.businessName,
		//"Second Lienholder": "",
		//"Lien File No._1": "",
		//"Lien File No._2": "",
		//"Lien Amount_3": "",
		//"Maturity Date": "",
		//"Date of Lien": "",
		//"Lien Amount_4": "",
		//"Maturity Date_2": "",
		//"Date of Lien_2": "",
		//"Taxes Paid": "",
		//"Filing Fees": "",
		//"Additional Comments": "",
		//"Clerks Initials": "",
		//"Owner or Agent Signature": "",
		//"Witness Signature": "",
		"Vehicle Identification Number": deal.inventory.vin,
		Year_2: deal.inventory.year,
		Make_2: deal.inventory.make,
		Model_2: deal.inventory.model,
		I_1: personFullName,
		// "Joint Tenancy With Rights of Survivorship_1": "",
		// "Tenancy in Common_1": "",
		// Date_3: "",
		// I_2: "",
		// "Joint Tenancy With Rights of Survivorship_2": "",
		// "Tenancy in Common_2": "",
		// Date_4: "",
		// I_3: "",
		// "Joint Tenancy With Rights of Survivorship_3": "",
		// "Tenancy in Common_3": "",
		// Date_5: "",
		// Signature1: "",
		// Signature2: "",
		// Signature3: "",
		//"Flex Fuel": "",
		"Fuel Type": deal.inventory.fuel,
		"Witness Printed Name": PRIMARY_DEALER_NAME,
		"Commercial Use": "",
		"Keep Colorado Wild": 1,
	};

	return obj;
};

export const builder = async ({
	deal,
	form,
	obj: initObj,
}: {
	deal?: NonNullable<DetailedDeal>;
	form: Form;
	obj?: GenerateFormParams["data"];
}) => {
	let obj: GenerateFormParams["data"] | null = initObj || null;

	if (!obj && deal) {
		switch (form) {
			case "Application for Title andor Registration 031522":
			case "DR2395_2022":
				obj = DR2395_2022(deal);
				break;
			case "Application":
			case "billing":
			case "Buyers Guide":
			case "Buyers Order":
			case "Cover":
			case "Disclosures":
			case "Down Payment Statement of Fact":
			case "Inventory":
			case "Joint Tenancy":
			case "One And The Same":
			case "Receipt":
			case "Sales Tax Receipt New":
			case "Sales Tax Statement":
			case "Security-1":
			case "Security":
		}
	}

	if (!obj) {
		console.error("Could not generate a data object, and one was not provided");
		return;
	}

	console.log("Using data obj", obj);

	return generate({ form, data: obj, attachments: [] });
};
