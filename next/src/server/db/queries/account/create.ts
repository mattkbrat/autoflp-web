import assert from "node:assert";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../..";
import { account, person } from "../../schema";

export const personSchema = createInsertSchema(person);
export const accountSchema = createInsertSchema(account);

export type AccountSchema = z.infer<typeof accountSchema>;
export type PersonSchema = z.infer<typeof personSchema>;

export const newAccount = z.object({
	account: accountSchema,
	person: personSchema,
});

export type NewAccount = z.infer<typeof newAccount>;

export const upsertAccount = async (o: NewAccount) =>
	db.transaction(async (tx) => {
		const exists = await tx.query.person.findFirst({
			with: {
				accounts: {
					columns: {
						id: true,
					},
				},
			},
			columns: {
				id: true,
			},
			where: (person, { eq, and, or }) =>
				or(
					eq(person.id, o.person.id),
					and(
						eq(person.lastName, o.person.lastName),
						eq(person.firstName, o.person.firstName),
						eq(person.address1, o.person.address1),
					),
				),
		});

		{
			const accountId = exists?.accounts[0]?.id;
			const personId = exists?.id;
			console.log("exists", exists, { accountId, personId });
			if (accountId && personId) {
				assert(o.person.id, "Missing person id");
				assert(o.account.id, "Missing account id");
				assert(o.account.contact, "Missing account id");

				await tx.update(person).set(o.person).where(eq(person.id, personId));
				await tx
					.update(account)
					.set(o.account)
					.where(eq(account.id, accountId));
				return { person: personId, account: accountId };
			}
		}

		o.person.id = o.person.id || randomUUID();
		o.account.id = o.account.id || randomUUID();
		const [newPerson] = await tx
			.insert(person)
			.values(o.person)
			.returning({ id: person.id, lastName: person.lastName });
		if (!newPerson?.id) throw new Error("Failed to create a contact");
		const [newAccount] = await tx
			.insert(account)
			.values(Object.assign(o.account, { contact: newPerson.id }))
			.returning({ id: account.id });

		if (!newAccount?.id) throw new Error("Failed to create account");

		return { person: newPerson, account: o.account.id };
	});
