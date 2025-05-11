import {
	BUSINESS_ADDRESS,
	BUSINESS_NAME,
	DEALER_NUMBER,
} from "$env/static/private";
import {
	addressFromPerson,
	dateFormatStandard,
	formatCurrency,
} from "$lib/format";
import { fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { Nullable } from "vitest";
import type { DR2395_2025Template } from "./maps";
import type { NullableProperties } from "$lib/types";
import { formatDate } from "date-fns";

export const DR2395_2025 = (deal: NonNullable<DetailedDeal>) => {
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

	const legalNames = [personFullName, deal.cosigner].filter(Boolean).join("; ");

	const date = formatDate(deal.date, dateFormatStandard);
	const { licenseExpiration, dateOfBirth, licenseNumber } = deal.account;
	const obj: NullableProperties<DR2395_2025Template> = {
		"Vehicle Year": deal.inventory.year,
		"Vehicle Make": deal.inventory.make,
		"Vehicle Model": deal.inventory.model,
		"Odometer Reading": deal.inventory.mileage,
		"Vehicle Body": deal.inventory.body,
		"Vehicle Color": deal.inventory.color,
		GVW: "",
		"Vehicle Size": "",
		"Fuel Type": deal.inventory.fuel,
		"Dealer Number": DEALER_NUMBER,
		"Purchase Date": date,
		MSRP: "",
		RadioButton1: "",
		RadioButton2: "",
		RadioButton3: "",
		RadioButton4: "",
		RadioButton5: "",
		RadioButton6: "",
		RadioButton7: "",
		RadioButton8: "",
		"Number of Seats": "",
		CWT: "",
		RadioButton9: "",
		RadioButton10: "",
		RadioButton11: "",
		RadioButton12: "",
		"D O T and E I N": "",
		RadioButton13: "",
		RadioButton14: "",
		RadioButton15: "",
		RadioButton16: "",
		"Legal Names from ID for Owner, Entity, or Lessor":
			deal.creditor?.businessName || BUSINESS_NAME,
		"Address of Owner, Entity or Lessor":
			creditorAddress?.full || BUSINESS_ADDRESS,
		"Legal Names from ID for Lessee": legalNames,
		RadioButton17: "",
		RadioButton18: "",
		"Physical Address of Lessee": personAddress.full,
		"Owner or Lessee Mailing Address": "",
		"First Lienholder Name": BUSINESS_NAME,
		"Address or E L T e-Number": BUSINESS_ADDRESS,
		"Lien Amount": formatCurrency(deal.lien),
		"Vehicle Identification Number": deal.inventory.vin,
		"Signature - Owner or Agent": "",
		"Date of Signature": date,
		"Printed Name of Owner or agent": legalNames,
		C1: "",
		C2: "",
		C3: "",
		Other: "",
		"I D Number": licenseNumber,
		Expires: licenseExpiration
			? formatDate(licenseExpiration, dateFormatStandard)
			: "",
		"Date of Birth": dateOfBirth
			? formatDate(dateOfBirth, dateFormatStandard)
			: "",
		"Witness Printed Name": witnessName,
		"Signature - Witness": "",
		"Date of Witness Signature": date,
		RadioButton21: "",
		RadioButton22: "",
		RadioButton19: "",
		RadioButton20: "",
		"Previous Title Number": "",
		"Title Number": "",
		"Taxes Paid": "",
		"Purchase Price pg 2": "",
		GVWR: "",
		"Fleet Number": "",
		"Unit Number": "",
		"Lien File Number First Lienholder": "",
		"Lien amount First Lienholder": "",
		"Maturity Date First Lienholder": "",
		"Date Accepted First Lienholder": "",
		"Date of Lien First Lienholder": "",
		"Additional Comments": "",
		"Clerk Initials": "",
	};

	return obj;
};
