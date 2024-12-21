import { prisma } from "$lib/server/database";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { randomUUID } from "node:crypto";

const getSalesmenContactIds = async () => {
	return prisma.salesman
		.findMany({
			select: {
				contact: {
					select: {
						id: true,
					},
				},
			},
		})
		.then((r) => r.map((r) => r.contact.id));
};

export const load = async () => {
	const missingAccounts = await prisma.person.findMany({
		select: {
			id: true,
			lastName: true,
			firstName: true,
			account: {
				select: {
					id: true,
					licenseNumber: true,
				},
			},
		},
		where: {
			creditor: { none: {} },
		},
		orderBy: [
			{
				salesman: {
					id: "desc",
				},
			},
			{
				lastName: "asc",
			},
			{
				firstName: "asc",
			},
		],
	});

	const salesmen = await getSalesmenContactIds();
	return { missing: missingAccounts, salesmen };
};

export const actions = {
	save: async ({ request }) => {
		const data = await request.formData();
		const contactLinkIds = data.getAll("link-id") as string[];
		const salesmen = data.getAll("salesman") as string[];
		const primary = data.get("link-primary") as string;

		// Update account license numbers; create account if not exists.
		for (const [k, v] of data.entries()) {
			if (!k.endsWith("-license") || typeof v !== "string") continue;
			const contact = k.split("-license")[0];
			if (!contact) continue;
			await prisma.account.upsert({
				where: {
					contact_id: contact,
				},
				update: {
					licenseNumber: v,
				},
				create: {
					id: randomUUID(),
					contact_id: contact,
					licenseNumber: v,
				},
			});
		}

    // Merge accounts.
    // Find matching deals for non-primary accounts then update to use primary.
		if (contactLinkIds.length > 1) {
			if (!primary) {
				return fail(400, {
					message: "Select an account primary or unselect merging accounts.",
				});
			}
			await prisma
				.$transaction(async (cx) => {
					const accounts = await cx.account.findMany({
						where: {
							contact: {
								id: {
									in: contactLinkIds,
								},
							},
						},
						include: {
							deals: {
								select: {
									id: true,
									date: true,
									account: true,
									inventory: true,
								},
							},
							contact: {
								select: { id: true },
							},
						},
					});
					const primaryAccount = accounts.find((a) => a.contact.id === primary);
					if (!primaryAccount) {
						throw new Error("Invalid primary account");
					}

					const dealUpdates = accounts.reduce(
						(acc, account) => {
							for (const deal of account.deals) {
								const match = acc.find((d) => {
									return (
										d.inventory.id === deal.inventory.id && d.date === deal.date
									);
								});
								if (match) {
									console.log("match", match);
									continue;
								}
								acc.push(deal);
							}

							return acc;
						},
						[] as (typeof accounts)[number]["deals"],
					);

					await cx.deal.updateMany({
						where: {
							id: {
								in: dealUpdates.map((d) => d.id),
							},
						},
						data: {
							accountId: primaryAccount.id,
						},
					});

					const toDelete = contactLinkIds.filter((c) => c !== primary);

					await cx.person.deleteMany({
						where: {
							id: {
								in: toDelete,
							},
						},
					});

					await cx.account.deleteMany({
						where: {
							id: {
								in: accounts
									.filter((acc) => acc.id !== primaryAccount.id)
									.map((m) => m.id),
							},
						},
					});
				})
				.catch((e) => {
					console.log("Failed transaction", e);
					return fail(400, { message: e.message });
				});
		}

		// Update the salesmen
		const currentSalesmen = await getSalesmenContactIds();

		const newSalesmen = salesmen.filter((c) => !currentSalesmen.includes(c));
		const deleteSalesmen = currentSalesmen.filter((c) => !salesmen.includes(c));

		await prisma.salesman.deleteMany({
			where: {
				contactId: {
					in: deleteSalesmen,
				},
			},
		});
		await prisma.salesman.createMany({
			data: newSalesmen.map((s) => {
				return {
					id: randomUUID(),
					contactId: s,
					state: 1,
				};
			}),
		});

		return { success: true, timestamp: new Date().getTime() };
	},
} satisfies Actions;
