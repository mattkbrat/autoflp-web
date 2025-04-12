export const stringToColorHex = (str: string) => {
	const hash = str.split("").reduce((hash, char) => {
		return char.charCodeAt(0) + ((hash << 5) - hash);
	}, 0);

	let color = "#";
	for (let i = 0; i < 3; i++) {
		const value = (hash >> (i * 8)) & 0xff;
		color += value.toString(16).padStart(2, "0");
	}
	return color;
};

export const stringToHash = (string: string): number => {
	let hash = 0;
	for (let i = 0; i < string.length; i++) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}

	return hash;
};

export const stringToColorHsl = (
	string: string,
	saturation = 100,
	lightness = 75,
	hash = stringToHash(string),
) => {
	return `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`;
};
