export const fields = [
	"Make",
	"Model",
	"Model Year",
	"Body Class",
	"Fuel Type - Primary",
	"Gross Vehicle Weight Rating To",
] as const;

export const parseNHTSA = (response: unknown) => {
	const info: { [key: string]: string } = {};
	const wanted: { [key in (typeof fields)[number]]: string } = {
		Make: "",
		Model: "",
		"Model Year": "",
		"Body Class": "",
		"Fuel Type - Primary": "",
		"Gross Vehicle Weight Rating To": "",
	};
	if (typeof response !== "object" || response === null) {
		console.warn("Not an object", response);
		return null;
	}

	if (!("Results" in response) || !Array.isArray(response.Results)) {
		console.warn("invalid structure", response);
		return null;
	}

	for (const el of response.Results) {
		if (typeof el !== "object" || el === null) continue;
		const variable = el.Variable;
		const value = el.Value;
		if (
			typeof variable !== "string" ||
			typeof value !== "string" ||
			value === "Not Applicable" ||
			!value
		)
			continue;

		// @ts-expect-error: all fields are of type string
		const isWanted = fields.includes(variable);

		if (!isWanted) {
			info[variable] = value;
		} else if (variable === "Gross Vehicle Weight Rating To") {
			const weight = value.split(": ")[1]?.split(" ")[0]?.replaceAll(",", "");
			wanted[variable] = weight || "";
		} else {
			const wantedVariable = variable as (typeof fields)[number];
			wanted[wantedVariable] = value;
		}
	}

	return {
		wanted,
		info,
	};
};
