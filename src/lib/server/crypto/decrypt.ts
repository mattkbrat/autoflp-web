import crypto from "node:crypto";
import { algorithm } from ".";
import { key } from "./key";

export function decrypt(text: string) {
	const textParts = text.split(":");
	const shifted = textParts.shift();
	if (!shifted) {
		throw new Error("failed to decrypt, invalid text");
	}
	const iv = Buffer.from(shifted, "hex");
	const encryptedText = Buffer.from(textParts.join(":"), "hex");
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}
