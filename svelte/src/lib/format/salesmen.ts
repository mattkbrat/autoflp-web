import type { InventorySalesmen } from "$lib/types";
import { fullNameFromPerson } from "./fullNameFromPerson";

export const formatSalesmen = (
	salesmen: InventorySalesmen,
	formatType: "firstName" | "contact" | "firstInitial",
) => {
	return salesmen
		?.flatMap((is) => {
			if (formatType === "contact")
				return fullNameFromPerson({ person: is.salesman.contact });
			const firstName = is.salesman?.contact?.firstName;
			if (formatType === "firstName") return firstName;
			return firstName.slice(0, 1);
		})
		.join(formatType === "contact" ? "; " : " & ");
};
