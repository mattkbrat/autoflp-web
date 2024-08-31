import { comClient } from "../..";
export const getApplications = async () => {
	return comClient.creditApplication.findMany({
		select: {
			timestamp: true,
			id: true,
			users: {
				select: {
					email: true,
					name: true,
				},
			},
		},
		orderBy: {
			timestamp: "desc",
		},
	});
};
