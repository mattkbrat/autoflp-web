import { cryptr } from "./cryptr";

export function encrypt(text: string) {
	return cryptr.encrypt(text);
}
