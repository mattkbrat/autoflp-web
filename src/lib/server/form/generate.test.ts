import { describe, it } from "vitest";
import { generate } from "./generate";
import type { GenerateFormParams } from ".";

describe("generate form test", async () => {
	it("can generate a form", async () => {
		const p: GenerateFormParams = {
			form: "DR2383_032425",
			data: [],
			attachments: [],
		};
		await generate(p);
	});
});
