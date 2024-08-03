import {
	getSingleInventory as getComInventory,
	getSingleImage,
	insertInventoryImage,
	updateInventory,
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

	const { images, ...data } = selected;
	type ImageWithLogic = (typeof images)[number] & {
		render: boolean;
		replace: boolean;
		file: FileList | null;
	};

	const imagesWithLogic: ImageWithLogic[] = images.map((i) => {
		return {
			...i,
			render: false,
			replace: false,
			file: null,
		};
	});
	imagesWithLogic.push({
		render: false,
		replace: true,
		file: null,
		id: -1,
		source: "",
		url: "",
		inventory: null,
		order: null,
		title: "",
	});
	console.log({ local, selected, images: selected.images });
	return {
		selected: data,
		local,
		images: imagesWithLogic,
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
	vin,
}: {
	url: FormDataEntryValue;
	title: string;
	file: File;
	vin: string;
}): Result => {
	const oldPath = url;
	const titleWithVin = `${vin}-${title}`;
	// if (typeof oldPath !== "string" || !oldPath) {
	// 	return {
	// 		result: "error",
	// 		code: 400,
	// 		message: "Image to replace is missing url.",
	// 	};
	// }
	const oldFilename =
		typeof oldPath === "string" && oldPath.split("/").slice(-1)[0];
	if (oldFilename) {
		await deleteFromBucket(env.SALES_BUCKET, oldFilename);
		// console.log("Invalid filename", { oldFilename, oldPath });
		// return {
		// 	result: "error",
		// 	code: 400,
		// 	message: `Image to replace hash invalid url: ${oldPath}`,
		// };
	}

	const titleIsImageFile = imageRegex.test(titleWithVin);
	const filename = encodeURIComponent(
		titleIsImageFile ? titleWithVin : `${titleWithVin}.png`,
	);
	const newUrl = getCDNUrl(filename);

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
		const dataObject = Object.fromEntries(data);
		const { inventory, price, sold, ...update } = dataObject;
		if (Number.isNaN(+inventory)) {
			return fail(400, {
				message: "Must provide inventory ID",
			});
		}
		return updateInventory(+inventory, {
			...update,
			price: Number(price || 0),
			sold: sold === "on",
		});
	},
	saveImage: async ({ request }) => {
		const data = Object.fromEntries(await request.formData());
		console.log("Saving image", data);
		const replaceImage = data["replace-image"] === "on";
		const id = Number(data["image-id"]);
		const vin = data.vin;
		const url = data.url as string;
		const isNew = id === -1;
		const inventoryId =
			typeof data.inventory === "string" && Number(data.inventory);
		if ((replaceImage && Number.isNaN(inventoryId)) || (replaceImage && !vin)) {
			return fail(400, {
				message: "Must provide inventory ID and VIN",
			});
		}

		const file =
			replaceImage && data.file instanceof Blob && data.file.size && data.file;
		if (replaceImage && !file) {
			return fail(400, {
				message: "Must provide a new image file when replacing an image.",
			});
		}
		if (typeof data.title !== "string" || !data.title) {
			return fail(400, { message: "Must provide the image's title" });
		}
		const title = data.title;

		if (file && typeof vin !== "string") {
			return fail(400, { message: "Must provide the VIN" });
		}
		const replaceResult = file
			? await handleReplaceImage({ url, title, file, vin: vin as string })
			: undefined;

		if (
			typeof replaceResult !== "undefined" &&
			replaceResult.result === "error"
		) {
			return fail(replaceResult.code, { message: replaceResult.message });
		}

		const order = Number.isNaN(Number(data.order)) ? 0 : Number(data.order);

		if (!isNew) {
			console.log("Updating com inv", { replaceResult, title, order, id });
			await updateInventoryImage(id, {
				url: replaceResult?.newUrl,
				title,
				order,
			});
		} else if (replaceResult?.result === "ok" && !Number.isNaN(inventoryId)) {
			console.log("Inserting new com inv", { replaceResult, title, order });
			await insertInventoryImage({
				url: replaceResult.newUrl,
				title,
				order,
				inventory: inventoryId as number,
			});
		} else {
			return fail(400, {
				message: "nothing to do",
			});
		}
	},
	deleteImage: async ({ request }) => {
		const data = await request.formData();
		console.log("delete", data);
	},
} satisfies Actions;
