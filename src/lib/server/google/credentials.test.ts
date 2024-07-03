import { BUSINESS_NAME } from "$env/static/private";
import { assert, describe, expect, it } from "vitest";
import { authorize } from "./credentials";

describe("can authenticate", async () => {
	it("authorized", async () => {
		assert(!!BUSINESS_NAME, "Must provide a business name");
		const client = await authorize(BUSINESS_NAME);
		expect(client).toBeDefined();
	});
});
