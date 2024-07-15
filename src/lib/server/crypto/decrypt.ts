import { cryptr } from "./cryptr";

export function decrypt(text: string) {
	return cryptr.decrypt(text);
}
