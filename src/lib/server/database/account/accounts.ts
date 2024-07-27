import { prisma } from "$lib/server/database";
import type { Account, Prisma } from "@prisma/client";
import { orderContactsBy, contactSelect } from ".";
import { randomUUID } from "node:crypto";

export const getAccounts = async () => {
	return prisma.account.findMany({
		select: {
			id: true,
			contact: contactSelect,
			licenseNumber: true,
		},
		orderBy: orderContactsBy,
	});
};

export const getAccount = async ({ id }: { id: string }) => {
	return prisma.account.findFirst({
		where: {
			OR: [{ id }, { contact_id: id }],
		},
		include: { contact: true },
	});
};

export const getDetailedAccount = async ({
	id,
	contact,
}: { id?: string; contact?: string }) => {
	return prisma.account.findFirst({
		where: {
			OR: [{ id }, { contact_id: contact }],
		},
		include: { contact: true },
	});
};

export const upsertAccount = async (a: Partial<Account>) => {
	const exists = a.id && (await getAccount({ id: a.id }));
	const { contact_id, licenseNumber, licenseExpiration, ...rest } = a;
	if (exists) {
		return prisma.account.update({
			where: { id: exists.id },
			data: { licenseNumber, licenseExpiration, ...rest },
		});
	}

	const id = a.id || randomUUID();
	if (!contact_id || !licenseNumber || !licenseExpiration) {
		return new Error("Must provide contact id, license number, and expiration");
	}
	return prisma.account.create({
		data: {
			...rest,
			id,
			contact: {
				connect: { id: contact_id },
			},
			licenseNumber,
			licenseExpiration,
		},
	});
};

export type DetailedAccount = NonNullable<
	Prisma.PromiseReturnType<typeof getDetailedAccount>
>;
export type Accounts = Prisma.PromiseReturnType<typeof getAccounts>;
