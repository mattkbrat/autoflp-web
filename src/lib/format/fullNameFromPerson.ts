import type { FullNameParams } from ".";

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
		return name
			.split(" ")
			.filter(Boolean)
			.map((word) => word[0].toUpperCase() + word.slice(1))
			.join(" ");
	}

	return name;
}
