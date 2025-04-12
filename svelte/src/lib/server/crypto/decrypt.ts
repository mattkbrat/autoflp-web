import { cryptr, cryptrCredit } from "./cryptr";
import type { keys } from "./key";

export function decrypt(text: string, key: keyof typeof keys = "default") {
	const crypt =
		key === "default" ? cryptr : key === "credit" ? cryptrCredit : null;

	if (!crypt) throw new Error("Invalid key provided");

	try {
		return crypt.decrypt(text);
	} catch {
		return "";
	}
}
