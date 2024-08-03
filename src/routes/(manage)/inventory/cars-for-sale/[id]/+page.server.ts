import {
	getSingleInventory as getComInventory,
	updateInventoryImage,
} from "$lib/server/database/com";
import { getSingleInventory } from "$lib/server/database/inventory";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { deleteFromBucket, upload } from "$lib/server/s3";
import { env } from "$env/dynamic/private";
import { getCDNUrl } from "$lib/server/com";
import type { PageServerLoad } from "./$types";

const imageRegex = /[\w-]+.(jpg|png|bmp)/g;

export const load: PageServerLoad = async ({ params }) => {
	const selected = await getComInventory(Number(params.id));

	if (!selected) {
		return redirect(307, "/inventory/cars-for-sale");
	}
	const local =
		selected.vin && (await getSingleInventory({ vin: selected.vin }));

	console.log({ local, selected, images: selected.images });
	return {
		selected,
		local,
	};
};
type Result = Promise<
	| { result: "ok"; newUrl: string }
	| { result: "error"; code: number; message: string }
>;
const handleReplaceImage = async ({
	url,
	title,
	file,
}: {
	url: FormDataEntryValue;
	title: string;
	file: File;
}): Result => {
	const oldPath = url;
	if (typeof oldPath !== "string" || !oldPath) {
		return {
			result: "error",
			code: 400,
			message: "Image to replace is missing url.",
		};
	}
	const oldFilename = oldPath.split("/").slice(-1)[0];
	if (!oldFilename) {
		console.log("Invalid filename", { oldFilename, oldPath });
		return {
			result: "error",
			code: 400,
			message: `Image to replace hash invalid url: ${oldPath}`,
		};
	}

	const titleIsImageFile = imageRegex.test(title);
	const filename = encodeURIComponent(
		titleIsImageFile ? title : `${title}.png`,
	);
	const newUrl = getCDNUrl(filename);

	await deleteFromBucket(env.SALES_BUCKET, oldFilename);
	await upload({
		bucket: env.SALES_BUCKET,
		filename,
		file: new Uint8Array(await file.arrayBuffer()),
		contentType: file.type,
	});

	return { result: "ok", newUrl };
};

export const actions = {
	saveInv: async ({ request }) => {
		const data = await request.formData();
		console.log("save inv", data);
	},
	saveImage: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		console.log("Saving image", data);
		const replaceImage = data["replace-image"] === "on";
		const id = data["image-id"];
		if (typeof id !== "string" || !id) {
			return {
				result: "error",
				code: 400,
				message: "Image to replace is missing id.",
			};
		}
		const file =
			replaceImage && data.file instanceof Blob && data.file.size && data.file;
		if (replaceImage && !file) {
			return fail(400, {
				message: "Must provide a new image file when replacing an image.",
			});
		}
		const title = data.title;
		if (typeof title !== "string" || !title) {
			return fail(400, { message: "Must provide the image's title" });
		}

		const replaceResult = file
			? await handleReplaceImage({ url: data.url, title, file })
			: undefined;

		if (
			typeof replaceResult !== "undefined" &&
			replaceResult.result === "error"
		) {
			return fail(replaceResult.code, { message: replaceResult.message });
		}

		const order = Number.isNaN(Number(data.order)) ? 0 : Number(data.order);
		await updateInventoryImage(Number(id), {
			url: replaceResult?.newUrl,
			title,
			order,
		});
	},
	deleteImage: async ({ request }) => {
		const data = await request.formData();
		console.log("delete", data);
	},
} satisfies Actions;
