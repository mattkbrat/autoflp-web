import { randomUUID } from "crypto";
import { describe, test, expect } from "vitest";
import { bucketExists } from "./bucket";

describe("Fetch buckets", async () => {
	const randomName = randomUUID();
	test("Non-existant bucket returns false", async () => {
		const doesExist = await bucketExists(randomName);
		expect(doesExist).toBeFalsy();
	});
	test("Existign bucket returns true", async () => {
		const doesExist = await bucketExists("forms");
		expect(doesExist).toBeTruthy();
	});
});
