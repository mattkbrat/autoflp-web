import { decrypt, encrypt } from "$lib/server/crypto";
import { describe, expect, it } from "vitest";

describe("can encrypt and decrypt", () => {
	const text = "hello, world!";
	it("encrypts", () => {
		expect(encrypt(text)).toBeTypeOf("string");
	});
	it("decrypts", () => {
		expect(decrypt(encrypt(text))).toBeTypeOf("string");
	});
	it("decrypts and matched", () => {
		const encrypted = encrypt(text);
		const decrypted = decrypt(encrypted);
		expect(decrypted).toEqual(text);
	});
});
