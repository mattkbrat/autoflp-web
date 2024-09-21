/**
 * @param monthsDelinquent
 * @returns "Good", "Delinquent", or "In-Default"
 */
export function getCustomerStatus(monthsDelinquent: number) {
	const months = monthsDelinquent >= 0 ? monthsDelinquent : 0;

	switch (Math.floor(months)) {
		case 1:
		case 2:
			return "Delinquent";
		case 0:
			return "Good";
		default:
			return "In-Default";
	}
}
