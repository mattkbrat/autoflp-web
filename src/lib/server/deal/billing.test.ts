import { describe, expect, it, vi } from "vitest";
import { getGroupedBillableAccounts } from "./billing";

describe("Can run billing", async () => {
	it("gets grouped billable accounts", async () => {
		const groups = await getGroupedBillableAccounts();
		expect(Array.isArray(groups)).toBeTruthy();
	});
});
