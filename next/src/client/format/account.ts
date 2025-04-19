import type { Person } from "~/server/db/queries/account/get";

export type FullNameParams = {
	person: Partial<Person>;
	format?: "firstLast" | "lastFirst";
	titleCase?: boolean;
	withCell?: boolean;
};

export const addressFromPerson = (person: Partial<Person>) => {
	const zip = [person.zipPostal, person.zip4].filter(Boolean).join("-");
	const line2 = [person.address2, person.address3].filter(Boolean).join(", ");
	const cityStateZip = `${person.city}, ${person.stateProvince} ${zip}`.trim();
	return {
		full: [person.address1, line2, cityStateZip].filter(Boolean).join(", "),
		street: person.address1,
		line2,
		city: person.city || "",
		state: person.stateProvince || "",
		zip,
		cityStateZip,
	};
};

export function fullNameFromPerson({
	person,
	format = "lastFirst",
	titleCase = true,
	withCell = false,
}: FullNameParams) {
	if (!person) return "";
	const {
		nameSuffix: suffix,
		lastName,
		firstName,
		middleInitial,
		namePrefix: prefix,
		phonePrimary: cell,
	} = person;

	let name = "";

	if (lastName && !firstName) {
		name = lastName;
	} else if (firstName && !lastName) {
		name = firstName;
	}

	// suffix first because it's more likely to be empty
	else if (format === "lastFirst") {
		name = [
			[prefix, lastName].filter(Boolean).join(" "),
			[firstName, middleInitial, suffix].filter(Boolean).join(" ") || undefined,
		]
			.filter(Boolean)
			.join(", ");
	} else {
		name = [
			prefix,
			firstName,
			middleInitial,
			lastName,
			suffix,
			withCell ? cell : undefined,
		]
			.filter(Boolean)
			.join(" ");
	}

	if (withCell) {
		name = `${name} - ${cell || "NO PHONE PRIMARY"}`.trim();
	}

	if (titleCase) {
	}

	return name;
}
