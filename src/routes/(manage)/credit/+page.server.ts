import { getApplications } from "$lib/server/database/com";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const applications = await getApplications();
	return { applications };
};
