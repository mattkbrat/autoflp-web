import crypto from "node:crypto";
import { IV_LENGTH, algorithm } from "$lib/server/crypto";
import { key } from "./key";

export function encrypt(text: string) {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + ":" + encrypted.toString("hex");
}
