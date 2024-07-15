import { randomUUID } from "node:crypto";
import { decrypt, encrypt } from "../crypto";
import { prisma } from ".";

export const createKey = async ({
	business,
	value,
	key,
	id,
}: { business: string; value: string; key: string; id?: string }) => {
	const encrypted = encrypt(value);
	return prisma.key.upsert({
		where: {
			key_business: {
				business,
				key,
			},
		},
		create: { business, key, value: encrypted, id: randomUUID() },
		update: { value },
	});
};

export const getKeyValue = async (
	q:
		| { type: "id"; id: string }
		| { type: "keyBusiness"; key: string; business: string },
) => {
	const existingKey = await prisma.key.findUnique({
		where:
			q.type === "id"
				? { id: q.id }
				: {
						key_business: {
							business: q.business,
							key: q.key,
						},
					},
	});

	if (!existingKey) return null;

	return decrypt(existingKey.value);
};

export const getKeys = async (business: string) => {
	return prisma.key.findMany({ where: { business } }).then((keys) => {
		return keys.map((key) => {
			const decrypted = key.value ? decrypt(key.value) : "";
			console.log("key", key, decrypted);
			return {
				...key,
				value: decrypted,
			};
		});
	});
};
