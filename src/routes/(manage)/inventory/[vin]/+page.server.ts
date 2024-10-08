import { randomUUID } from "node:crypto";
import { fail } from "@sveltejs/kit";
import {
	deleteInventory,
	getSingleInventory,
	upsertInventory,
	type Inventory,
} from "$lib/server/database/inventory";
import type { Actions, PageServerLoad } from "./$types";
import { inventoryForms } from "$lib/types/forms";
import { builder } from "$lib/server/form/builder";
import { prisma } from "$lib/server/database";

export const load: PageServerLoad = async ({ params }) => {
	const inventory =
		params.vin === "new"
			? ({} as Inventory)
			: await getSingleInventory({ vin: params.vin });

	return {
		inventory,
	};
};

export const actions = {
	update: async ({ request }) => {
		const data = await request.formData();

		const id = data.get("id") as string;
		const vin = data.get("vin") as string;

		const inventory: Partial<Inventory> = {};
		inventory.id = (data.get("id") || randomUUID()) as string;
		inventory.body = data.get("body") as string;
		inventory.make = data.get("make") as string;
		inventory.model = data.get("model") as string;
		inventory.year = data.get("year") as string;
		inventory.vin = vin;
		inventory.fuel = data.get("fuel") as string;
		inventory.mileage = data.get("mileage") as string;
		inventory.cwt = data.get("cwt") as string;
		inventory.color = data.get("color") as string;
		inventory.cash = data.get("cash") as string;
		inventory.credit = data.get("credit") as string;
		inventory.down = data.get("down") as string;
		inventory.purchasePrice = data.get("purchasePrice") as string;
		inventory.datePurchased = data.get("datePurchased") as string;
		inventory.dateAdded = data.get("id") ? undefined : new Date().toISOString();
		inventory.dateModified = new Date().toISOString().split("T")[0];
		inventory.state = +((data.get("state") || "1") as string);

		const upserted = await upsertInventory(inventory);
		const salesmen = data.getAll("salesmen") as string[];

		await prisma.$transaction(async (tx) => {
			const { vin } = inventory;
			if (!vin) return;
			const existing = await tx.inventorySalesman
				.findMany({
					where: { vin },
				})
				.then((r) => r.map((r) => r.salesmanId));

			const removed = existing.filter((r) => !salesmen.includes(r));
			const created = salesmen.filter((r) => !existing.includes(r));

			console.log({ removed, newRows: created });
			if (removed.length > 0) {
				await tx.inventorySalesman
					.deleteMany({
						where: { salesmanId: { in: removed }, vin },
					})
					.then((e) => console.log("removed", e));
			} else {
				console.log("nothing to remove");
			}

			if (created.length > 0) {
				await tx.inventorySalesman
					.createMany({
						data: created.map((r) => {
							return { vin, salesmanId: r, id: randomUUID() };
						}),
					})
					.then((e) => console.log("created", e));
			} else {
				console.log("nothing to create");
			}
		});
		if (upserted instanceof Error) {
			return fail(400, {
				message: `Could not update inventory: ${upserted.message}`,
			});
		}

		console.log("res", upserted);
		return {
			data: upserted,
			method: id === upserted.id ? "update" : "insert",
		};
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const vin = data.get("vin") as string;
		if (!vin) return fail(400, { vin, missing: true });
		await deleteInventory(vin);
		return { delete: vin };
	},

	printForms: async ({ request }) => {
		const builtForms: string[] = [];
		const data = await request.formData();
		for await (const form of inventoryForms) {
			const built = await builder({
				form: form.key,
				inventory: {
					make: data.get("make") as string,
					model: data.get("model") as string,
					vin: data.get("vin") as string,
					year: data.get("year") as string,
				},
			}).then((form) => form?.output);

			if (!built) continue;
			builtForms.push(built);
		}

		console.log(builtForms);
		return {
			forms: builtForms || [],
			formsName: new Date().getTime(),
		};
	},
} satisfies Actions;
