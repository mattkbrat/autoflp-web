import type { Person } from "$lib/server/database/models/Person";

export const addressFromPerson = (person: Person) => {
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
