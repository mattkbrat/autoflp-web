import { redirect } from "@sveltejs/kit";

export const load = ({ locals }) => {
	return redirect(307, "/accounts/new");
};
