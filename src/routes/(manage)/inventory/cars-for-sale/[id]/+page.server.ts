import {
	deleteImage,
	deleteImages,
	getSingleInventory as getComInventory,
	getSingleImage,
	updateInventory,
	upsertInventoryImage,
} from "$lib/server/database/com";
import { getSingleInventory } from "$lib/server/database/inventory";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { deleteFromBucket, listObjects, upload } from "$lib/server/s3";
import { env } from "$env/dynamic/private";
import { getCDNUrl } from "$lib/server/com";
import type { PageServerLoad } from "./$types";
import type { ArrayElement, ImageWithLogic } from "$lib/types";
import { notEmpty } from "$lib";

const imageRegex = /[\w-]+.(jpg|png|bmp)/g;

export const load: PageServerLoad = async ({ params }) => {
	const selected = await getComInventory(Number(params.id));
	if (!selected) {
		return redirect(307, "/inventory/cars-for-sale");
	}

	const cdnObjects = selected?.vin
		? (await listObjects(env.SALES_BUCKET, selected?.vin)) || []
		: [];

	// console.log(cdnObjects, "cdn");
	const local =
		selected.vin && (await getSingleInventory({ vin: selected.vin }));

	const { inventoryImages: images, ...data } = selected;

	const imagesWithLogic: ImageWithLogic[] = cdnObjects
		.map((i) => {
			const { Key } = i;
			if (!Key) return null;
			const matching = images.find(({ image: img }) => img.url.includes(Key));
			if (typeof matching === "undefined") {
				console.error("No image found for", Key);
				return null;
			}
			return {
				...i,
				...matching,
				render: false,
				replace: false,
				file: null,
			};
		})
		.filter(notEmpty);

	const badDb = images
		.map(({ image: img }) => {
			const cdnObject = cdnObjects.find(
				(o) => o.Key && img.url.includes(o.Key),
			);
			return typeof cdnObject === "undefined" ? img : null;
		})
		.filter(notEmpty);

	if (badDb.length > 0) {
		console.error("Found invalidated db images", badDb);
		await deleteImages({ ids: badDb.map((r) => r.id) });
	}
	imagesWithLogic.push({
		render: false,
		replace: true,
		file: null,
		id: -1,
		source: "",
		url: "",
		title: "",
	});
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

const getCDNFilename = (file: unknown) => {
	return typeof file === "string" && file.split("/").slice(-1)[0];
};

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
	const titleWithVin = `${vin}/${title}`;
	if (oldPath) {
		const filename = getCDNFilename(oldPath);
		if (filename) {
			await deleteFromBucket(env.SALES_BUCKET);
		}
	}

	const titleIsImageFile = imageRegex.test(titleWithVin);
	const filename = (
		titleIsImageFile ? titleWithVin : `${titleWithVin}.png`
	).replaceAll(" ", "-");
	const newUrl = getCDNUrl(filename);

	const sent = await upload({
		bucket: env.SALES_BUCKET,
		filename,
		file: new Uint8Array(await file.arrayBuffer()),
		contentType: file.type,
	});

	console.log("sent", sent.$metadata);

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
		const shouldDelete = data.delete === "on";
		const id = Number(data["image-id"]);
		const invId = Number(data["inv-image-id"]);
		if (Number.isNaN(id) || Number.isNaN(invId)) {
			return fail(400, {
				message: "Must provide image ID",
			});
		}
		if (shouldDelete) {
			const image = await getSingleImage({ id });
			const filename = getCDNFilename(image?.url);
			console.log("delete", data, filename);
			if (!filename) {
				return fail(400, {
					message: "Must provide filename",
				});
			}
			await deleteFromBucket(env.SALES_BUCKET, filename);
			await deleteImage({ id });
			return { deleted: id };
		}
		console.log("Saving image", data);
		const replaceImage = data["replace-image"] === "on";
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

		const shouldInsert =
			replaceResult?.result === "ok" && !Number.isNaN(inventoryId);

		if (!shouldInsert && !isNew) {
			return fail(400, {
				message: "nothing to do",
			});
		}

		await upsertInventoryImage({
			invImage: {
				id,
				order,
			},
			image: {
				id,
				url: replaceResult?.newUrl,
				title,
			},
		});
	},
	deleteImage: async ({ request }) => {
		const data = await request.formData();
	},
} satisfies Actions;
