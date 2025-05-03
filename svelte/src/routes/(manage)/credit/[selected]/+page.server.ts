import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getApplication, getPresignedImages } from "$lib/server/database/com";
import { decrypt } from "$lib/server/crypto";
import { defaultCredit } from "$lib/templates";

export const load: PageServerLoad = async ({ params: { selected } }) => {
	if (selected === "blank") {
		return { application: defaultCredit, images: [] };
	}
	const id = Number(selected);
	if (Number.isNaN(id)) return redirect(307, "/credit");
	const application = await getApplication({ id: Number(selected) });

	if (application?.ssn) {
		application.ssn = decrypt(application.ssn, "credit");
	}

	const images = await getPresignedImages(application);

	return { application, images };
};
