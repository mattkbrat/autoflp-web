import type { SelectedAccount } from "$lib/types";
import type { FormFields } from "$lib/types/forms";

export const fieldMap: FormFields<keyof SelectedAccount> = [
	[
		{ key: "firstName", label: "First Name" },
		{ key: "lastName", label: "Last Name" },
	],
	[
		{ key: "namePrefix", label: "Prefix" },
		{ key: "middleInitial", label: "MI" },
		{ key: "nameSuffix", label: "Suffix" },
	],
	[
		{ key: "address_1", label: "Addr. Line 1" },
		{ key: "address_2", label: "Line 2" },
		{ key: "address_3", label: "Line 3" },
	],
	[
		"city",
		{ key: "stateProvince", label: "State" },
		{ key: "zipPostal", label: "ZIP" },
		{ key: "zip_4", label: "+4" },
	],
	[
		{ key: "phonePrimary", label: "Primary Phone", type: "tel" },
		{ key: "phoneSecondary", label: "Secondary", type: "tel" },
		{ key: "phoneTertiary", label: "Tertiary", type: "tel" },
	],
	[
		{ key: "emailPrimary", label: "Primary Email", type: "email" },
		{ key: "emailSecondary", label: "Secondary", type: "email" },
	],
	[
		{ key: "licenseNumber", label: "License" },
		{ key: "licenseExpiration", label: "Exp.", type: "date" },
		{ key: "dateOfBirth", label: "DOB", type: "date" },
	],
];