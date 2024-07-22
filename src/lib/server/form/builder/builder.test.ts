import { getDetailedDeal } from "$lib/server/database/deal";
import { describe, it, assert, expect } from "vitest";
import { builder } from ".";
import type { StringObj } from "$lib/types";
import { getDR2395_2022Data } from "./maps/getDR2395_2022Template";
import { forms } from "$lib/types/forms";

const letters = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
];

describe("Can generate forms from pre-created deal", async () => {
	it("generates forms", async () => {
		const dealId = "c12ad1f1-a1f0-4f02-a99d-da7d4d27152d";
		const detailed = await getDetailedDeal({ id: dealId });

		assert(!!detailed, `Could not get a detailed deal by id: ${dealId}`);
		assert(!!detailed.inventory.vin, "Deal has no inventory vin");
		assert(!!detailed.account.contact, "Deal has no account contact");

		for await (const form of forms) {
			const builtForm = await builder({ deal: detailed, form: form.key });
			expect(builtForm).toBeTruthy();
		}
	});
});
