export const handleFetch = async (vin: string) => {
	const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;

	return fetch(url).then(async (res) => {
		if (!res.ok) return null;

		return await res.json();
	});
};
