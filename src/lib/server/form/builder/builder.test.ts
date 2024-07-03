import { getDetailedDeal } from "$lib/server/database/deal";
import { describe, it, assert, expect } from "vitest";
import { builder } from ".";
import type { StringObj } from "$lib/types";
import { getDR2395_2022Data } from "./maps";

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

describe("Can generate application for title pdf from deal", async () => {
	it("generates the form", async () => {
		const dealId = "358b92c6-2bb4-4fcd-9b31-621dbc4dd0a7";
		// const detailed = await getDetailedDeal(dealId);

		// assert(!!detailed, `Could not get a detailed deal by id: ${dealId}`);
		// assert(!!detailed.inventory.vin, 'Deal has no inventory vin');
		// assert(!!detailed.account.contact, 'Deal has no account contact');
		//

		const baseObj = getDR2395_2022Data() as StringObj;

		const builtForm = await builder({ obj: baseObj, form: "DR2395_2022" });

		expect(builtForm).toBeTruthy();
	});
});
