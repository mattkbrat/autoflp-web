import { describe, it } from "vitest";
import { generate } from "./generate";
import type { GenerateFormParams } from ".";

describe("generate form test", async () => {
	it("can generate a form", async () => {
		const p: GenerateFormParams = {
			form: "DR2395_03-25-2025",
			data: [],
			attachments: [],
		};
		await generate(p);
	});
});
