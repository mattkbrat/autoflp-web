import { BUSINESS_NAME, DEALER_NUMBER } from "$env/static/private";
import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
	formatDate,
} from "$lib/format";
import { fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { DR2395_2022Template } from "./maps";

export const DR2395_2022 = (deal: NonNullable<DetailedDeal>) => {
	const personFullName = fullNameFromPerson({ person: deal.account.contact });
	const creditorName = deal.creditor?.businessName;
	const personAddress = addressFromPerson(deal.account.contact);
	const creditorAddress =
		deal.creditor && addressFromPerson(deal.creditor.contact);

	const salesman = deal.inventory.inventory_salesman?.[0]?.salesman.contact;

	const witnessName = salesman
		? fullNameFromPerson({
				person: salesman,
			})
		: "";

	const vinSplit = deal.inventory.vin.split("");
	if (vinSplit.length !== 17) {
		console.log("Invalid vin lenth", deal.inventory.vin, vinSplit.length);
		for (let i = vinSplit.length; i < 18; i++) {
			vinSplit[i] = "X";
		}
	}

	const legalNames = [personFullName, deal.cosigner, personAddress.full]
		.filter(Boolean)
		.join("\n");

	const date = formatDate(deal.date, dateFormatStandard);
	const obj: Partial<DR2395_2022Template> = {
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
		Body: deal.inventory.body || "",
		Model: deal.inventory.model || "",
		Color: deal.inventory.color || "",
		CWT: deal.inventory.cwt || "",
		"Dealer #": DEALER_NUMBER,
		"Date Purchased": date,
		"Legal Names as it Appears on Identification and Physical Address Owner's or Enity":
			legalNames,
		"DR 2421 Attached": "",
		//"Lease Buy-Out": "",
		// "Legal Names as it Appears on Identification and Physical Address of Lessee": legalNames,
		//"Indicate Alternate Address Here if The Registration Renewal Should be Sent to a Different Address": "",
		"First Lienholder Name and Address": `${creditorName || ""}\n${
			creditorAddress?.full || ""
		}`.trim(),
		"Lien Amount": deal.lien ? formatCurrency(+deal.lien) : undefined,
		"Second Lienholder Name and Address": deal.cosigner || "",
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
		Expires: deal.account.licenseExpiration || "",
		DOB: deal.account.dateOfBirth || "",
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
		Model_2: deal.inventory.model || "",
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
		"Fuel Type": deal.inventory.fuel || "",
		"Witness Printed Name": witnessName,
		"Commercial Use": "",
		"Keep Colorado Wild": "No",
		Snowmobile: "No_3",
		"Off-Highway Vehicle": "No_2",
		"Flex Fuel": "No",
		"Colorado DL": "Yes",
		"Lease Buy-Out":
			deal.creditor?.businessName !== BUSINESS_NAME ? "Yes" : "No",
	};

	return obj;
};
