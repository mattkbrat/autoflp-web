import { describe, expect, it, vi } from "vitest";
import { handleFetch } from "./fetch";

const vin = "WAULC68EX3A357396";

describe("fetch test", async () => {
	it("can fetch", async () => {
		const fetched = await handleFetch(vin);
		expect(fetched).toHaveProperty("Count");
		expect(fetched.Count).toBeGreaterThan(0);
	});
});
