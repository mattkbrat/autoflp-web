import { describe, expect, it, vi } from "vitest";
import { handleFetch } from "./fetch";
import { fields, parseNHTSA } from "./parse";

const vin = "WAULC68EX3A357396";

describe("parse test", async () => {
	it("can parse", async () => {
		const fetched = await handleFetch(vin);
		const parsed = parseNHTSA(fetched);
		for (const field of fields) {
			expect(parsed?.wanted).toHaveProperty(field);
		}
	});
});
