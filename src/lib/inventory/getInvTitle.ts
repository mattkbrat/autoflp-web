type Props = Nullable<
	Partial<{
		year: number | string;
		make: string;
		model: string;
		color: string;
	}>
>;

export function getInvTitle({ year, make, model, color }: Props) {
	const title = [[year, make, model].filter(Boolean).join(" "), color]
		.filter(Boolean)
		.join(", ")
		.trim()
		.toUpperCase();

	return title;
}
