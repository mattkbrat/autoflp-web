import { prisma } from "$lib/server/database";
import type { Person } from "@prisma/client";
import { orderContactsBy, contactSelect } from ".";
import { randomUUID } from "crypto";

export const getPeople = async () => {
	return prisma.person.findMany({
		select: contactSelect.select,
		orderBy: orderContactsBy,
	});
};

export const getPerson = async ({ id }: { id: string }) => {
	return prisma.person.findUnique({ where: { id } });
};

export const upsertPerson = async (p: Partial<Person>) => {
	const exists = p.id && (await getPerson({ id: p.id }));
	if (exists) {
		return prisma.person.update({
			where: { id: exists.id },
			data: p,
		});
	}
	const id = p.id || randomUUID();
	const { firstName, lastName, address_1, phonePrimary } = p;
	if (!firstName || !lastName || !address_1 || !phonePrimary) {
		return new Error(
			"Must provide first name, last name, address_1, and phonePrimary",
		);
	}
	return prisma.person.create({
		data: { ...p, id, firstName, lastName, address_1, phonePrimary },
	});
};
