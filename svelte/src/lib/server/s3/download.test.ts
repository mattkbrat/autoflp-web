import { describe, test, expect, assert } from "vitest";
import { downloadFromBucket } from "./downloadFromBucket";
import fs from "node:fs";

describe("Can download object from s3", async () => {
	const file = "Cover.pdf";
	const bucket = "forms";
	const outputFile = await downloadFromBucket({
		bucket,
		key: file,
		filename: file,
	});
	test("Can download file", () => {
		assert(typeof outputFile === "string", "Failed to create file");
		const file = fs.statSync(outputFile);
		expect(file.isFile()).toBeTruthy();
		expect(file.size).toBeGreaterThan(1000);
	});
});
