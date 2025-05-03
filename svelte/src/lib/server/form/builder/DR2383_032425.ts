import { dateFormatStandard, formatDate } from "$lib/format";
import { fullNameFromPerson } from "$lib/format";
import type { DetailedDeal } from "$lib/server/database/deal";
import type { DR2383_032425_Template, getDR2383_032425 } from "./maps";

export const fillDR2383_032425 = (deal: NonNullable<DetailedDeal>) => {
	const personFullName = fullNameFromPerson({ person: deal.account.contact });

	const vinSplit = deal.inventory.vin.split("");
	if (vinSplit.length !== 17) {
		console.log("Invalid vin lenth", deal.inventory.vin, vinSplit.length);
		for (let i = vinSplit.length; i < 18; i++) {
			vinSplit[i] = "X";
		}
	}

	const { year, make, model, vin } = deal.inventory;

	const date = formatDate(deal.date, dateFormatStandard);
	const obj: DR2383_032425_Template = {
		"Vehicle Year 5": year,
		"Vehicle Make 7": make,
		"Vehicle Model": model,
		"Full legal name as shown on ID 3": personFullName,
		RadioButton1: "",
		RadioButton2: "",
		"Date of Signature": date,
		"Signature - Owner": "",
		"Full legal name as shown on ID 4": "",
		"Date of Signature 7": "",
		"Signature 8": "",
		"Full legal name as shown on ID 5": "",
		"Date of Signature 8": "",
		"Signature 9": "",
		"Full legal name as shown on ID 6": "",
		"Date of Signature 9": "",
		"Signature 10": "",
		RadioButton3: "",
		RadioButton4: "",
		RadioButton5: "",
		RadioButton6: "",
		RadioButton7: "",
		RadioButton8: "",
		"Vehicle Identification Number": vin,
	};

	return obj;
};
