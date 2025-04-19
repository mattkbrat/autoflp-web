export const toTitleCase = (s: string) =>
	s
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0]?.toUpperCase() + word.slice(1))
		.join(" ");
