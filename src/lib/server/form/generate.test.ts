import { describe, it } from "vitest";
import { generate } from "./generate";
import type { GenerateFormParams } from ".";

describe("generate form test", async () => {
	it("can generate a form", async () => {
		const p: GenerateFormParams = {
			form: "receipt-old",
			data: ["first", "last", "123", "456"],
			attachments: [],
		};
		await generate(p);
	});
});
