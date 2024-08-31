import { getPresignedUrl } from "$lib/server/s3";
import type { CreditApplicationWithData } from "$lib/types";
import { comClient } from "../..";
import type { CreditApplication } from "@prisma/autosales";

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

export const getApplication = async ({
	id,
}: { id: CreditApplication["id"] }) => {
	return comClient.creditApplication.findUnique({
		where: { id },
		include: {
			users: {
				select: {
					email: true,
					name: true,
					userImage: {
						select: {
							imageUserImageImageToimage: true,
						},
					},
				},
			},
		},
	});
};

export const getPresignedImages = async (
	application: CreditApplicationWithData,
) => {
	const images =
		application?.users.userImage.map((ui) => {
			const { source, url, title } = ui.imageUserImageImageToimage;
			const bucket = source.startsWith("r2") ? source.split("r2/")[1] : null;

			return {
				url,
				bucket,
				title,
			};
		}) || [];

	if (images.length > 0) {
		for (let n = 0; n < images.length; n++) {
			const { url, bucket } = images[n];
			if (!bucket) continue;

			const href = await getPresignedUrl(bucket, url);
			images[n].url = href;
		}
	}

	return images;
};
