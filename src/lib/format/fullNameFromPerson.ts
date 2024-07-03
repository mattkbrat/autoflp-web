import type { FullNameParams } from ".";

export function fullNameFromPerson({
	person,
	format = "lastFirst",
	titleCase = true,
}: FullNameParams) {
	const {
		nameSuffix: suffix,
		lastName,
		firstName,
		middleInitial,
		namePrefix: prefix,
	} = person;

	let name;

	// suffix first because it's more likely to be empty
	if (suffix && prefix) {
		if (format === "firstLast") {
			name = `${firstName} ${middleInitial} ${lastName} ${suffix} ${prefix}`;
		}
		name = `${prefix} ${lastName}, ${firstName} ${middleInitial} ${suffix}`;
	} else if (suffix) {
		if (format === "firstLast") {
			name = `${firstName} ${middleInitial} ${lastName} ${suffix}`;
		}
		name = `${lastName}, ${firstName} ${middleInitial} ${suffix}`;
	} else if (prefix) {
		if (format === "firstLast") {
			name = `${firstName} ${middleInitial} ${lastName} ${prefix}`;
		}
		name = `${prefix} ${lastName}, ${firstName} ${middleInitial}`;
	} else if (!middleInitial) {
		if (format === "firstLast") {
			name = `${firstName} ${lastName}`;
		}
		name = `${lastName}, ${firstName}`;
	} else {
		if (format === "firstLast") {
			name = `${firstName} ${middleInitial} ${lastName}`;
		}
		name = `${lastName}, ${firstName} ${middleInitial}`;
	}

	if (titleCase) {
		return name
			.split(" ")
			.map((word) => word[0].toUpperCase() + word.slice(1))
			.join(" ");
	}

	return name;
}
