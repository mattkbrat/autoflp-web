import type { Person } from "@prisma/client";

export const addressFromPerson = (person: Person) => {
	const zip = [person.zipPostal, person.zip_4].filter(Boolean).join("-");
	const line2 = [person.address_2, person.address_3].filter(Boolean).join(", ");
	const cityStateZip = `${person.city}, ${person.stateProvince} ${zip}`.trim();
	return {
		full: [person.address_1, line2, cityStateZip].filter(Boolean).join(", "),
		street: person.address_1,
		line2,
		city: person.city || "",
		state: person.stateProvince || "",
		zip,
		cityStateZip,
	};
};
