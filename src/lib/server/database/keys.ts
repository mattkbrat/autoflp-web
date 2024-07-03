import { randomUUID } from "crypto";
import type { AsyncReturnType } from "$lib/types";
import { wrap } from "@mikro-orm/core";
import { orm } from ".";
import { decrypt, encrypt } from "../crypto";
import { Key } from "./models/Key";

export const createKey = async ({
	business,
	value,
	key,
	id,
}: { business: string; value: string; key: string; id?: string }) => {
	const exists = await getKeyValue(
		id ? { type: "id", id } : { type: "keyBusiness", key, business },
	);

	const thisKey = wrap(exists ? exists : new Key()).assign(
		{ business, key, value: encrypt(value) },
		{ em: orm.em },
	);

	if (!exists) {
		thisKey.id = randomUUID();
		await orm.em.insert(Key, thisKey);
	} else {
		await orm.em.persistAndFlush(thisKey);
	}

	return thisKey;
};

export const getKeyValue = async (
	q:
		| { type: "id"; id: string }
		| { type: "keyBusiness"; key: string; business: string },
) => {
	const found = await orm.em.findOne(
		Key,
		q.type === "id" ? { id: q.id } : { key: q.key, business: q.business },
	);
	if (!found) return null;
	found.value = decrypt(found.value);
	return found;
};

export const getKeys = async (business: string) => {
	return orm.em.find(Key, { business }).then((keys) =>
		keys.map((key) => {
			key.value = decrypt(key.value);
			return key;
		}),
	);
};
