import { describe, test, expect } from "vitest";
import { listObjects } from ".";

describe("Can conenct to s3", async () => {
	const matchingFiles = await listObjects("forms", "");

	test("Matching files is array", () => {
		expect(matchingFiles).toBeDefined();
		expect(matchingFiles?.length).toBeGreaterThan(0);
		console.log(matchingFiles);
	});
});
