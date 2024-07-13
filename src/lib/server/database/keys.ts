import { randomUUID } from "node:crypto";
import { decrypt, encrypt } from "../crypto";
import { prisma } from ".";

export const createKey = async ({
	business,
	value,
	key,
	id,
}: { business: string; value: string; key: string; id?: string }) => {
  throw new Error("TODO")
};

export const getKeyValue = async (
	q:
		| { type: "id"; id: string }
		| { type: "keyBusiness"; key: string; business: string },
) => {
  throw new Error("TODO")
};

export const getKeys = async (business: string) => {
  throw new Error("TODO")
};
